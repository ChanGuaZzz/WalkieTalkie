import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '../hooks/useThemeColor';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import axios from 'axios';
import ChatComponent from './ChatComponent';
import { useSocket } from './context/SocketContext';


const RequestIcon = ({ handleLogout }) => {
  const textColor = useThemeColor({}, 'text');
  const SoftbackgroundColor = useThemeColor({}, 'Softbackground');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navigation = useNavigation(); // Use the useNavigation hook
  const [requestCount, setRequestCount] = useState(0);
  const [requests, setRequests] = useState([{}]);
  const [username, setUsername] = useState(null);
  const [socket, setSocket] = useState(useSocket()); // Estado para manejar la instancia del socket
  const [userID, setUserID] = useState(null)

  useEffect(() => {

    axios.get(`http://localhost:3000/getsession`, { withCredentials: true })
      .then((res) => {
        setUsername(res.data.user.username)
        setUserID(res.data.user.id)
        setRequests(JSON.parse(res.data.user.requests))
        setRequestCount(JSON.parse(res.data.user.requests).length)
      })
      .catch((error) => { console.log(error) });

  }, []);

  useEffect(() => { //Escucha el evento de refrescar contactos enviado desde el servidor
    if (userID != null) {
      socket.on('refreshcontacts', () => {
        axios.post(`http://localhost:3000/refreshSession`, { id: userID }, { withCredentials: true })
          .then((res) => {
            console.log('SESIONES REFRESCADOOOOOOOOS', res.data.user);
            setRequests(JSON.parse(res.data.user.requests).length > 0 ? JSON.parse(res.data.user.requests) : [])
            setRequestCount(JSON.parse(res.data.user.requests).length)
          })
          .catch((error) => { console.log(error) });
      });
    }
  }, [userID]);

  useEffect(() => {
    console.log('REQUESTS ACTUALIZADAS', requests);

  }, [requests]);



  return (
    <View style={tw`relative mx-3`}>
      <TouchableOpacity onPress={() => setDropdownVisible(!dropdownVisible)}>
        <View>
          <Ionicons name="notifications-outline" size={24} color={textColor} />
          {requestCount > 0 && (
            <View style={tw`absolute left-3 top-[-1] bg-red-600 rounded-full  w-[15px] h-[15px] justify-center items-center `} >
              <Text style={tw`text-white text-xs`}>{requestCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <Modal
        visible={dropdownVisible}
        transparent={true}
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={tw`flex-1 justify-start items-end pt-11 pr-2 `}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={tw` w-3/5 h-[400px] bg-[${SoftbackgroundColor}] rounded-md shadow-md `}>

            {requests.length > 0 ? (
              console.log('REQUESTS EN EL MAP', requests),
              requests.map((request, index) => (

                <ChatComponent user={request} key={index} isrequest={true} icon='mic' />

              )))
              :
              <View style={tw`flex-1 items-center justify-center`}>
                <Text style={tw`text-[${textColor}] text-2xl  mt-10 font-medium`}>No new requests...</Text>
              </View>

            }

          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default RequestIcon;
