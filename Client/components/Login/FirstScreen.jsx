//FirstScreen
import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { useThemeColor } from '../../hooks/useThemeColor';

const FirstScreen = ({ SetFirstScreen, SetLoginScreenState }) => {

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const GoLoginScreen = (register) => {
    SetFirstScreen(false);
    SetLoginScreenState(!register);
    console.log('FirstScreen --> SetLoginScreenState', !register);
  };

  return (
    <View style={tw`flex-1 w-full items-center justify-center bg-red-600`}>
      <Text style={tw`text-2xl text-{[${textColor}]}`}>First Screen</Text>
      <TouchableOpacity style={tw`bg-blue-500 p-2 mt-5`} onPress={() => GoLoginScreen(false)}>
        <Text style={tw`text-white`}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={tw`bg-blue-500 p-2 mt-5`} onPress={() => GoLoginScreen(true)}>
        <Text style={tw`text-white`}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FirstScreen;