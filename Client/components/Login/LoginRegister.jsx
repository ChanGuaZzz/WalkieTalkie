import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import tw from 'twrnc';
import { useThemeColor } from '../../hooks/useThemeColor';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getEnvVars from '../../config';

const LoginRegister = ({ LoginScreen }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [Confpassword, setConfPassword] = useState('');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const [badLogin, setBadLogin] = useState(false);
  const [badLoginMsg, setBadLoginMsg] = useState('');

  const [formError, setFormError] = useState('');
  const [LoginScreenState, setLoginScreenState] = useState(LoginScreen);

  // Animaciones para los placeholders
  const usernamePlaceholderAnim = useRef(new Animated.Value(0)).current;
  const emailPlaceholderAnim = useRef(new Animated.Value(0)).current;
  const passwordPlaceholderAnim = useRef(new Animated.Value(0)).current;
  const confPasswordPlaceholderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = (anim) => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = (anim, value) => {
    if (value === '') {
      Animated.timing(anim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleChangeText = (setValue, anim, text) => {
    setValue(text);
    if (text !== '') {
      Animated.timing(anim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(anim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const placeholderStyle = (anim) => ({
    position: 'absolute',
    left: 10,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [15, -10],
        }),
      },
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.8],
        }),
      },
    ],
    opacity: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    }),
    color: textColor,
  });

  // ====== Validar campos de registro ======
  const validateForm = () => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.length > 0 && !emailRegex.test(email)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    // Password validation
    if (password !== Confpassword) {
      setFormError('Passwords do not match.');
      return;
    }
    if ((password.length > 0 && password.length < 8) || (Confpassword.length > 0 && Confpassword.length < 8)) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    setFormError('');
  };

  useEffect(() => {
    if (!LoginScreenState) {
      validateForm();
    }
  }, [email, password, Confpassword, LoginScreenState]);

  //====== sumbit de login o registro  ======

  const { SERVER_URL } = getEnvVars();
  const handleSumbit = () => {
    console.log("login pulsado")
    if (LoginScreenState) {
      if (username.trim().length === 0 || password.trim().length === 0) {
        setBadLogin(true);
        setBadLoginMsg('Please enter both your username and password.');
        return;
      }
      axios.post(`http://localhost:3000/login`, { username, password }, { withCredentials: true })
        .then((res) => {
          console.log(res);
          if (res.status === 200) {
            AsyncStorage.setItem('isLoggedIn', 'true')
              .then(() => {
                SetLayoutLogged(true);
              }).catch((error) => {
                console.error("Failed to save isLoggedIn status", error);
              });
          } else {
            console.log('res ' + res);
          }
        }).catch((err) => {
          console.log(err);
          if (err.response && err.response.status === 401) {
            setBadLogin(true);
            setBadLoginMsg('Incorrect username or password');
          }
        });
    } else {
      if (username.trim().length === 0) {
        setFormError('Username cannot be empty.');
        return;
      }
      else if (password.trim().length === 0 || Confpassword.trim().length === 0) {
        setFormError('Password cannot be empty.');
        return;
      }
      else if (email.trim().length === 0) {
        setFormError('Email cannot be empty.');
        return;
      }
      if (formError === '') {
        axios.post(SERVER_URL + '/create-user', { username, password, email })
          .then((res) => {
            setLoginScreenState(true);
          }).catch((err) => {
            console.log(err);
            // Handle registration errors (e.g., duplicate email) here
          });
      }
    }
  };

  return (
    <View style={tw`flex-1 w-full items-center justify-center bg-[${backgroundColor}]`}>
      <Text style={[tw`mb-10 font-bold text-[${textColor}]`, styles.text]}>{LoginScreenState ? "Log in" : "Register"}</Text>

      {/* UserName */}
      <View style={tw`w-4/5 my-3`}>
        <Animated.Text style={placeholderStyle(usernamePlaceholderAnim)}>Username</Animated.Text>
        <TextInput
          style={tw`h-10 border-b border-gray-400 px-2 text-[${textColor}]`}
          onChangeText={(text) => handleChangeText(setUsername, usernamePlaceholderAnim, text)}
          value={username}
          onFocus={() => handleFocus(usernamePlaceholderAnim)}
          onBlur={() => handleBlur(usernamePlaceholderAnim, username)}
          placeholder=""
          placeholderTextColor={textColor}
        />
      </View>

      {/* Email */}
      {!LoginScreenState && (
        <View style={tw`w-4/5 my-3`}>
          <Animated.Text style={placeholderStyle(emailPlaceholderAnim)}>Email</Animated.Text>
          <TextInput
            style={tw`h-10 border-b border-gray-400 px-2 text-[${textColor}]`}
            onChangeText={(text) => handleChangeText(setEmail, emailPlaceholderAnim, text)}
            value={email}
            onFocus={() => handleFocus(emailPlaceholderAnim)}
            onBlur={() => handleBlur(emailPlaceholderAnim, email)}
            placeholder=""
            placeholderTextColor={textColor}
            keyboardType="email-address"
          />
          {emailError && <Text style={tw`text-red-600 text-sm pl-3`}>User name or password incorrect</Text>}
        </View>
      )}

      {/* Password */}
      <View style={tw`w-4/5 my-3`}>
        <Animated.Text style={placeholderStyle(passwordPlaceholderAnim)}>Password</Animated.Text>
        <TextInput
          style={tw`h-10 border-b border-gray-400 px-2 text-[${textColor}]`}
          onChangeText={(text) => handleChangeText(setPassword, passwordPlaceholderAnim, text)}
          value={password}
          onFocus={() => handleFocus(passwordPlaceholderAnim)}
          onBlur={() => handleBlur(passwordPlaceholderAnim, password)}
          placeholder=""
          placeholderTextColor={textColor}
          secureTextEntry
        />
      </View>
      {badLogin && <Text style={tw`text-red-500`}>{badLoginMsg}</Text>}

      {/* Confirm Password */}
      {!LoginScreenState && (
        <View style={tw`w-4/5 my-3`}>
          <Animated.Text style={placeholderStyle(confPasswordPlaceholderAnim)}>Confirm Password</Animated.Text>
          <TextInput
            style={tw`h-10 border-b border-gray-400 px-2 text-[${textColor}]`}
            onChangeText={(text) => handleChangeText(setConfPassword, confPasswordPlaceholderAnim, text)}
            value={Confpassword}
            onFocus={() => handleFocus(confPasswordPlaceholderAnim)}
            onBlur={() => handleBlur(confPasswordPlaceholderAnim, Confpassword)}
            placeholder=""
            placeholderTextColor={textColor}
            secureTextEntry
          />
          {formError ? <Text style={tw`text-red-500`}>{formError}</Text> : null}
        </View>
      )}

      {/* Sumbit Button */}
      <TouchableOpacity style={tw`bg-blue-500 py-3 mt-4 rounded-lg w-1/2 text-${[textColor]}`} onPress={handleSumbit}>
        <Text style={tw`text-[white] text-center`}>
          {LoginScreenState ? "Log in" : "Register"}
        </Text>
      </TouchableOpacity>

      {/* Forgot Password */}
      <TouchableOpacity style={tw`mt-5`} >
        <Text style={tw`text-gray-500`}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Log in or Sign up */}
      <TouchableOpacity style={tw`mt-2`}>
        <Text style={tw`text-blue-500`} onPress={() => { setLoginScreenState(!LoginScreenState); setBadLogin(false); setFormError(''); }}>
          {LoginScreenState ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 45,
  }
});

export default LoginRegister;