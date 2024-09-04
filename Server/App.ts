import express from 'express';
import session from 'express-session';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { Sequelize, DataTypes, Model, Op } from 'sequelize';
import bcrypt from 'bcrypt';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const sequelize = new Sequelize({
  database: 'walkietalkie',
  username: 'root',
  password: '',
  host: 'localhost',
  port: 3306,
  dialect: 'mysql',
  logging: false,
});

app.use(
  cors({
    origin: 'http://localhost:8081',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(
  session({
    secret: 'secreto',
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 día en milisegundos
      httpOnly: true,
      secure: false, // Establece a true si estás usando HTTPS
    },
    resave: true,
    saveUninitialized: false,
  })
);
// =================================================================
// * Users *
// =================================================================
class Users extends Model {
  declare id: number;
  declare username: string;
  declare info: string;
  declare email: string;
  declare password: string;
  declare groups: string;
  declare contacts: string;
  declare profilePicture: string;
  declare requests: string;

  // Method to set the password, hashes password and sets the password
  setPassword(password: string): void {
    const saltRounds = 10; // or another salt round as per security requirement
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    this.password = hashedPassword;
  }

  // Method to check the password against the hashed password
  checkPassword(password: string): boolean {
    const result = bcrypt.compareSync(password, this.password);
    console.log(`Checking password for ${this.username}: ${result} - ${this.password} - ${password}`); // Debug print
    return result;
  }

  // Method to set the groups, stringifies groups and sets the groups
  setgroups(groups: object): void {
    this.groups = JSON.stringify(groups);
  }
  // Method to set the contacts, stringifies contacts and sets the contacts
  setcontacts(contacts: object): void {
    this.contacts = JSON.stringify(contacts);
  }

  setrequests(requests: object): void {
    this.requests = JSON.stringify(requests);
  }

  toString(): string {
    return `<Users ${this.username}>`;
  }
}

Users.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    info: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    password: DataTypes.STRING(128),

    groups: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    contacts: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    requests: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    sequelize, // This is the sequelize instance
    modelName: 'Users',
    // Other model options go here
  }
);
// =================================================================
// * Rooms *
// =================================================================
class Rooms extends Model {
  declare id: number;
  declare name: string;
  declare info: string;
}

Rooms.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    info: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
  },
  {
    sequelize, // This is the sequelize instance
    modelName: 'Rooms',
    // Other model options go here
  }
);

// =================================================================
// * Login *
// =================================================================
app.post('/create-user', async (req, res) => {
  const userData = {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
  };
  try {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = await Users.create({
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
    });

    console.log('User created successfully:', newUser);
    res.status(201).send('User created successfully.');
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      const errorMessage = error.errors
        .map((err: any) => {
          if (err.path === 'username') {
            return 'Username already exists.';
          } else if (err.path === 'email') {
            return 'Email already exists.';
          }
          return 'Unique constraint error.';
        })
        .join(' ');

      console.error('Unique constraint error:', error);
      res.status(400).send(errorMessage);
    } else {
      console.error('Error creating user:', error);
      res.status(500).send('Failed to create user.');
    }
  }
});

app.post('/update-user', async (req, res) => {
  const { PropToChange, userID, newProp } = req.body;
  try {
    const user = await Users.findOne({ where: { id: userID } });
    if (!user) {
      return res.status(404).send('User not found.');
    }

    if (PropToChange === 'password') {
      user.setPassword(newProp);
    } else if (PropToChange === 'email') {
      user.email = newProp;
    } else if (PropToChange === 'info') {
      user.info = newProp;
    } else {
      return res.status(400).send('Invalid property to change.');
    }
    await user.save();
    res.status(200).send('User updated successfully.');
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Failed to update user.');
  }
});

