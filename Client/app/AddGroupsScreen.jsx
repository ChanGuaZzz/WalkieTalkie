//Client/app/(tabs)/AddGroupsScreen.jsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { useThemeColor } from '../hooks/useThemeColor';
import axios from "axios";
import ChatComponent from "../components/ChatComponent";
import GroupIcon from '../assets/images/groupicon.png';
import getEnvVars from "../config";
import { useSocket } from '../components/context/SocketContext';

export default function AddGroupsScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const SoftbackgroundColor = useThemeColor({}, 'Softbackground');
  const textColor = useThemeColor({}, 'text');
  const inputRef = useRef(null); // Create a ref for the TextInput
  const [text, setText] = useState(""); // Step 1: State for tracking text input
  const [roomFound, setroomFound] = useState(undefined); // Step 2: State to track if user is found
  const [username, setUsername] = useState();
  const [userID, setUserID] = useState(null)
  const [socket, setSocket] = useState(useSocket());
  const [rooms, setrooms] = useState([
    {
      name: "",
      profile: GroupIcon,
    },
  ]);

  useEffect(() => {
    axios.get(`http://localhost:3000/getsession`, { withCredentials: true })
      // axios.get(`${SERVER_URL}/getsession`, { withCredentials: true })
      .then((res) => { setUsername(res.data.user.username); setUserID(res.data.user.id) })
      .catch((error) => { console.log(error) });
  }, [])

  const { SERVER_URL } = getEnvVars();
  const onSearchRoom = () => {
    axios.post(`${SERVER_URL}/searchRoom`, { roomsearch: text, username: username })
      .then((res) => {
        console.log(res.data);
        const roomsData = res.data.map((room) => ({
          name: room.name,
          profile: room.image ? { uri: room.image } : GroupIcon,
        }));
        setrooms(roomsData);
        setroomFound(true);
      })
      .catch((err) => {
        console.error(err);
        setrooms([]);
        setroomFound(false);
      });
  };

  useEffect(() => {
    // Automatically focus the TextInput when the screen is loaded
    inputRef.current?.focus();
    if (socket != null) {
      console.log(socket, 'socket EN AddRoomsScreen');
    }
  }, []);


  // Solicitud de amistad
  const joinRoom = (room) => {
    socket.emit('join', { room: room, username: username, });
    setrooms(rooms.filter((roomadded) => roomadded.name !== room))

  };

  return (
    <View style={tw`flex-1 bg-[${backgroundColor}]`}>
      {/* Top Bar */}
      <View style={tw`w-full h-16 bg-[${SoftbackgroundColor}] flex items-center`}>
        <View style={tw`w-4/5 flex-row items-center`}>
          <TextInput
            style={tw`h-10 w-11/12 my-3 border-b border-gray-400 px-2 text-[${textColor}]`}
            placeholderTextColor="#9ca3af"
            placeholder="Buscar por grupo"
            autoFocus={true}
            value={text}
            onChangeText={(e) => {
              setText(e);
              setroomFound(undefined);
            }}
            onSubmitEditing={onSearchRoom}
          />
          {/* Renderizado condicional para el boton "X" */}
          {text.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setText("");
                setroomFound(undefined);
              }}
              style={tw`ml-2 p-2 w-1/12`}
            >
              <Text style={tw`text-lg text-[${textColor}]`}>X</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {/* Main Content */}
      <View style={tw`flex-1 items-center`}>
        {roomFound &&
          rooms.map((room, index) => (
            <ChatComponent
              key={room.id || index} // Ensure each child has a unique key
              user={room}
              onAdd={() => { joinRoom(room.name) }}
              icon="+"
            />
          ))}
        {roomFound == false && (
          <Text style={tw`text-[${textColor}]`}>
            No se encontraron usuarios
          </Text>
        )}
      </View>
    </View>
  );
}