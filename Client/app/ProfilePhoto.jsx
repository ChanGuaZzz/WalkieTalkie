import React from "react";
import { SafeAreaView, Image } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import tw from "twrnc";
import { useThemeColor } from "../hooks/useThemeColor";
import UwUIcon from '../assets/images/adaptive-icon.png';

const ProfilePhoto = () => {
  const backgroundColor = useThemeColor({}, "background");
    
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={tw`flex-1 bg-[${backgroundColor}] justify-center items-center`}>
        <Image
          source= {UwUIcon}
          style={tw` h-1/2`}
          resizeMode="cover"
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default ProfilePhoto;