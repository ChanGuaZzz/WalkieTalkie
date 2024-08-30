import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Dimensions } from 'react-native';
import tw from 'twrnc';
import { useThemeColor } from '../../hooks/useThemeColor';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const FirstScreen = ({ SetFirstScreen, SetLoginScreenState }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const GoLoginScreen = (register) => {
    SetFirstScreen(false);
    SetLoginScreenState(!register);
    console.log('FirstScreen --> SetLoginScreenState', !register);
  };

  // Estados animados para los botones de Login y Register
  const animatedValueLogin = useRef(new Animated.Value(1)).current;
  const animatedValueRegister = useRef(new Animated.Value(1)).current;

  const backgroundOpacityLogin = useRef(new Animated.Value(0)).current;
  const backgroundOpacityRegister = useRef(new Animated.Value(0)).current;

  const borderOpacityLogin = useRef(new Animated.Value(0)).current;
  const borderOpacityRegister = useRef(new Animated.Value(0)).current;

  const handlePressIn = (button) => {
    const animatedValue = button === 'login' ? animatedValueLogin : animatedValueRegister;
    const backgroundOpacity = button === 'login' ? backgroundOpacityLogin : backgroundOpacityRegister;
    const borderOpacity = button === 'login' ? borderOpacityLogin : borderOpacityRegister;

    Animated.timing(animatedValue, {
      toValue: 0.95,
      duration: 200,
      useNativeDriver: true,
    }).start();

    Animated.timing(backgroundOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    Animated.timing(borderOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (button) => {
    const animatedValue = button === 'login' ? animatedValueLogin : animatedValueRegister;
    const backgroundOpacity = button === 'login' ? backgroundOpacityLogin : backgroundOpacityRegister;
    const borderOpacity = button === 'login' ? borderOpacityLogin : borderOpacityRegister;

    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    Animated.timing(backgroundOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    Animated.timing(borderOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const animatedButtonStyleLogin = {
    transform: [{ scale: animatedValueLogin }],
  };

  const animatedButtonStyleRegister = {
    transform: [{ scale: animatedValueRegister }],
  };

  const animatedBackgroundStyleLogin = {
    backgroundColor: backgroundOpacityLogin.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(250, 250, 250, 0)', 'rgba(250, 250, 250, 0.3)'],
    }),
  };

  const animatedBackgroundStyleRegister = {
    backgroundColor: backgroundOpacityRegister.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(250, 250, 250, 0)', 'rgba(250, 250, 250, 0.3)'],
    }),
  };

  const animatedBorderStyleLogin = {
    borderColor: borderOpacityLogin.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(250, 250, 250, 0)', 'rgba(250, 250, 250, 0.3)'],
    }),
  };

  const animatedBorderStyleRegister = {
    borderColor: borderOpacityRegister.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(250, 250, 250, 0)', 'rgba(250, 250, 250, 0.3)'],
    }),
  };

  // Animaciones de flicker
  const flickerAnimI = useRef(new Animated.Value(0.4)).current;
  const flickerAnimLG = useRef(new Animated.Value(0.19)).current;
  const flickerAnimH = useRef(new Animated.Value(0.15)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(flickerAnimI, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(flickerAnimI, {
          toValue: 0.4,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(flickerAnimLG, {
          toValue: 0.4,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(flickerAnimLG, {
          toValue: 0.19,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(flickerAnimH, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(flickerAnimH, {
          toValue: 0.15,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [flickerAnimI, flickerAnimLG, flickerAnimH]);

  const flickerStyleI = {
    opacity: flickerAnimI,
  };

  const flickerStyleLG = {
    opacity: flickerAnimLG,
  };

  const flickerStyleH = {
    opacity: flickerAnimH,
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.centro}>
          <Animated.Text style={[styles.letter, flickerStyleLG]} id="L">H</Animated.Text>
          <Animated.Text style={[styles.letter, flickerStyleI]} id="I">E</Animated.Text>
          <Animated.Text style={[styles.letter, flickerStyleLG]} id="G">L</Animated.Text>
          <Animated.Text style={[styles.letter, flickerStyleH]} id="H">L</Animated.Text>
          <Animated.Text style={[styles.letter, flickerStyleH]} id="H">O</Animated.Text>
          <Animated.Text style={[styles.letter, flickerStyleH]} id="H">?</Animated.Text>
        </View>
        
        <Animated.View style={animatedButtonStyleLogin}>
          <Pressable
            style={({ pressed }) => [
              tw`w-30 p-3 mt-5`,
              styles.btn,
              pressed && styles.btnPressed,
            ]}
            onPress={() => GoLoginScreen(false)}
            onPressIn={() => handlePressIn('login')}
            onPressOut={() => handlePressOut('login')}
          >
            <Animated.View style={[styles.btnBackground, animatedBackgroundStyleLogin]} />
            <Text style={[tw`text-white`, styles.btnText]}>Login</Text>
            <Animated.View style={[styles.underline, animatedBorderStyleLogin]} />
          </Pressable>
        </Animated.View>
        <Animated.View style={animatedButtonStyleRegister}>
          <Pressable
            style={({ pressed }) => [
              tw`w-30 p-3 mt-5`,
              styles.btn,
              pressed && styles.btnPressed,
            ]}
            onPress={() => GoLoginScreen(true)}
            onPressIn={() => handlePressIn('register')}
            onPressOut={() => handlePressOut('register')}
          >
            <Animated.View style={[styles.btnBackground, animatedBackgroundStyleRegister]} />
            <Text style={[tw`text-white`, styles.btnText]}>Register</Text>
            <Animated.View style={[styles.underline, animatedBorderStyleRegister]} />
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth,
    height: screenHeight,
  },
  btn: {
    position: 'relative',
    paddingVertical: 24,
    paddingHorizontal: 64,
    borderRadius: 1000,
    backgroundColor: 'transparent',
    fontFamily: 'Montserrat', // Cambiado a Montserrat
    color: '#fafafa',
    overflow: 'hidden',
    cursor: 'pointer',
    WebkitMaskImage: '-webkit-radial-gradient(white, black)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    transform: [{ translateY: -4 }],
    textShadowColor: '#fff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  btnText: {
    fontSize: 18, // Tamaño de letra aumentado
    textAlign: 'center',
    textShadowColor: '#fff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  btnBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 1000,
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    height: 2,
    backgroundColor: 'white',
  },
  content: {
    alignItems: 'center',
  },
  centro: {
    textAlign: 'center',
    flexDirection: 'row',
  },
  letter: {
    fontSize: 40,
    color: '#f1f1f1',
    letterSpacing: 10,
    opacity: 0.15,
    fontFamily: 'Helvetica',
    fontStyle: 'italic' // Cambiado a Montserrat
  },
});

export default FirstScreen;