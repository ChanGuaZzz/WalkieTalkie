import express from 'express';
import session from 'express-session';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { Sequelize, DataTypes, Model, Op } from 'sequelize';
import bcrypt from 'bcrypt';
import fs from 'fs'; //desinstalar y Borrar
import { Json } from 'sequelize/types/utils'; //desinstalar y Borrar
import { Z_DATA_ERROR } from 'zlib'; //desinstalar y Borrar

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const sequelize = new Sequelize({
  database: 'walkietalkie', // Replace with your database name
  username: 'root', // Replace with your database username
  password: '', // Replace with your database password, if any
  host: 'localhost',
  port: 3306, // Default MySQL port
  dialect: 'mysql', // Tell Sequelize which database dialect to use
  logging: false, // Disable logging; set to console.log to enable logging
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
// * Users and Login *
// =================================================================
class Users extends Model {
  declare id: number;
  declare username: string;
  declare email: string;
  declare password: string;
  declare groups: string;
  declare contacts: string;

  // Method to set the password, hashes password and sets the password
  setPassword(password: string): void {
    const saltRounds = 10; // or another salt round as per security requirement
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    this.password = hashedPassword;
  }
  // Example for updating a user's password
  // newUser.setPassword(newPlainTextPassword); // Hashes the new password and sets it
  // await newUser.save(); // Persists the change to the database

  // Method to check the password against the hashed password
  checkPassword(password: string): boolean {
    const result = bcrypt.compareSync(password, this.password);
    console.log(
      `Checking password for ${this.username}: ${result} - ${this.password} - ${password}`
    ); // Debug print
    return result;
  }

  setgroups(groups: object): void {
    this.groups = JSON.stringify(groups);
  }

  setcontacts(contacts: object): void {
    this.contacts = JSON.stringify(contacts);
  }

  // TypeScript representation of Python's __repr__ method
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
  },
  {
    sequelize, // This is the sequelize instance
    modelName: 'Users',
    // Other model options go here
  }
);

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

    console.log(`User created successfully:`, newUser);
    res.status(201).send('User created successfully.');
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Failed to create user.');
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
    user.dataValues.groups = JSON.parse(user.dataValues.groups); // Remove groups from user info
    user.dataValues.contacts = JSON.parse(user.dataValues.contacts); // Remove contacts from user info
    req.session.user = user.dataValues; // Store user info in session
    req.session.save();
    console.log('sesion guardada:', req.session);
    res.status(200).send('Login successful');
  } else {
    res.status(401).send('Invalid login');
  }
});

app.post('/refreshSession', async (req, res) => {
  const { username } = req.body;
  const user = await Users.findOne({
    where: {
      username: username,
    },
  });

  if (user) {
    user.dataValues.password = undefined; // Remove password from user info
    user.dataValues.groups = JSON.parse(user.dataValues.groups); // Remove groups from user info
    user.dataValues.contacts = JSON.parse(user.dataValues.contacts); // Remove contacts from user info
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
// class Messages extends Model {
//   declare id: number;
//   declare sender_id: number;
//   declare receiver_id: number;
//   declare content: string;
//   declare timestamp: Date;
//   declare room: string;

//   toString(): string {
//     return `<Messages ${this.id}>`;
//   }

//   serialize(): object {
//     return {
//       id: this.id,
//       sender_id: this.sender_id,
//       receiver_id: this.receiver_id,
//       content: this.content,
//       timestamp: this.timestamp.toISOString(),
//       room: this.room,
//     };
//   }
// }

// Messages.init(
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     sender_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: 'Users', // This is a reference to another model
//         key: 'id', // This is the column name of the referenced model
//       },
//     },
//     receiver_id: {
//       type: DataTypes.INTEGER,
//       allowNull: true,
//       references: {
//         model: 'Users',
//         key: 'id',
//       },
//     },
//     content: {
//       type: DataTypes.TEXT,
//       allowNull: false,
//     },
//     timestamp: {
//       type: DataTypes.DATE,
//       defaultValue: DataTypes.NOW,
//     },
//     room: {
//       type: DataTypes.STRING(100),
//       defaultValue: '0',
//     },
//   },
//   {
//     sequelize, // This is the sequelize instance
//     modelName: 'Messages',
//     timestamps: false,
//   }
// );

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
      console.log(
        'contacto incluye?',
        contacts.includes(contact),
        'contacto:',
        contact,
        'contacts:',
        contacts
      );
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
        socket.join(group);
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
  // *Socket send request*
  // =================================================================
  socket.on('send_request', (data: { senderId: string; receiverId: string }) => {
    const { senderId, receiverId } = data;
    const receiverSocketId = connectedUsers[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_request', { senderId });
      console.log(`Solicitud enviada de ${senderId} a ${receiverId}`);
    }
  });
  // ======================*END Socket send request*===================

  // =================================================================
  // *Socket Join room*
  // =================================================================
  socket.on('join', async (data) => {
    const currentRoom = data.currentRoom; // Nombre de la sala a la que se une
    socket.join(currentRoom);
    console.log('salas', socket.rooms);
    console.log('Entra a una sala');
    console.log('UserID:', data.userID);

    const user = await Users.findOne({
      where: {
        id: data.userID,
      },
    });
    if (user && user.groups) {
      let groups = JSON.parse(user.groups);

      if (typeof groups === 'string') {
        groups = JSON.parse(groups);
      }
      if (!groups.includes(currentRoom)) {
        groups.push(currentRoom);
        user.setgroups(groups);
        user
          .save()
          .then(() => {
            console.log('Los cambios han sido guardados exitosamente.');
          })
          .catch((error) => {
            console.error('Error al guardar los cambios: ', error);
          });
      } else {
        console.log('Ya esta en el grupo');
      }
    }
    socket
      .to(currentRoom)
      .emit('notification', `${user ? user.username : 'null'} has entered the room.`);
    console.log(`${user ? user.username : 'null'} joined room: ${currentRoom}`);
  });
  // ======================*END Socket JOIN*===================

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

    io.to(receiverSocketId).emit('refreshcontacts'); // se envia la señal para que se actualicen los contactos en tiempo real
    io.to(senderSocketId).emit('refreshcontacts'); // se envia la señal para que se actualicen los contactos en tiempo real

    if (receiverSocket !== undefined) {
      // receiverSocket.emit('join', { currentRoom: currentRoom, userID: receiverId, forContacts: true }); // el usuario que acepto la solicitud se une a la sala con el usuario que envio la solicitud
      receiverSocket.join(currentRoom);
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
sequelize.sync({ alter: true }).then(() => {
  app.listen(3000, () => {
    console.log('Express Server running on port 3000');
  });
  server.listen(3001, () => {
    console.log('Socket.io Server running on port 3001');
  });
});
