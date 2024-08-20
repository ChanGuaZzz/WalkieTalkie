import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, ImageBackground, StyleSheet, Animated, Easing } from 'react-native';
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

  // Animación de niebla
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: -1000, // Ajusta este valor según el ancho de la imagen
        duration: 15000,
        easing: Easing.linear,
        useNativeDriver: true, // Cambiado a true para mejor rendimiento
      })
    ).start();
  }, [translateX]);

  const animatedStyle = {
    transform: [{ translateX }],
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

  // Animaciones de glitch
  const glitchAnim1 = useRef(new Animated.Value(0)).current;
  const glitchAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glitchAnim1, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glitchAnim1, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glitchAnim2, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(glitchAnim2, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glitchAnim1, glitchAnim2]);

  const glitchStyle1 = {
    transform: [
      {
        translateX: glitchAnim1.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 2],
        }),
      },
    ],
   

    color: 'white',
    textShadowColor: 'black',
    textShadowOffset: { width: 0, height: 0 },
  };

  const glitchStyle2 = {
    transform: [
      {
        translateX: glitchAnim2.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -2],
        }),
      },
    ],
    textShadowColor: 'white',
    textShadowOffset: { width: 1, height: 0 },
    textShadowRadius: 1,
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/Fondo-Bosque.jpg')}
      style={[tw`flex-1 w-full items-center justify-center`, styles.imagen]}
    >
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Text style={[tw`text-2xl`, { color: textColor }, styles.letra]}></Text>
        <Animated.Text style={[styles.glitch, glitchStyle1]} data-text="WalkieTalkie">
          WalkieTalkie
        </Animated.Text>
        <Animated.Text style={[styles.glitch, glitchStyle2]} data-text="WalkieTalkie">
          WalkieTalkie
        </Animated.Text>
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
      <View style={styles.fogContainer}>
        <Animated.View style={[styles.fogRow, animatedStyle]}>
          <ImageBackground 
            source={require('../../assets/images/Fog1.png')}
            style={styles.fogImage}
          />
          <ImageBackground 
            source={require('../../assets/images/Fog1.png')}
            style={styles.fogImage}
          />
          <ImageBackground 
            source={require('../../assets/images/Fog1.png')}
            style={styles.fogImage}
          />
          <ImageBackground 
            source={require('../../assets/images/Fog1.png')}
            style={styles.fogImage}
          />
        </Animated.View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  btn: {
    position: 'relative',
    paddingVertical: 24,
    paddingHorizontal: 64,
    borderRadius: 1000,
    backgroundColor: 'transparent',
    fontFamily: 'Playfair Display, serif',
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
  imagen: {
    flex: 1,
    height: '100%', // Ajusta la altura según sea necesario
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo negro semitransparente
    zIndex: 1,
  },
  content: {
    position: 'absolute',
    zIndex: 2,
    alignItems: 'center',
  },
  fogContainer: {
    position: 'absolute',
    bottom: 0,
    height: 100, // Ajusta la altura según sea necesario
    width: '100%', // Asegura que la imagen cubra el área de desplazamiento
    overflow: 'hidden', // Asegura que el contenido no se desborde
    zIndex: 1,
  },
  fogRow: {
    flexDirection: 'row',
    width: '400%', // Ajusta el ancho para que se superpongan ligeramente
  },
  fogImage: {
    height: '100%', // Ajusta la altura según sea necesario
    width: '25%', // Ajusta el ancho para que se superpongan ligeramente
    resizeMode: 'cover',
  },
  letra: {
    fontFamily: 'Varela, sans-serif',
  },
  glitch: {
    color: 'white',
    
    textShadowRadius: 10,
    fontSize: 65,
    position: 'absolute',
    bottom: 200,
    width: 400,
    margin: 0,
    textAlign: 'center',
  },
});

export default FirstScreen;