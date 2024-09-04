import React, { useRef, useState, useEffect } from "react";
import { SafeAreaView, Text, View, TouchableOpacity, Pressable, Animated, Easing } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import tw from "twrnc";
import { useThemeColor } from "../hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import ChangeProfileModal from "../components/modals/ChangeProfileModal";
import axios from "axios";

const ProfileSettings = () => {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const disabledText = useThemeColor({}, "disabledText");
  const [isAnimated, setIsAnimated] = useState(false);
  const [isMoved, setIsMoved] = useState(false);
  const [activePressable, setActivePressable] = useState(null);
  const [ChangeProfileModalVisible, setChangeProfileModalVisible] = useState(false);
  const [PropToChange, setPropToChange] = useState("");
  const [ModalIcon, setModalIcon] = useState("");
  const [isPassword, setIsPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [userEmail, setuserEmail] = useState("");
  const [userID, setUserID] = useState("");
  const [userInfo, setUserInfo] = useState("");
  const [currentProp, setCurrentProp] = useState("");
  const [entireUserInfo, setEntireUserInfo] = useState("");
  // Set the maximum length for the user info in the UI
  const MAX_LENGTH = 30;
  const truncatedInfo = (info) => {
    return info.length > MAX_LENGTH ? `${info.substring(0, MAX_LENGTH)}...` : info;
  };
  // Get session
  useEffect(() => {
    axios
      .get("http://localhost:3000/getsession", { withCredentials: true })
      .then((res) => {
        console.log("res", res);
        setUsername(res.data.user.username);
        setuserEmail(res.data.user.email);
        setUserID(res.data.user.id);
        setEntireUserInfo(res.data.user.info);
        setUserInfo(truncatedInfo(res.data.user.info));
        res.data.user.info;
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const refreshSession = () => {
    axios
      .post(`http://localhost:3000/refreshSession`, { id: userID }, { withCredentials: true })
      .then((res) => {
        setUsername(res.data.user.username);
        setuserEmail(res.data.user.email);
        setEntireUserInfo(res.data.user.info);
        setUserInfo(truncatedInfo(res.data.user.info));
        res.data.user.info;
      })
      .catch((error) => {
        console.log(error);
      });
  };
  // Change profile picture
  const onChangePicture = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    console.log("ImagePicker result: ", result);

    if (result.assets && result.assets.length > 0) {
      const source = { uri: result.assets[0].uri };
      console.log("Selected image URI: ", source.uri);
      // Aquí se debe enviar la imagen al servidor =)
    } else {
      console.log("No image selected");
    }
  };

  // Change profile
  const openModal = (id) => {
    console.log("openModal called with id:", id);
    if (id === "password") {
      setPropToChange("password");
      setModalIcon("lock-closed-outline");
      setIsPassword(true);
    } else if (id === "info") {
      setPropToChange("info");
      setModalIcon("person-outline");
      setCurrentProp(entireUserInfo);
      setIsPassword(false);
    } else if (id === "email") {
      setPropToChange("email");
      setModalIcon("mail-outline");
      setCurrentProp(userEmail);
      setIsPassword(false);
    }
    setChangeProfileModalVisible(true);
    console.log("ChangeProfileModalVisible set to true");
  };

  const animation = useRef(new Animated.Value(0)).current;

  const handlePress = (id) => {
    if (!isAnimated || activePressable !== id) {
      setActivePressable(id);
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start(() => setIsAnimated(true));
    }
  };

  const handlePressOut = (id) => {
    console.log("handlePressOut called with id:", id);
    if (!isMoved) {
      openModal(id);
    }
    handleOutsidePress();
    setIsMoved(false);
  };

  const handleMove = () => {
    setIsMoved(true);
  };

  const handleOutsidePress = () => {
    if (isAnimated) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start(() => setIsAnimated(false));
    }
  };
  const setModalVisibility = (value) => {
    setChangeProfileModalVisible(value);
    handleOutsidePress();
  };
  const animatedStyle = {
    backgroundColor: animation.interpolate({
      inputRange: [0, 1],
      outputRange: ["rgba(0, 0, 0, 0)", "rgba(211, 211, 211, 0.1)"],
    }),
    width: animation.interpolate({
      inputRange: [0, 1],
      outputRange: ["0%", "100%"],
    }),
    left: animation.interpolate({
      inputRange: [0, 1],
      outputRange: ["50%", "0%"],
    }),
    right: animation.interpolate({
      inputRange: [0, 1],
      outputRange: ["50%", "0%"],
    }),
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={tw`flex-1 bg-[${backgroundColor}]`}>
        <View style={tw`w-full h-1/3 flex items-center justify-center mt-2`}>
          <TouchableOpacity style={tw`bg-red-600 h-42 w-42 rounded-full relative`} onPress={() => navigation.navigate("ProfilePhoto")}>
            <TouchableOpacity onPress={onChangePicture} style={tw`bg-yellow-600 h-12 w-12 rounded-full absolute bottom-0 right-0 m-1 flex items-center justify-center`}>
              <Ionicons name="image-outline" size={24} color={textColor} />
            </TouchableOpacity>
          </TouchableOpacity>
          <Text style={tw`text-[${textColor}] text-lg`}>{username}</Text>
        </View>
        <View style={tw`w-full flex items-center justify-center gap-5`}>
          {/* User info */}
          <Pressable
            onPressIn={() => handlePress("info")}
            onPressOut={() => handlePressOut("info")}
            onPressMove={handleMove}
            style={tw`w-full flex flex-col items-start px-1`}>
            <View style={tw`w-full flex flex-row items-center`}>
              <View style={tw`w-[10%] flex items-center`}>
                <Ionicons name="person-outline" size={20} color={textColor} />
              </View>
              <View style={tw`w-5/6 flex flex-col border-b border-gray-400 py-3 ml-2`}>
                <View style={tw`flex-row w-full justify-between items-center`}>
                  <View>
                    <Text style={tw`text-[${disabledText}] mb-1`}>Info</Text>
                    <Text style={tw`text-[${textColor}]`}>{userInfo}</Text>
                  </View>
                  <Ionicons name="build-outline" size={20} color={textColor} />
                </View>
              </View>
            </View>
            {activePressable === "info" && <Animated.View style={[tw`absolute left-0 top-0 bottom-0`, animatedStyle]} />}
          </Pressable>
          {/* Email */}
          <Pressable
            onPressIn={() => handlePress("email")}
            onPressOut={() => handlePressOut("email")}
            onPressMove={handleMove}
            style={tw`w-full flex flex-col items-start px-1`}>
            <View style={tw`w-full flex flex-row items-center`}>
              <View style={tw`w-[10%] flex items-center`}>
                <Ionicons name="mail-outline" size={20} color={textColor} />
              </View>
              <View style={tw`w-5/6 flex flex-col border-b border-gray-400 py-3 ml-2`}>
                <View style={tw`flex-row w-full justify-between items-center`}>
                  <View>
                    <Text style={tw`text-[${disabledText}] mb-1`}>Email</Text>
                    <Text style={tw`text-[${textColor}]`}>{userEmail}</Text>
                  </View>
                  <Ionicons name="build-outline" size={20} color={textColor} />
                </View>
              </View>
            </View>
            {activePressable === "email" && <Animated.View style={[tw`absolute left-0 top-0 bottom-0`, animatedStyle]} />}
          </Pressable>
          {/* Password */}
          <Pressable
            onPressIn={() => handlePress("password")}
            onPressOut={() => handlePressOut("password")}
            onPressMove={handleMove}
            style={tw`w-full flex flex-col items-start px-1`}>
            <View style={tw`w-full flex flex-row items-center`}>
              <View style={tw`w-[10%] flex items-center`}>
                <Ionicons name="lock-closed-outline" size={20} color={textColor} />
              </View>
              <View style={tw`w-5/6 flex flex-col border-b border-gray-400 py-3 ml-2`}>
                <View style={tw`flex-row w-full justify-between items-center`}>
                  <View>
                    <Text style={tw`text-[${disabledText}] mb-1`}>Password</Text>
                    <Text style={tw`text-[${textColor}]`}>***</Text>
                  </View>
                  <Ionicons name="build-outline" size={20} color={textColor} />
                </View>
              </View>
            </View>
            {activePressable === "password" && <Animated.View style={[tw`absolute left-0 top-0 bottom-0`, animatedStyle]} />}
          </Pressable>
        </View>
        {/* ChangeProfileModal */}
        {ChangeProfileModalVisible && (
          <ChangeProfileModal
            ModalIcon={ModalIcon}
            PropToChange={PropToChange}
            setModalVisibility={setModalVisibility}
            isPassword={isPassword}
            refreshSession={refreshSession}
            userID={userID}
            currentProp={currentProp}
          />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default ProfileSettings;
