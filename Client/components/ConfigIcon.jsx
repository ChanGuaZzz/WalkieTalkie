import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '../hooks/useThemeColor';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

const ConfigIcon = ({ handleLogout }) => {
  const textColor = useThemeColor({}, 'text');
  const SoftbackgroundColor = useThemeColor({}, 'Softbackground');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navigation = useNavigation(); // Use the useNavigation hook

  // Navigate to ProfileSettings
  const onPressSettings = () => {
    setDropdownVisible(false);
    navigation.navigate('ProfileSettings');
  };

  return (
    <View style={tw`relative`}>
      <TouchableOpacity onPress={() => setDropdownVisible(!dropdownVisible)}>
        <Ionicons name="settings-outline" size={24} color={textColor} />
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
          <View style={tw`w-2/5 h-1/5 px-2 py-5 bg-[${SoftbackgroundColor}] rounded-md shadow-md justify-between`}>
            <TouchableOpacity onPress={() => setDropdownVisible(false)}>
              <Text style={tw`text-lg text-[${textColor}]`}>Busy mode</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onPressSettings()}>
              <Text style={tw`text-lg text-[${textColor}]`}>Profile settings</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={tw`text-lg text-[${textColor}]`}>Log out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default ConfigIcon;
