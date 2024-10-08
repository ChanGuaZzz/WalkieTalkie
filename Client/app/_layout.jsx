//Client/app/_layout.jsx
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import tw from 'twrnc';
import { Image, View, Text, SafeAreaView, TouchableOpacity, Modal } from 'react-native';
import ProfileIcon from '../assets/images/ProfileIcon.png';
import MainLogin from './MainLogin';
import ConfigIcon from '../components/ConfigIcon';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useThemeColor } from '../hooks/useThemeColor';
import UserProfileModal from '../components/modals/UserProfileModal';
import getEnvVars from '../config';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SocketProvider } from '../components/context/SocketContext';
import createSocket from '../components/context/CreateSocket';
import { Audio } from 'expo-av';
import RequestIcon from '../components/RequestIcon';

export default function RootLayout() {
  const [modalIconVisible, setModalIconVisible] = useState(false);
  const SoftbackgroundColor = useThemeColor({}, "Softbackground");
  const textColor = useThemeColor({}, "text");
  const [username, setUsername] = useState("username");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  SetLayoutLogged = (value) => {
    setIsLoggedIn(value);
  };

  // Controla si la sesión esta logeada
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    const loggedIn = await AsyncStorage.getItem("isLoggedIn");
    setIsLoggedIn(loggedIn === "true");
  };

  const { SERVER_URL } = getEnvVars();
  const { SOCKET_URL } = getEnvVars();
  useEffect(() => {
    axios
      .get(`http://localhost:3000/getsession`, { withCredentials: true })
      // axios.get(`${SERVER_URL}/getsession`, { withCredentials: true })
      .then((res) => {
        setUsername(res.data.user.username);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [isLoggedIn]);

  // logout
  const handleLogout = async () => {
    axios
      .post(`${SERVER_URL}/logout`)
      .then((res) => {
        if (socket) {
          socket.disconnect(); // Desconectar el socket al desloguear
          console.log("Socket desconectado en logout");
          setIsSocketConnected(false);
        }
        AsyncStorage.removeItem("isLoggedIn");
        setIsLoggedIn(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const socket = createSocket(isLoggedIn, username);

  useEffect(() => {
    if (socket != null) {
      socket.on("connect", () => {
        setIsSocketConnected(true);
        console.log("ESTA CONECTADO");
      });
    }
  }, [socket]);

  useEffect(() => {
    // UseEffect para recibir los audios en cualquier parte de la app
    if (socket != null) {
      socket.on("receive-audio", async (base64Audio, room) => {
        console.log("Received audio data from room", room);
        const uri = `data:audio/wav;base64,${base64Audio}`;
        console.log("audio enviado", uri);

        // Play audio using expo-av
        const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
        await sound.setVolumeAsync(1.0); // Ensure volume is set to maximum
        await sound.playAsync();
      });

      return () => {
        socket.off("receive-audio");
      };
    }
  }, [socket]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Alvaro comenta la linea de abajo u.u */}
        {isLoggedIn && isSocketConnected ? (
          <SocketProvider socket={socket}>
            <Stack screenOptions={{ animation: 'slide_from_right', }} >
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerLeft: () => (
                    <View style={tw`flex-row items-center `}>
                      <Image source={ProfileIcon} style={tw`w-8 h-8 mr-2`} />
                      <Text style={tw`text-base font-semibold text-[${textColor}]`}>{username} </Text>
                    </View>
                  ),
                  headerRight: () => (
                    <View style={tw`flex-row`}>
                      <RequestIcon handleLogout={handleLogout} />
                      <ConfigIcon handleLogout={handleLogout} />
                    </View>),
                  headerTitle: '',
                  headerTitleAlign: 'center',
                  headerStyle: tw`bg-[${SoftbackgroundColor}]`,
                }}
              />
              <Stack.Screen
                name="AddContactsScreen"
                options={{
                  headerStyle: {
                    backgroundColor: SoftbackgroundColor, // Dark background color for the header
                  },
                  headerTintColor: textColor,
                  headerTitle: 'Add Contacts',
                }}
              />
              <Stack.Screen
                name="AddGroupsScreen"
                options={{
                  headerStyle: {
                    backgroundColor: SoftbackgroundColor, // Dark background color for the header
                  },
                  headerTintColor: textColor,
                  headerTitle: 'Add Groups',
                }}
              />
              <Stack.Screen
                name="ChatRoom"
                options={({ route }) => {
                  const user = route.params.user; // Correctly access the user object from route params
                  return {
                    headerStyle: {
                      backgroundColor: SoftbackgroundColor,
                    },
                    headerTintColor: textColor,
                    headerTitle: () => (
                      <TouchableOpacity onPress={() => setModalIconVisible(true)} style={tw`w-full`}>
                        <View style={tw`flex-1 flex-row justify-start items-center w-full`}>
                          <UserProfileModal
                            user={user}
                            modalIconVisible={modalIconVisible}
                            setModalIconVisible={setModalIconVisible}
                            iconSize={12}
                          />
                          <Text style={tw`text-[${textColor}] font-bold text-lg ml-3`}>
                            {user.name || 'Chat Room'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ),
                    headerLeft: () => (
                      <View style={{ marginLeft: -50 }} />
                    ),
                  };
                }}
              />
              <Stack.Screen
                name="ProfileSettings"
                options={{
                  headerStyle: {
                    backgroundColor: SoftbackgroundColor, // Dark background color for the header
                  },
                  headerTintColor: textColor,
                  headerTitle: 'Settings',
                }}
              />
              <Stack.Screen
                name="ProfilePhoto"
                options={{
                  headerStyle: {
                    backgroundColor: SoftbackgroundColor,
                  },
                  headerTintColor: textColor,
                  headerTitle: "Profile Photo",
                }}
              />
            </Stack >
          </SocketProvider>

        ) : (
          //If not logged in, show the LoginScreen without navigation */}
          <MainLogin SetLayoutLogged={SetLayoutLogged} />
        )}

        {/* Alvaro comentam PRIMERO arriba del todo, después desde el ' ) ' hasta aqui  */}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
