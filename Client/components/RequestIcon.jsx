import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '../hooks/useThemeColor';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import axios from 'axios';
import ChatComponent from './ChatComponent';

const RequestIcon = ({ handleLogout }) => {
  const textColor = useThemeColor({}, 'text');
  const SoftbackgroundColor = useThemeColor({}, 'Softbackground');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navigation = useNavigation(); // Use the useNavigation hook
  const [requestCount, setRequestCount] = useState(6);
  const [requests, setRequests] = useState([{username:"whyborn",room:"ff-gggggggg@ew.dw"},
                                            {username:"whn",room:"ff-dawdaw"},
                                            {username:"wwon",room:"dawdaw"},]);
  
  useEffect(() => {
     
    axios.get(`http://localhost:3000/getsession`, { withCredentials: true })
      .then((res) => {
        setUsername(res.data.user.username)
        setRequests(JSON.parse(res.data.user.requests))
        setRequestCount(JSON.parse(res.data.user.requests).length)
      })
      .catch((error) => { console.log(error) });

  }, []);

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

          {
          requests.map((request, index) => ( 
            <ChatComponent user={request} key={index} isrequest={true} icon='mic' />

          ))
          }
          
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default RequestIcon;
