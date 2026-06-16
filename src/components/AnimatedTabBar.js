import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabAnimation } from '../navigation/TabAnimationContext';

const TAB_ICONS = {
  Dashboard: 'home',
  'My Leaves': 'calendar',
  'Employee Analytics': 'bar-chart-2',
  Dinner: 'coffee',
  Profile: 'user',
};

const TAB_LABELS = {
  Dashboard: 'Home',
  'My Leaves': 'Leaves',
  'Employee Analytics': 'Analytics',
  Dinner: 'Food',
  Profile: 'Profile',
};

const ACTIVE_BG = '#3660f9';
const ACTIVE_TEXT = '#FFFFFF';
const INACTIVE_TEXT = '#94A3B8';
const TAB_BAR_BG = '#FFFFFF';

const TabItem = ({ route, index, state, navigation }) => {
  const isFocused = state.index === index;
  const animValue = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const scaleValue = useRef(new Animated.Value(isFocused ? 1.15 : 1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(animValue, {
        toValue: isFocused ? 1 : 0,
        damping: 15,
        stiffness: 150,
        mass: 0.8,
        useNativeDriver: false,
      }),
      Animated.spring(scaleValue, {
        toValue: isFocused ? 1.15 : 1,
        damping: 10,
        stiffness: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);

  const backgroundColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', ACTIVE_BG],
  });

  const labelOpacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const labelWidth = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 70],
  });

  const paddingH = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 16],
  });

  const { directionRef, prevIndexRef } = useTabAnimation();

  const onPress = () => {
    // Determine slide direction before navigating
    if (index > prevIndexRef.current) {
      directionRef.current = 'right'; // tapped a tab to the right
    } else if (index < prevIndexRef.current) {
      directionRef.current = 'left';  // tapped a tab to the left
    }
    prevIndexRef.current = index;

    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  const iconName = TAB_ICONS[route.name] || 'circle';
  const label = TAB_LABELS[route.name] || route.name;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.tabTouchable}
    >
      <Animated.View
        style={[
          styles.tabItem,
          {
            backgroundColor,
            paddingHorizontal: paddingH,
          },
        ]}
      >
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
          <Feather
            name={iconName}
            size={22}
            color={isFocused ? ACTIVE_TEXT : INACTIVE_TEXT}
          />
        </Animated.View>
        <Animated.View
          style={{
            opacity: labelOpacity,
            maxWidth: labelWidth,
            overflow: 'hidden',
            marginLeft: isFocused ? 6 : 0,
          }}
        >
          <Text
            style={[
              styles.tabLabel,
              { color: isFocused ? ACTIVE_TEXT : INACTIVE_TEXT },
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const AnimatedTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
        },
      ]}
    >
      <View style={styles.tabBarInner}>
        {state.routes.map((route, index) => (
          <TabItem
            key={route.key}
            route={route}
            index={index}
            state={state}
            descriptors={descriptors}
            navigation={navigation}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: TAB_BAR_BG,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    elevation: 12,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    paddingTop: 8,
  },
  tabBarInner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  tabTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 50,
    minHeight: 44,
  },
  tabLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    letterSpacing: 0.3,
  },
});

export default AnimatedTabBar;
