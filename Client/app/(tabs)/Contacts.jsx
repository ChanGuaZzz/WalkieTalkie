//Client/app/(tabs)/Contacts.jsx
import { React, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { Ionicons } from '@expo/vector-icons';
import ChatComponent from '../../components/ChatComponent';
import UwUIcon from '../../assets/images/adaptive-icon.png';
import emoGirlIcon from '../../assets/images/emoGirlIcon.png';
import { useSocket } from '../../components/context/SocketContext';
import axios from 'axios';



export default function TabTwoScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const navigation = useNavigation(); // Use the useNavigation hook
  const [socket, setSocket] = useState(useSocket()); // Estado para manejar la instancia del socket
  const [contacts, setContacts] = useState([]);
  const [username, setUsername] = useState(null);
  const textColor = useThemeColor({}, 'text');
  const [userID, setUserID] = useState(null)

  useEffect(() => {
    if (socket != null) {
      console.log(socket, 'socket EN CONTACTS');

      axios.get(`http://localhost:3000/getsession`, { withCredentials: true })
        // axios.get(`${SERVER_URL}/getsession`, { withCredentials: true })
        .then((res) => {
          setUsername(res.data.user.username);
          setUserID(res.data.user.id)
          console.log('usuario definidon en contacts', res.data.user.username);
          const lastcontacts = JSON.parse(res.data.user.contacts).map((contact) => ({ // Parsea los contactos y los guarda en el estado SE DEBE HACER UN ENDPOINT PARA OBTENER LA FOTO DEL CONTACTO
            name: contact.username,
            room: contact.room,
            profile: contact.image ? { uri: contact.image } : emoGirlIcon,
          }));
          setContacts(lastcontacts)
        })
        .catch((error) => { console.log(error) });
    }
  }, []);

  useEffect(() => {
    if (userID != null) {
      socket.on('refreshcontacts', () => {
        console.log('REFRESH CONTACTS');
        axios.post(`http://localhost:3000/refreshSession`, { id: userID }, { withCredentials: true })
          .then((res) => {

            console.log('CONTACTS REFRESCADOOOOOOOOS', res.data.user.contacts);
            const lastcontacts = JSON.parse(res.data.user.contacts).map((contact) => ({ // Parsea los contactos y los guarda en el estado SE DEBE HACER UN ENDPOINT PARA OBTENER LA FOTO DEL CONTACTO
              name: contact.username,
              room: contact.room,
              profile: contact.image ? { uri: contact.image } : emoGirlIcon,
            }));

            console.log('LAST CONTACTS', lastcontacts);
            setContacts(lastcontacts)
          })
          .catch((error) => { console.log(error) });
      });
    }
  }, [userID]);

  useEffect(() => {
    console.log('CONTACTS', contacts);
  }, [contacts]);

  return (
    <View style={tw`flex-1 items-center  bg-[${backgroundColor}]`}>

      {contacts.length === 0 ?
        <Text style={tw`text-[${textColor}] text-2xl  mt-10 font-medium`}>No there contacts...</Text>
        :
        contacts.map((contact, index) => (
          <ChatComponent user={contact} key={index} onPress={() => navigation.navigate('ChatRoom', { user: contact })} iscontact={true} icon='mic' />
        ))
      }

      {/* Añadir contacto */}
      <TouchableOpacity onPress={() => navigation.navigate('AddContactsScreen')} style={tw`absolute bottom-12 right-5 px-4 py-2 bg-blue-500 rounded-full`}>
        <Ionicons name="person-add-outline" size={24} color={"white"} />
      </TouchableOpacity>
    </View>
  );
}


