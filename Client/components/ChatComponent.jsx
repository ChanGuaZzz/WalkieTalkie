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


const ChatComponent = ({ user, onPress, icon, onAdd, iscontact, isrequest }) => {
  const textColor = useThemeColor({}, 'text');
  const [modalIconVisible, setModalIconVisible] = useState(false);
  const [username, setusername] = useState();
  const [socket, setSocket] = useState(useSocket()); // Estado para manejar la instancia del socket
  const [userInfo, setUserInfo] = useState();

  useEffect(() => {
    axios.get(`http://localhost:3000/getsession`, { withCredentials: true })
      // axios.get(`${SERVER_URL}/getsession`, { withCredentials: true })
      .then((res) => {
        setusername(res.data.user.username);
        setUserInfo(res.data.user.info);
      })
      .catch((error) => { console.log(error) });
  }, []);

  useEffect(() => {
    if (isrequest) {
      user.name= user.username;
    }
  }, [isrequest]);

  const onClickButton = () => {
    if (iscontact) {
      socket.emit('deleteContact', { username: username, contact: user });
      console.log('Friend deleted', user.room);

      Vibration.vibrate(50);
    } else {
      console.log('group leaved');
      Vibration.vibrate(50);
    }
  }

  const onAccept = () => {
    socket.emit('acceptRequest', { username: username, contact: user.name });
    console.log('Friend added', user.room);
    Vibration.vibrate(50);
  }

  const onDecline = () => {
    socket.emit('declineRequest', { username: username, contact: user });
    console.log('Friend declined', user.room);
    Vibration.vibrate(50);
  }
  return (
    <TouchableOpacity onPress={onPress} style={tw`${isrequest?"px-4 py-2":"p-2"} border-b border-zinc-800 flex flex-row w-full max-w-[700px] justify-center items-center`}>
      <UserProfileModal
        user={user}
        modalIconVisible={modalIconVisible}
        setModalIconVisible={setModalIconVisible}
        iconSize={14}
        userInfo={userInfo}
      />
      <View style={tw`flex-1 flex-row items-center`}>
        <View style={tw`flex-1 flex-row  items-center justify-between`}>
          <View style={tw`ml-3 ${isrequest&&"w-[60%]"}`}>
            <Text style={[{ fontSize: 16 }, tw`font-bold text-[${textColor}]`]}>{user.name}</Text>
            {isrequest ? <Text style={tw`text-gray-400 `}>sent you a request</Text> 
            :<Text style={tw`text-gray-400 `}>Last time: "2 days ago"</Text>
            }
          </View>
          <View style={tw`${isrequest&&"w-[40%]"}`}>
            {icon == 'mic' && isrequest == undefined && (
              <TouchableOpacity style={tw`px-5`} onPress={onClickButton}>
                <Ionicons name="close-sharp" size={22} color={"red"} />
              </TouchableOpacity>

            )} {
              icon !== 'mic' && isrequest == undefined && (
                <TouchableOpacity style={tw`px-5`} onPress={onAdd}>
                  <Ionicons name="person-add" size={22} color={textColor} />
                </TouchableOpacity>)
            }
            {isrequest &&
              <View style={tw`flex-row`}>
                <TouchableOpacity style={tw`px-1`} onPress={onAccept}>
                  <Ionicons name="checkmark-circle-sharp" size={22} color={"green"} />
                </TouchableOpacity>
                <TouchableOpacity style={tw`px-1`} onPress={onDecline}>
                  <Ionicons name="close-circle-sharp" size={22} color={"red"} />
                </TouchableOpacity>
              </View>
            }
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ChatComponent;