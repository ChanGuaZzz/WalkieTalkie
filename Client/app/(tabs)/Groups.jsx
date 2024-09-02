//Client/app/(tabs)/Groups.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { Ionicons } from '@expo/vector-icons';
import { useSocket } from '../../components/context/SocketContext';
import AudioComponent from '../../components/AudioComponent';
import axios from 'axios';
import getEnvVars from '../../config';
import ChatComponent from '../../components/ChatComponent';
import GroupIcon from '../../assets/images/groupicon.png';



export default function TabTwoScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const navigation = useNavigation(); // Use the useNavigation hook
  const [socket, setSocket] = useState(useSocket()); // Estado para manejar la instancia del socket
  const [currentRoom, setCurrentRoom] = useState(null);
  const [rooms, setRooms] = useState([{ name: 'room1' }, { name: 'room2' }, { name: 'room3' }, { name: 'room4' }, { name: 'room5' }]);
  const [roomsAmIn, setRoomsAmIn] = useState([]);
  const [username, setusername] = useState();
  const { SERVER_URL } = getEnvVars();

  useEffect(() => {
    if (socket != null) {
      console.log(socket, 'socket EN Groups');
    }
  }, []);

  useEffect(() => {
    if (socket != null) {
      console.log(socket, 'socket EN INDEX');
      axios.get(`http://localhost:3000/getsession`, { withCredentials: true })
        // axios.get(`${SERVER_URL}/getsession`, { withCredentials: true })
        .then((res) => { setusername(res.data.user.username); 
          setRoomsAmIn(JSON.parse(res.data.user.groups)); 
          
          console.log('Session', res.data) })
        .catch((error) => { console.log(error) });

    }
  }, [])

  useEffect(() => {
    if (!currentRoom) return;
    socket.emit('join', { room: currentRoom, username: username, });
    console.log('user ', username, ' Joined room ', currentRoom);
  }, [currentRoom]);

  useEffect(() => {
    console.log('roomsAmIn', roomsAmIn);
  }
    , [roomsAmIn]);




  return (
    <View style={tw`flex-1 items-center  bg-[${backgroundColor}]`}>


        {
          roomsAmIn && roomsAmIn.length == 0 ?
          <Text style={tw`text-[${textColor}]`}>No tienes grupos</Text> 
          :
          roomsAmIn.map((room, index) =>{ 

            const roomdata={
              name:room.name,
              profile:GroupIcon,
              room:room.name
            }

            return (
            <ChatComponent user={roomdata} key={index} onPress={() => navigation.navigate('ChatRoom', { user: roomdata })} icon='mic' />
            )
        })
          

          //   rooms.map((room, index) => (
          // <TouchableOpacity key={index} onPress={() => setCurrentRoom(room.name)} style={tw`mt-2 bg-slate-700 rounded-full p-2 `}>
          //       <Text style={tw`text-[${textColor}]`}>Ir a {room.name}</Text>
          //     </TouchableOpacity>
          // ))
        }





      <TouchableOpacity onPress={() => navigation.navigate('AddGroupsScreen')} style={tw`absolute bottom-12 right-5 px-4 py-2 bg-blue-500 rounded-full`}>
        <Ionicons name="person-add-outline" size={24} color={"white"} />
      </TouchableOpacity>
    </View>
  );
}


