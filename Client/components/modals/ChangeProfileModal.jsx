import { React, useState, useEffect, Platform } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import tw from "twrnc";
import { useThemeColor } from "../../hooks/useThemeColor";
import axios from "axios";

const ChangeProfileModal = ({ PropToChange, setModalVisibility, ModalIcon, isPassword, refreshSession, userID, currentProp }) => {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const [newProp, setNewProp] = useState("");

  useEffect(() => {
    if (!isPassword) {
      setNewProp(currentProp);
    }
  }, [isPassword, currentProp]);

  // Function to show alert based on platform
  const showAlert = (title, message) => {
    if (Platform.OS === "web") {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message, [{ text: "OK" }]);
    }
  };

  //validate form
  const validateForm = () => {
    if (newProp.trim().length === 0) {
      showAlert("Invalid " + PropToChange, "The new " + PropToChange + " cannot be empty");
      return false;
    }
    if (isPassword && newProp.trim().length < 8) {
      showAlert("Invalid password", "Password must be at least 8 characters long.");
      return false;
    }
    if (PropToChange === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newProp)) {
        showAlert("Invalid Email", "Please enter a valid email address.");
        return false;
      }
    }
    if (PropToChange === "info" && newProp.length > 120) {
      showAlert("Invalid info", "Info must be less than 120 characters.");
      return false;
    }
    setValidForm(true);
    return true;
  };

  // Update the user
  const updateUser = () => {
    if (!validateForm()) return;

    //if the form is valid, update the user
    axios
      .post("http://localhost:3000/update-user", {
        userID: userID,
        PropToChange: PropToChange,
        newProp: newProp,
      })
      .then(() => {
        refreshSession();
      })
      .then(() => {
        setModalVisibility(false);
      })
      .catch((err) => {
        console.error("Error updating user:", err);
        if (err.response && err.response.data) {
          // Handle error (e.g., show an error message)
        } else {
          // Handle error (e.g., show an error message)
        }
      });
  };

  return (
    <Modal animationType="fade" transparent={true} onRequestClose={() => setModalVisibility(false)}>
      <TouchableOpacity style={tw`flex-1 justify-end bg-black bg-opacity-50`} activeOpacity={1} onPressOut={() => setModalVisibility(false)}>
        <View style={tw`bg-[${backgroundColor}] rounded-t-lg p-4`} onStartShouldSetResponder={() => true}>
          <Text style={tw`text-lg font-bold mb-4 text-[${textColor}]`}>Change your {PropToChange}</Text>
          <View style={tw`flex-row items-center border border-gray-300 rounded p-2`}>
            <Ionicons name={ModalIcon} size={20} color="gray" style={tw`mr-2`} />
            <TextInput
              placeholder={`Enter new ${PropToChange}`}
              value={newProp}
              secureTextEntry={isPassword}
              style={tw`flex-1 text-[${textColor}]`}
              onChange={(e) => {
                setNewProp(e.target.value);
              }}
            />
          </View>
          <TouchableOpacity
            style={tw`mt-4 bg-blue-500 rounded p-2 items-center`}
            onPress={() => {
              // Handle password change logic here
              updateUser();
            }}>
            <Text style={tw`text-white`}>Change {PropToChange}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default ChangeProfileModal;