app.get('/getsession', async (req, res) => {
  res.json(req.session);
});
//-----------------------------------------------------
app.post('/login', async (req, res) => {
  console.log('Entrando a login');

  const { username, password } = req.body;
  console.log(`Username: ${username}`);

  const user = await Users.findOne({
    where: {
      username: username,
    },
  });

  if (user && user.checkPassword(password)) {
    console.log('User found in database');
    user.dataValues.password = undefined; // Remove password from user info
    user.dataValues.groups = JSON.parse(user.dataValues.groups); // parsea los grupos de usuario
    user.dataValues.contacts = JSON.parse(user.dataValues.contacts); // Remove contacts from user info
    user.dataValues.requests = JSON.parse(user.dataValues.requests); // Remove contacts from user info
    console.log('UserValuesLISTOS:', user.dataValues);
    req.session.user = user.dataValues; // Store user info in session
    req.session.save();
    console.log('sesion guardada:', req.session);
    res.status(200).send('Login successful');
  } else {
    res.status(401).send('Invalid login');
  }
});

app.post('/refreshSession', async (req, res) => {
  const { id } = req.body;
  const user = await Users.findOne({
    where: {
      id: id,
    },
  });

  if (user) {
    user.dataValues.password = undefined; // Remove password from user info
    user.dataValues.groups = JSON.parse(user.dataValues.groups); // Remove groups from user info
    user.dataValues.contacts = JSON.parse(user.dataValues.contacts); // Remove contacts from user info
    user.dataValues.requests = JSON.parse(user.dataValues.requests); // Remove contacts from user info
    req.session.user = user.dataValues; // Store user info in session
    req.session.save();
    res.json(req.session);
  } else {
    res.status(401).send('Invalid login');
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).send('Could not log out.');
    } else {
      res.status(200).send('Logout successful');
    }
  });
});
// =================================================================Search Room=================================================================
app.post('/searchRoom', async (req, res) => {
  const { roomsearch, username } = req.body;
  console.log('server room: ' + roomsearch);

  const user = await Users.findOne({
    where: {
      username: username,
    },
  });
  let groupsofuser = [];
  let groupsofuserDB;

  if (user && user !== null && user.groups !== null) {
    groupsofuserDB = JSON.parse(user.groups);

    if (typeof groupsofuserDB === 'string') {
      groupsofuserDB = JSON.parse(groupsofuserDB);
    }
  }

  groupsofuser = groupsofuserDB.map((group: any) => group.name); // se obtienen los nombres de los grupos del usuario

  const rooms = await Rooms.findAll({
    where: {
      [Op.and]: [
        {
          name: {
            [Op.like]: `%${roomsearch}%`, // This will match any room that contains the search string
          },
        },
        {
          name: {
            [Op.notIn]: groupsofuser, // This will exclude the groups provided
          },
        },
      ],
    },
  });

  if (rooms.length > 0) {
    res.status(200).send(rooms); // Send back the list of matching rooms
  } else {
    res.status(404).send('No rooms found');
  }
});
// =================================================================
// =================================================================Search User=================================================================
app.post('/searchUser', async (req, res) => {
  const { usernamesearch, username } = req.body;
  console.log('server user: ' + usernamesearch);

  // Use the Op.like operator to search for usernames that contain the search string
  const user = await Users.findOne({
    where: {
      username: username,
    },
  });
  let contactsofuser = [];
  let contactsofuserDB;

  if (user && user !== null && user.contacts !== null) {
    contactsofuserDB = JSON.parse(user.contacts);

    if (typeof contactsofuserDB === 'string') {
      contactsofuserDB = JSON.parse(contactsofuserDB);
    }
  }

  contactsofuser = contactsofuserDB.map((contact: any) => contact.username); // se obtienen los nombres de los contactos del usuario

  const users = await Users.findAll({
    where: {
      [Op.and]: [
        {
          username: {
            [Op.like]: `%${usernamesearch}%`, // This will match any username that contains the search string
          },
        },
        {
          username: {
            [Op.notIn]: [username, ...contactsofuser], // This will exclude the username provided and those in contactsofuser
          },
        },
      ],
    },
  });

  if (users.length > 0) {
    res.status(200).send(users); // Send back the list of matching users
  } else {
    res.status(404).send('No users found');
  }
});

// =================================================================
// * Messages and socket.io*
// =================================================================

