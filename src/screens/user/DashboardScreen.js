import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Text, Alert, Image } from 'react-native';
import ContributionCard from '../../components/dashboard/ContributionCard';
import MonthStats from '../../components/dashboard/MonthStats';
import EventsList from '../../components/dashboard/EventsList';
import { p } from '../../utils/Responsive';
import { useSelector, useDispatch } from 'react-redux';
import { getDashboard, logout, getUser } from '../../redux/slices/authSlice';
import LeaveInfo from '../../components/dashboard/LeaveInfo';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from 'react-native-vector-icons/Feather';

const DashboardScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector(state => state.auth.user);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // Function to handle automatic logout
  const handleAutoLogout = useCallback(async () => {
    if (isLoggingOut) return;
    try {
      setIsLoggingOut(true);
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      dispatch(logout());

      Alert.alert(
        'Account Deactivated',
        'Your account has been deactivated. You have been logged out.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            },
          },
        ],
        { cancelable: false }
      );

      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }, 3000);
    } catch (error) {
      console.error('Error during auto logout:', error);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } finally {
      setIsLoggingOut(false);
    }
  }, [dispatch, navigation, isLoggingOut]);

  // Check user status and auto logout if inactive
  useEffect(() => {
    if (user?.status) {
      const inactiveStatuses = ['inactive', 'deactivated', 'suspended', 'terminated', 'blocked'];
      if (inactiveStatuses.includes(user.status.toLowerCase())) {
        handleAutoLogout();
      }
    }
  }, [user?.status, handleAutoLogout]);

  // Fetch dashboard data
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        dispatch(getDashboard(user.id));
      }
    }, [dispatch, user?.id])
  );

  // Periodic check for user status changes
  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(() => {
      dispatch(getUser(user.id));
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch, user?.id]);

  // Get User Initials for Avatar
  const getInitials = () => {
    const first = user?.first_name ? user.first_name.charAt(0) : '';
    const last = user?.last_name ? user.last_name.charAt(0) : '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <View style={styles.container}>
      {/* Premium Header */}
      <View style={styles.headerGreeting}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.greetingTitle}>
            Hello, {user?.first_name || 'User'}
          </Text>
          <Text style={styles.greetingSubtitle}>
            Here is your activity overview
          </Text>
        </View>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.mainContainer}>
          <ContributionCard />
          <MonthStats />
          <LeaveInfo showViewButton={true} />
          <EventsList />
        </View>
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eff6ff', // Sleek ultra-light bluish background
  },
  scrollContent: {
    paddingBottom: p(40),
  },
  headerGreeting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: p(20),
    paddingTop: p(8),
    paddingBottom: p(16),
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: p(15),
  },
  greetingTitle: {
    fontSize: p(22),
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: p(2),
  },
  greetingSubtitle: {
    fontSize: p(14),
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
  },
  avatarContainer: {
    width: p(50),
    height: p(50),
    borderRadius: p(25),
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#EFF6FF',
  },
  avatarText: {
    fontSize: p(18),
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: p(20),
    gap: p(12),
  },
});
