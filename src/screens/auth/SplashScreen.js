import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Text, Animated } from 'react-native';
import { useSelector } from 'react-redux';
import { p } from '../../utils/Responsive';

export default function Splash({ navigation }) {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate after 2 seconds
    const timeout = setTimeout(() => {
      navigation.replace(isLoggedIn ? 'Drawer' : 'Login');
    }, 2000);

    return () => clearTimeout(timeout);
  }, [isLoggedIn, navigation, fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      {/* Background Elements */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      {/* Main Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require('../../assets/walstar1111.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Loading Indicator */}
      <View style={styles.loadingContainer}>
        <View style={styles.loadingBar}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                transform: [
                  {
                    scaleX: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3360f9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: p(400),
    height: p(400),
    borderRadius: p(200),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: -150,
    left: -50,
  },
  circle2: {
    position: 'absolute',
    width: p(500),
    height: p(500),
    borderRadius: p(250),
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    bottom: -250,
    right: -100,
  },
  circle3: {
    position: 'absolute',
    width: p(300),
    height: p(300),
    borderRadius: p(150),
    backgroundColor: 'rgba(254, 140, 6, 0.05)',
    top: '30%',
    right: -100,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: p(300),
    // marginBottom: p(80),
  },
  loadingContainer: {
    position: 'absolute',
    bottom: p(50),
    alignItems: 'center',
    width: '100%',
  },
  loadingBar: {
    width: '60%',
    height: p(6),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: p(3),
    overflow: 'hidden',
    marginBottom: p(12),
  },
  progressBar: {
    height: '100%',
    width: '100%',
    backgroundColor: '#fe8c06',
    borderRadius: p(3),
  },
  loadingText: {
    fontSize: p(14),
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Poppins-Regular',
  },
});
