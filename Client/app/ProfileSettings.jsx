//ProfileSettings
import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import tw from 'twrnc';
import { useThemeColor } from '../hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const ProfileSettings = () => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const onChangePicture = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    console.log('ImagePicker result: ', result);

    if (result.assets && result.assets.length > 0) {
      const source = { uri: result.assets[0].uri };
      console.log('Selected image URI: ', source.uri);
      // Aquí se debe enviar la imagen al servidor =)
      
    } else {
      console.log('No image selected');
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={tw`flex-1 bg-[${backgroundColor}]`}>
        <View style={tw`w-full h-1/3 flex items-center justify-center`}>
          <View style={tw`bg-red-600 h-42 w-42 rounded-full relative`}>
            <TouchableOpacity onPress={onChangePicture} style={tw`bg-yellow-600 h-12 w-12 rounded-full absolute bottom-0 right-0 m-1 flex items-center justify-center`}>
              <Ionicons name="image-outline" size={24} color={textColor} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={tw`w-full flex items-center justify-center px-5 gap-5 `}>
          {/* User name */}
          <View style={tw`w-full flex flex-col items-start`}>
            <View style={tw`w-full flex flex-row items-center `}>
              <View style={tw`w-[10%] flex items-center`}>
                <Ionicons name="person-outline" size={20} color={textColor} />
              </View>
              <View style={tw`w-5/6 flex flex-col border-b border-gray-400 py-3 ml-2 `}>
                <View style={tw`flex-row w-full justify-between items-center`}>
                  <View>
                    <Text style={tw`text-[${textColor}] mb-1`}>User name</Text>
                    <Text style={tw`text-[${textColor}]`}>User name</Text>
                  </View>
                  <Ionicons name="build-outline" size={20} color={textColor} />
                </View>
              </View>
            </View>
          </View>
          {/* Email */}
          <View style={tw`w-full flex flex-col items-start`}>
            <View style={tw`w-full flex flex-row items-center `}>
              <View style={tw`w-[10%] flex items-center`}>
                <Ionicons name="mail-outline" size={20} color={textColor} />
              </View>
              <View style={tw`w-5/6 flex flex-col border-b border-gray-400 py-3 ml-2 `}>
                <View style={tw`flex-row w-full justify-between items-center`}>
                  <View>
                    <Text style={tw`text-[${textColor}] mb-1`}>Email</Text>
                    <Text style={tw`text-[${textColor}]`}>Email</Text>
                  </View>
                  <Ionicons name="build-outline" size={20} color={textColor} />
                </View>
              </View>
            </View>
          </View>
          {/* Password */}
          <View style={tw`w-full flex flex-col items-start`}>
            <View style={tw`w-full flex flex-row items-center `}>
              <View style={tw`w-[10%] flex items-center`}>
                <Ionicons name="key-outline" size={20} color={textColor} />
              </View>
              <View style={tw`w-5/6 flex flex-col border-b border-gray-400 py-3 ml-2 `}>
                <View style={tw`flex-row w-full justify-between items-center`}>
                  <View>
                    <Text style={tw`text-[${textColor}] mb-1`}>Password</Text>
                    <Text style={tw`text-[${textColor}]`}>Password</Text>
                  </View>
                  <Ionicons name="build-outline" size={20} color={textColor} />
                </View>

              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default ProfileSettings;