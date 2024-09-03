import React from "react";
import { Modal, View, Text, TextInput, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import tw from "twrnc";
import { useThemeColor } from "../../hooks/useThemeColor";

const ChangeProfileModal = ({ PropToChange, setModalVisibility, ModalIcon, isPassword }) => {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  return (
    <Modal animationType="fade" transparent={true} onRequestClose={() => setModalVisibility(false)}>
      <TouchableOpacity
        style={tw`flex-1 justify-end bg-black bg-opacity-50`}
        activeOpacity={1}
        onPressOut={() => setModalVisibility(false)}
      >
        <View style={tw`bg-[${backgroundColor}] rounded-t-lg p-4`} onStartShouldSetResponder={() => true}>
          <Text style={tw`text-lg font-bold mb-4 text-[${textColor}]`}>Change your {PropToChange}</Text>
          <View style={tw`flex-row items-center border border-gray-300 rounded p-2`}>
            <Ionicons name={ModalIcon} size={20} color="gray" style={tw`mr-2`} />
            <TextInput placeholder={`Enter new ${PropToChange}`} secureTextEntry={isPassword} style={tw`flex-1 text-[${textColor}]`} />
          </View>
          <TouchableOpacity
            style={tw`mt-4 bg-blue-500 rounded p-2 items-center`}
            onPress={() => {
              // Handle password change logic here
              setModalVisibility(false);
            }}>
            <Text style={tw`text-white`}>Change {PropToChange}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default ChangeProfileModal;