const connectedUsers: { [key: string]: string } = {};
const savecontacts = (user: any, usernameContact: string, currentRoom: any) => {
  // funcion para guardar los contactos en la base de datos
  if (user && user.contacts) {
    let contacts = JSON.parse(user.contacts);

    if (typeof contacts === 'string') {
      contacts = JSON.parse(contacts);
    }
    const contact = { username: usernameContact, room: currentRoom };
    if (!contacts.some((c: any) => c.username === contact.username && c.room === contact.room)) {
      // se verifica si el contacto ya esta en la lista ##AQUI VOY
      contacts.push(contact);
      user.setcontacts(contacts);
      user.save().then(() => {
        console.log('Los cambios han sido guardados exitosamente.');
      });
    } else {
      console.log('Ya esta en con el contacto');
    }
  }
};
io.on('connection', (socket: Socket) => {
  console.log('sockets activoOOOOOOOOOOOOOOOOOOOOOOOOOOs:', io.sockets.sockets.size);
  const groups = socket.handshake.query.groups as string | undefined;
  const username = socket.handshake.query.username as string | undefined;
  const contacts = socket.handshake.query.contacts as string | undefined;

  if (typeof groups === 'string' && groups.trim()) {
    try {
      JSON.parse(groups).map((group: any) => {
        socket.join(group.name);
        console.log('User joined group:', group);
      });
    } catch (error) {
      console.error('Error parsing groups:', error);
    }
  }
  if (typeof contacts === 'string' && contacts.trim()) {
    try {
      JSON.parse(contacts).map((contact: any) => {
        if (contact.room) {
          socket.join(contact.room);
          console.log('User joined room:', contact.room);
        } else {
          console.log('No se encontro la sala');
        }
      });
    } catch (error) {
      console.error('Error parsing groups:', error);
    }
  }

  console.log('User connected:', socket.id);
  if (username) {
    connectedUsers[username] = socket.id;
    console.log(`Usuario registrado: ${username} con socket ID: ${socket.id}`);
    console.log('Usuarios conectadossssssssssssssss:', connectedUsers);
  }

  // =================================================================
  // *Socket Join room*
  // =================================================================
  socket.on('join', async (data) => {
    const room = data.room; // Nombre de la sala a la que se une
    // const forContacts = data.forContacts;
    socket.join(room);
    console.log('salas', socket.rooms);
    console.log('Entra a una sala');
    console.log('Username:', data.username);

    // if(!forContacts){
    const user = await Users.findOne({
      where: {
        username: data.username,
      },
    });
    if (user && user.groups) {
      let groups = JSON.parse(user.groups);

      if (typeof groups === 'string') {
        groups = JSON.parse(groups);
      }
      const newgroup = { name: room };

      if (!groups.some((g: any) => g.name === newgroup.name)) {
        // se verifica si el grupo ya esta en la lista
        groups.push(newgroup);
        user.setgroups(groups);
        user
          .save()
          .then(() => {
            console.log('Los cambios han sido guardados exitosamente.');
            socket.emit('refreshgroups'); // se envia la señal para que se actualicen los grupos en tiempo real
          })
          .catch((error) => {
            console.error('Error al guardar los cambios: ', error);
          });
      } else {
        console.log('Ya esta en el grupo');
      }
    }
    // }
    socket.to(room).emit('notification', `${user ? user.username : 'null'} has entered the room.`);
    console.log(`${user ? user.username : 'null'} joined room: ${room}`);
  });
  // ======================*END Socket JOIN*===================

  // ============================= DELETE CONTACT ====================================

  socket.on('deleteContact', async (data) => {
    const { username, contact } = data;
    const userA = await Users.findOne({
      where: {
        username: username,
      },
    });
    const userB = await Users.findOne({
      where: {
        username: contact.name,
      },
    });

    if (userA && userA !== null && userA.contacts !== null && userB && userB !== null && userB.contacts !== null) {
      const senderSocketId = connectedUsers[userA.username];
      const receiverSocketId = connectedUsers[userB.username];

      let contactsUserA = JSON.parse(userA.contacts);
      let contactsUserB = JSON.parse(userB.contacts);
      if (typeof contactsUserA === 'string') {
        contactsUserA = JSON.parse(contactsUserA);
      }
      if (typeof contactsUserB === 'string') {
        contactsUserB = JSON.parse(contactsUserB);
      }
      contactsUserA = contactsUserA.filter((contactuserA: any) => contactuserA.room !== contact.room);
      contactsUserB = contactsUserB.filter((contactuserB: any) => contactuserB.room !== contact.room);
      userA.setcontacts(contactsUserA);
      userB.setcontacts(contactsUserB);
      userA.save();
      userB.save();
      console.log('Contacto eliminado');
      io.to(receiverSocketId).emit('refreshcontacts'); // se envia la señal para que se actualicen los contactos en tiempo real
      io.to(senderSocketId).emit('refreshcontacts'); // se envia la señal para que se actualicen los contactos en tiempo real
    } else {
      console.log('No se encontro el contacto');
    }
  });

  // =================================================================
  // *Socket send request*
  // =================================================================
  socket.on('send_request',async (data: { senderId: string; receiverId: string }) => {
    const { senderId, receiverId } = data;
    const receiverSocketId = connectedUsers[receiverId];

    const userA = await Users.findOne({ 
      where: { 
        username: receiverId 
      } 
    });

    const userB = await Users.findOne({
      where: {
        username: senderId,
      },
    });
    if (userA && userA !== null && userA.requests !== null && userB && userB !== null && userB.requests !== null) {
          let requestsA = JSON.parse(userA.requests);
          
          if (typeof requestsA === 'string') {
            requestsA = JSON.parse(requestsA);
          }
          const newrequest = { username: senderId, profile: userB.profilePicture };
          if (!requestsA.some((r: any) => r.username === newrequest.username)) {
            // se verifica si la solicitud ya esta en la lista
            requestsA.push(newrequest);
            userA.setrequests(requestsA);
            userA.save().then(() => {
              console.log('La solicitud ha sido guardada exitosamente.');
              io.to(receiverSocketId).emit('refreshrequests'); // se envia la señal para que se actualicen las solicitudes en tiempo real
            });
          } else {
            console.log('Ya esta en las solicitudes');
          }
    }

    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_request', { senderId });
      console.log(`Solicitud enviada de ${senderId} a ${receiverId}`);
    }
  });
  // ======================*END Socket send request*===================

  // =================================================================
  // *Socket Accept Request*
  // =================================================================

  socket.on('accept_request', async (data: { senderId: string; receiverId: string }) => {
    const { senderId, receiverId } = data;
    const senderSocketId = connectedUsers[senderId];
    const receiverSocketId = connectedUsers[receiverId];
    const currentRoom = `${senderId}-${receiverId}`;
    const senderSocket = io.sockets.sockets.get(senderSocketId);
    const receiverSocket = io.sockets.sockets.get(receiverSocketId);
    console.log('Entra a ACCEPT REQUEST');

    const userSender = await Users.findOne({
      where: {
        username: data.senderId,
      },
    });

    const userReceiver = await Users.findOne({
      where: {
        username: data.receiverId,
      },
    });


    savecontacts(userSender, data.receiverId, currentRoom);
    savecontacts(userReceiver, data.senderId, currentRoom);

    io.to(senderSocketId).emit('refreshcontacts'); // se envia la señal para que se actualicen los contactos en tiempo real

    if (receiverSocket !== undefined && userReceiver !== null) {
      receiverSocket.join(currentRoom);
      let requestsReceiver = JSON.parse(userReceiver.requests);

      if (typeof requestsReceiver === 'string') {
        requestsReceiver = JSON.parse(requestsReceiver);
      }

      const updatedRequests = requestsReceiver.filter((r: any) => r.username !== senderId);
      userReceiver.setrequests(updatedRequests);
      userReceiver.save().then(() => {
        console.log('La solicitud ha sido eliminada exitosamente.');
        io.to(receiverSocketId).emit('refreshcontacts'); // se envia la señal para que se actualicen las solicitudes en tiempo real
      });

    }
    if (senderSocketId && senderSocket !== undefined) {
      // senderSocket.emit('join', { currentRoom: currentRoom, userID: senderId, forContacts: true }); // el usuario que envio la solicitud se une a la sala con el usuario que acepto la solicitud
      senderSocket.join(currentRoom);
    }
    console.log(`Solicitud aceptada de ${receiverId} a ${senderId}`);
  });
  // ======================*END Socket accept request*===================

  // =================================================================
  // *Socket send audio*
  // =================================================================

  socket.on('send-audio', (audioData, room) => {
    // Emitir el audio recibido a todos los demás clientes conectados
    socket.to(room).emit('receive-audio', audioData, room);
    console.log('Audio data sent to all clients in room:', room);
  });

  socket.on('disconnect', (reason) => {
    console.log(`User disconnected del socket: ${socket.id} for ${reason}`);
    for (const username in connectedUsers) {
      if (connectedUsers[username] === socket.id) {
        delete connectedUsers[username];
        console.log(`Usuario desconectado: ${username}`);
        break;
      }
    }
  });
});

