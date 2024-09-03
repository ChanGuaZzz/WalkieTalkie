import { Text, TouchableOpacity, View, Vibration, Animated } from "react-native";
import tw from 'twrnc';
import { useThemeColor } from '../hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useRef } from 'react';
import UserProfileModal from './modals/UserProfileModal';
import axios from "axios";
import getEnvVars from '../config';
const { SERVER_URL } = getEnvVars();
import { useSocket } from '../components/context/SocketContext';


const ChatComponent = ({ user, onPress, icon, onAdd, iscontact }) => {
  const textColor = useThemeColor({}, 'text');
  const [modalIconVisible, setModalIconVisible] = useState(false);
  const [username, setusername] = useState();
  const [socket, setSocket] = useState(useSocket()); // Estado para manejar la instancia del socket
  const [userID, setUserID] = useState(null)


  useEffect(() => {
    axios.get(`http://localhost:3000/getsession`, { withCredentials: true })
        // axios.get(`${SERVER_URL}/getsession`, { withCredentials: true })
        .then((res) => { 
          setusername(res.data.user.username); 
          setUserID(res.data.user.id)
           })
        .catch((error) => { console.log(error) });
  }, []);

  useEffect(() => {
  }, [user]);

  const onClickButton = () => {
    if(iscontact){
     socket.emit('deleteContact', {username: username, contact: user });
      console.log('Friend deleted', user.room);

    Vibration.vibrate(50);
    }else{
      console.log('group leaved');
      Vibration.vibrate(50);
    }
  }
  return (
    <TouchableOpacity onPress={onPress} style={tw`p-2 flex flex-row w-full max-w-[700px] justify-center items-center`}>
      <UserProfileModal
        user={user}
        modalIconVisible={modalIconVisible}
        setModalIconVisible={setModalIconVisible}
        iconSize={14}
      />
      <View style={tw`flex-1 flex-row items-center`}>
        <View style={tw`flex-1 flex-row items-center justify-between`}>
          <View style={tw`ml-3`}>
            <Text style={[{ fontSize: 16 }, tw`font-bold text-[${textColor}]`]}>{user.name}</Text>
            <Text style={tw`text-gray-400`}>Last time: "2 days ago"</Text>
          </View>
          <View style={tw``}>
            {icon == 'mic' ? (
              <TouchableOpacity style={tw`px-5`} onPress={onClickButton}>
                <Ionicons name="close-sharp" size={22} color={"red"} />
              </TouchableOpacity>

            ) :
              <TouchableOpacity style={tw`px-5`} onPress={onAdd}>
                <Ionicons name="person-add" size={22} color={textColor} />
              </TouchableOpacity>
            }
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ChatComponent;