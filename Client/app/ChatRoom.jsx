//Client/app/(tabs)/AddContactsScreen.jsx
import { React, useState, useEffect } from 'react';
import { View } from 'react-native';
import tw from 'twrnc';
import { useRoute } from '@react-navigation/native';
import { useThemeColor } from '../hooks/useThemeColor';
import AudioComponent from '../components/AudioComponent';
import axios from 'axios';

export default function ChatRoom() {
  const backgroundColor = useThemeColor({}, 'background');
  const route = useRoute();
  const { user } = route.params;
  console.log(route.params);
  const [currentRoom, setCurrentRoom] = useState(user.room);
  const [userID, setUserID] = useState();
  const [username, setUsername] = useState();

  useEffect(() => {
    console.log('ENTRA A CHATROOM');
    axios.get(`http://localhost:3000/getsession`, { withCredentials: true })
      // axios.get(`${SERVER_URL}/getsession`, { withCredentials: true })
      .then((res) => {
        setUserID(res.data.user.id); setUsername(res.data.user.username)
        console.log("SESSIONES EN CHATROOM", res.data);
      }).catch((error) => { console.log(error) });
  }, [])

  return (
    <View style={tw`flex-1 bg-[${backgroundColor}] items-center justify-center`}>
      {userID != undefined &&
        <AudioComponent currentRoom={currentRoom} userID={userID} />
      }
    </View>
  );
}