import { Text, TouchableOpacity, View, Vibration, Animated } from "react-native";
import tw from 'twrnc';
import { useThemeColor } from '../hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useRef } from 'react';
import UserProfileModal from './modals/UserProfileModal';

const ChatComponent = ({ user, onPress, icon, onAdd }) => {
  const textColor = useThemeColor({}, 'text');
  const [modalIconVisible, setModalIconVisible] = useState(false);

  const onDeleteFriend = () => {
    console.log('Friend deleted');
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
              <TouchableOpacity style={tw`px-5`} onPress={onDeleteFriend}>
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