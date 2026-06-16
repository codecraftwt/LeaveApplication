import React, { useRef } from 'react';
import { Animated, StyleSheet, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTabAnimation } from '../navigation/TabAnimationContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Wraps a tab screen so it slides in from the correct direction
 * when the tab becomes focused.
 *  - Going to a higher-indexed tab → slides in from the RIGHT
 *  - Going to a lower-indexed tab  → slides in from the LEFT
 */
export default function SlideScreen({ children }) {
  const { directionRef } = useTabAnimation();
  const translateX = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      // Start off-screen in the correct direction
      const startX =
        directionRef.current === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
      translateX.setValue(startX);

      // Slide to centre
      Animated.spring(translateX, {
        toValue: 0,
        damping: 22,
        stiffness: 220,
        mass: 0.9,
        useNativeDriver: true,
      }).start();
    }, []),
  );

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateX }] }]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
