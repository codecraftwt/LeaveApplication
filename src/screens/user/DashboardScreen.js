import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Text, Alert } from 'react-native';
import ContributionCard from '../../components/dashboard/ContributionCard';
import MonthStats from '../../components/dashboard/MonthStats';
import EventsList from '../../components/dashboard/EventsList';
import { p } from '../../utils/Responsive';
import { useSelector, useDispatch } from 'react-redux';
import { getDashboard, logout, getUser } from '../../redux/slices/authSlice';
import LeaveInfo from '../../components/dashboard/LeaveInfo';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const DashboardScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector(state => state.auth.user);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  // Function to handle automatic logout
  const handleAutoLogout = useCallback(async () => {
    if (isLoggingOut) return; // Prevent multiple logout attempts
    try {
      setIsLoggingOut(true);
      console.log('Starting auto logout process...');
      // Clear AsyncStorage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // Dispatch logout action
      dispatch(logout());
      // Show alert to user with timeout
      Alert.alert(
        'Account Deactivated',
        'Your account has been deactivated. You have been logged out.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to login screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            },
          },
        ],
        {
          cancelable: false, // Prevent dismissing by tapping outside
        },
      );
      // Force navigation to login screen after 3 seconds regardless of user interaction
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }, 3000);
    } catch (error) {
      console.error('Error during auto logout:', error);
      // Even if there's an error, still navigate to login
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
      console.log('Checking user status:', user.status);
      const inactiveStatuses = [
        'inactive',
        'deactivated',
        'suspended',
        'terminated',
        'blocked',
      ];
      if (inactiveStatuses.includes(user.status.toLowerCase())) {
        console.log('User status is inactive, triggering auto logout');
        handleAutoLogout();
      }
    }
  }, [user?.status, handleAutoLogout]);
  // Use useFocusEffect to fetch dashboard data immediately when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        dispatch(getDashboard(user.id));
      }
    }, [dispatch, user?.id])
  );
  // Periodic check for user status changes (every 30 seconds)
  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(() => {
      // Fetch latest user data to check for status changes
      dispatch(getUser(user.id));
    }, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [dispatch, user?.id]);
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headContainer}>
        <Text style={styles.headtitle}>
          Welcome : {user?.first_name || ''} {user?.middle_name || ''}{' '}
          {user?.last_name || ''}
        </Text>
      </View>
      <View style={styles.mainContainer}>
        <ContributionCard />
        <MonthStats />
        <LeaveInfo showViewButton={true} />
        <EventsList />
      </View>
    </ScrollView>
  );
};
export default DashboardScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: p(10),
    borderTopRightRadius: p(30),
    borderTopLeftRadius: p(30),
    marginHorizontal: p(13),
  },
  headtitle: {
    fontSize: p(14),
    // marginBottom: p(10),
    fontFamily: 'Montserrat-SemiBold',
    color: '#fff',
    textAlign: 'center',
  },
  headContainer: {
    backgroundColor: '#FA6A00',
    paddingVertical: p(6),
    borderRadius: p(12),
    marginTop: p(10),
    marginHorizontal: p(13),
  },
});