// ======================*END Socket send audio*===================

// socket.on('leaveAllRooms', (username) => {
//   const rooms = socket.rooms; // O cualquier otra lógica para identificar al usuario

//   // Iterar sobre todas las salas a las que el usuario está unido
//   for (let room of rooms) {
//     // Asegurarse de no sacar al usuario de su propia sala de socket
//     if (room !== socket.id) {
//       socket.leave(room);
//       console.log(`${username} left room ${room}`);
//     }
//   }

//   // Aquí puedes emitir un evento de confirmación si es necesario
//   // Por ejemplo, para confirmar que el usuario ha salido de todas las salas
//   socket.emit('leftAllRooms', { success: true });
// });

// =================================================================
// *Solicitudes de amistad*
// =================================================================

//==== fin solicitudes de amistad ===================================

const initialRooms = [
  // se crean las salas iniciales
  { name: 'ChatterBox Central', info: 'A lively place for all your chat needs.' },
  { name: 'Whispering Pines', info: 'A serene spot for quiet conversations.' },
  { name: 'Echo Chamber', info: 'Where your voice echoes through the room.' },
  { name: 'The Roaring Room', info: 'A place for loud and energetic discussions.' },
  { name: 'Vibe Tribe', info: 'Join the tribe and share the vibes.' },
  { name: 'The Sound Wave', info: 'Ride the wave of sound and communication.' },
  { name: 'Talk & Roll', info: 'Roll into conversations with ease.' },
  { name: 'The Hangout Spot', info: 'The perfect spot to hang out and chat.' },
  { name: 'Buzzing Beehive', info: 'A hive of buzzing conversations.' },
  { name: 'Chatty Café', info: 'Grab a coffee and chat away.' },
  { name: 'Frequency Friends', info: 'Tune in with friends on the same frequency.' },
  { name: 'The Social Hub', info: 'The hub for all social interactions.' },
  { name: 'Echo Base', info: 'A base for echoing thoughts and ideas.' },
  { name: 'Radio Rebels', info: 'Rebel against silence with radio waves.' },
  { name: 'Loud & Clear', info: 'Make your voice heard loud and clear.' },
  { name: 'Wavelength Warriors', info: 'Warriors on the same wavelength.' },
  { name: 'Chit Chat Lounge', info: 'Lounge around and chit chat.' },
  { name: 'The Pulse Room', info: 'Feel the pulse of the conversation.' },
  { name: 'Connection Corner', info: 'Connect with others in this corner.' },
  { name: 'Signal Station', info: 'Send and receive signals of communication.' },
  { name: 'The Banter Box', info: 'A box full of friendly banter.' },
  { name: 'The Talk Deck', info: 'Decked out for all your talking needs.' },
  { name: 'Airwave Alley', info: 'An alley of airwaves and conversations.' },
  { name: 'Chat Circuit', info: 'Complete the circuit with your chats.' },
  { name: 'SpeakEasy Lounge', info: 'Speak easy and relax in this lounge.' },
  { name: 'Harmony Haven', info: 'A haven for harmonious conversations.' },
  { name: 'The Chatter Zone', info: 'Enter the zone of endless chatter.' },
  { name: 'The Conversation Club', info: 'Join the club and start conversing.' },
  { name: 'Infinite Frequencies', info: 'Infinite frequencies for infinite talks.' },
  { name: 'WalkieTalkie Plaza', info: 'A plaza for walkie-talkie enthusiasts.' },
  { name: 'Talk Town', info: 'A town where talking never stops.' },
  { name: 'Comm Link Café', info: 'Link up and communicate over coffee.' },
  { name: 'Noise Nest', info: 'A nest of noise and lively discussions.' },
  { name: 'Vocal Vortex', info: 'Get caught in the vortex of voices.' },
  { name: 'Radio Roundtable', info: 'A roundtable for radio discussions.' },
  { name: 'The Echo Lounge', info: 'Lounge around and hear the echoes.' },
  { name: 'The Voice Vault', info: 'Vault your voice in this secure spot.' },
  { name: 'Chit Chat Chamber', info: 'A chamber for endless chit chat.' },
  { name: 'The Speak Spot', info: 'The spot for all your speaking needs.' },
  { name: 'Talk Tunnel', info: 'A tunnel of continuous talk.' },
  { name: 'The Sound Hub', info: 'The hub for all sound-related activities.' },
  { name: 'Vocal Valley', info: 'A valley filled with vocal expressions.' },
  { name: 'Waveform Workshop', info: 'Workshop your ideas in waveform.' },
  { name: 'Mic Masters', info: 'Masters of the microphone gather here.' },
  { name: 'Talk Together', info: 'Together we talk and share.' },
  { name: 'Resonance Room', info: 'A room where your voice resonates.' },
  { name: 'Broadcast Bunker', info: 'A bunker for broadcasting your thoughts.' },
  { name: 'The Gab Garage', info: 'A garage full of gab and chatter.' },
  { name: 'The Signal Shack', info: 'A shack for sending and receiving signals.' },
  { name: 'The Wave Room', info: 'Ride the waves of conversation.' },
  { name: 'Chatter Cave', info: 'A cave for all your chatter needs.' },
  { name: 'Transmit Tavern', info: 'Transmit your thoughts in this tavern.' },
  { name: 'Radio Ranch', info: 'A ranch for radio enthusiasts.' },
  { name: 'The Dial Den', info: 'Dial into conversations in this den.' },
  { name: 'The Talk Tower', info: 'Tower over conversations here.' },
  { name: 'Echo Escape', info: 'Escape into the echoes of voices.' },
  { name: 'Chat Commune', info: 'A commune for chat lovers.' },
  { name: 'The Transmission Terminal', info: 'Terminal for all your transmissions.' },
  { name: 'The Voiceover', info: 'Voice over your thoughts here.' },
  { name: 'The Walkie World', info: 'A world for walkie-talkie users.' },
  { name: 'Chatterbox Crew', info: 'Join the crew of chatterboxes.' },
  { name: 'Vibe Lounge', info: 'Lounge around and catch the vibes.' },
  { name: 'Radio Refuge', info: 'A refuge for radio conversations.' },
  { name: 'Buzz Room', info: 'A room buzzing with activity.' },
  { name: 'Talk Temple', info: 'A temple dedicated to talking.' },
  { name: 'Echo Enclave', info: 'An enclave for echoing voices.' },
  { name: 'The Conversation Station', info: 'Station for all your conversations.' },
  { name: 'Transmission Station', info: 'Station for transmitting your thoughts.' },
  { name: 'Talkwave Terrace', info: 'Terrace for talkwave enthusiasts.' },
  { name: 'The Sonic Sphere', info: 'A sphere of sonic discussions.' },
  { name: 'The Voice Vault', info: 'Vault your voice securely here.' },
];

sequelize.sync({ alter: true }).then(() => {
  app.listen(3000, async () => {
    console.log('Express Server running on port 3000');
    for (const room of initialRooms) {
      await Rooms.upsert(room);
    }
  });
  server.listen(3001, () => {
    console.log('Socket.io Server running on port 3001');
  });
});
