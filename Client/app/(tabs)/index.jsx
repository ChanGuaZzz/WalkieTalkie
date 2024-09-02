//Client/app/(tabs)/index.jsx
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState, useEffect, } from 'react';
import tw from 'twrnc';
import AudioComponent from '../../components/AudioComponent';
import { useThemeColor } from '../../hooks/useThemeColor';
import axios from 'axios';
import getEnvVars from '../../config';
import { useSocket } from '../../components/context/SocketContext';

const Index = () => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [recentRooms,setRecentRooms] = useState(['FakeRoomRecent']);
  const [userID, setUserID] = useState();
  const [username, setUsername] = useState();
  const { SERVER_URL } = getEnvVars();
  const [socket, setSocket] = useState(useSocket());
  const [modalVisible, setModalVisible] = useState(false);
  const [request, setRequest] = useState([{ senderId: null, receiverId: null, message: null }]);

  useEffect(() => {
    if (socket != null) {
      console.log(socket, 'socket EN INDEX');
      axios.get(`http://localhost:3000/getsession`, { withCredentials: true })
        // axios.get(`${SERVER_URL}/getsession`, { withCredentials: true })
        .then((res) => { setUserID(res.data.user.id); setUsername(res.data.user.username) })
        .catch((error) => { console.log(error) });

      socket.on('receive_request', (data) => {
        console.log('Solicitud recibida de:', data.senderId);
        setRequest(data);
        setModalVisible(true);
      });
    }
  }, [])

  const acceptRequest = (senderId) => {
    console.log('Solicitud aceptada de:', senderId);
    socket.emit('accept_request', { senderId: senderId, receiverId: username });
    setModalVisible(!modalVisible);
  }
 


  return (
    <View style={tw`flex-1 items-center justify-center bg-[${backgroundColor}]`}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={tw`flex-1 justify-center items-center`}>
          <View style={tw`bg-slate-400 shadow-2xl rounded-3xl p-10 items-center `}>
            <Text style={tw`text-2xl font-bold`}>@{request.senderId} </Text>
            <Text style={tw`text-lg font-semibold`}>Te ha enviado una solicitud</Text>
            <Text >"{request.message}"</Text>
            <View style={tw`flex flex-row`}>
              <TouchableOpacity
                style={tw`rounded-full bg-red-500 p-2 m-1`}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text style={tw`text-white font-bold`}> Decline </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={tw`rounded-full bg-green-500 p-2 m-1`}
                onPress={() => acceptRequest(request.senderId)}
              >
                <Text style={tw`text-white font-bold`}> Accept </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <View>
        <Text style={tw`text-[${textColor}] text-2xl font-bold my-4`}>Bienvenido {username} </Text>
        <Text style={tw`text-[${textColor}] text-center text-1xl font-bold`}>Recientes</Text>
        <View style={tw`flex flex-col items-center `}>
          {recentRooms.map((room, index) => (
            <TouchableOpacity key={index} onPress={() => setCurrentRoom(room)} style={tw`mt-2 bg-slate-700 rounded-full p-2 `}>
              <Text style={tw`text-[${textColor}]`}>Ir a {room}</Text>
            </TouchableOpacity>
          ))
          }
        </View>
        <Text style={tw`text-[${textColor}] mb-5 text-center`}>Sala actual {currentRoom} </Text>
      </View>
    </View>
  );
}

export default Index;