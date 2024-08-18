import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet, Animated, Easing } from 'react-native';
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
        toValue: -2000,
        duration: 30000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [translateX]);

  const animatedStyle = {
    transform: [{ translateX }],
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/Fondo-Bosque.jpg')}
      style={[tw`flex-1 w-full items-center justify-center`, styles.imagen]}
    >
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Text style={[tw`text-2xl`, { color: textColor }, styles.letra]}>Welcome</Text>
        <TouchableOpacity style={tw`bg-blue-500 p-2 mt-5`} onPress={() => GoLoginScreen(false)}>
          <Text style={tw`text-white`}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tw`bg-blue-500 p-2 mt-5`} onPress={() => GoLoginScreen(true)}>
          <Text style={tw`text-white`}>Register</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.fogContainer}>
        <Animated.View style={[styles.fogImage, animatedStyle]}>
          <ImageBackground 
            source={require('../../assets/images/Fog1.png')}
            style={styles.fogImageFirst}
          />
        </Animated.View>
        <Animated.View style={[styles.fogImage, animatedStyle]}>
          <ImageBackground 
            source={require('../../assets/images/Fog2.png')}
            style={styles.fogImageSecond}
          />
        </Animated.View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  imagen: {
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
    height: '100%', // Ajusta la altura según sea necesario
    width: '100%',
    zIndex: 1,
    overflow: 'hidden', // Asegura que el contenido no se desborde
  },
  fogImage: {
    position: 'absolute',
    height: '100%', // Ajusta la altura según sea necesario
    width: '200%', // Asegura que la imagen cubra el área de desplazamiento
    flexDirection: 'row',
  },
  fogImageFirst: {
    flex: 1,
    resizeMode: 'repeat',
  },
  fogImageSecond: {
    flex: 1,
    resizeMode: 'repeat',
  },
  letra: {
    // Puedes agregar estilos adicionales aquí si es necesario
  },
});

export default FirstScreen;