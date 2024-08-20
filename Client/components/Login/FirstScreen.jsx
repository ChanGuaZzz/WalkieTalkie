import React, { useEffect, useRef, useState } from 'react';
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

  const [hoverLogin, setHoverLogin] = useState(false);
  const [hoverRegister, setHoverRegister] = useState(false);

  return (
    <ImageBackground 
      source={require('../../assets/images/Fondo-Bosque.jpg')}
      style={[tw`flex-1 w-full items-center justify-center`, styles.imagen]}
    >
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Text style={[tw`text-2xl`, { color: textColor }, styles.letra]}>Welcome</Text>
        <Pressable
          style={({ pressed }) => [
            tw`w-30 p-3 mt-5`,
            styles.btn,
            (pressed || hoverLogin) && styles.btnHover,
          ]}
          onPress={() => GoLoginScreen(false)}
          onMouseEnter={() => setHoverLogin(true)}
          onMouseLeave={() => setHoverLogin(false)}
        >
          <Text style={[tw`text-white`, styles.btnText]}>Login</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            tw`w-30 p-3 mt-5`,
            styles.btn,
            (pressed || hoverRegister) && styles.btnHover,
          ]}
          onPress={() => GoLoginScreen(true)}
          onMouseEnter={() => setHoverRegister(true)}
          onMouseLeave={() => setHoverRegister(false)}
        >
          <Text style={[tw`text-white`, styles.btnText]}>Register</Text>
        </Pressable>
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
    borderWidth: 0,
    borderColor: 'transparent',
    shadowColor: 'rgba(255, 255, 255, 0)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 20,
    justifyContent: 'center', // Centra el contenido verticalmente
    alignItems: 'center', // Centra el contenido horizontalmente
    borderRadius: 10, // Borde redondeado
    transition: 'all 0.3s ease', // Transición suave
  },
  btnHover: {
    borderWidth: 1,
    borderColor: '#fff',
    shadowColor: 'rgba(255, 255, 255, 0.5)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    outlineOffset: 15,
    outlineColor: 'rgba(255, 255, 255, 0)',
    textShadow: '1px 1px 2px #427388',
    borderRadius: 10, // Asegura que el borde redondeado se aplique también en el hover
    backgroundColor: 'black',
    color: 'black',
  },
  btnText: {
    fontSize: 18, // Tamaño de letra aumentado
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
    // Puedes agregar estilos adicionales aquí si es necesario
  },
});

export default FirstScreen;