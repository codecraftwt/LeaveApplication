import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Text, Alert, StatusBar, SafeAreaView, Dimensions } from 'react-native';
import ContributionCard from '../../components/dashboard/ContributionCard';
import MonthStats from '../../components/dashboard/MonthStats';
import EventsList from '../../components/dashboard/EventsList';
import { p } from '../../utils/Responsive';
import { useSelector, useDispatch } from 'react-redux';
import { getDashboard, logout, getUser } from '../../redux/slices/authSlice';
import LeaveInfo from '../../components/dashboard/LeaveInfo';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

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

  useEffect(() => {
    if (user?.id) {
      dispatch(getDashboard(user.id));
    }
  }, [dispatch, user?.id]);

  // Periodic check for user status changes (every 30 seconds)
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      // Fetch latest user data to check for status changes
      dispatch(getUser(user.id));
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [dispatch, user?.id]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#3660f9" barStyle="light-content" />
      
      {/* Professional Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>
              {user?.first_name || ''} {user?.middle_name || ''} {user?.last_name || ''}
            </Text>
            <Text style={styles.dateText}>{getCurrentDate()}</Text>
          </View>
          <View style={styles.statusIndicator}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Active</Text>
          </View>
        </View>
        
        {/* Decorative Elements */}
        <View style={styles.headerDecoration}>
          <View style={styles.decorationCircle1} />
          <View style={styles.decorationCircle2} />
        </View>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.mainContainer}>
          {/* Quick Stats Section */}
          <View style={styles.section}>
            
            <ContributionCard />
          </View>

          {/* Monthly Statistics */}
          <View style={styles.section}>
            {/* <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Monthly Statistics</Text>
              <Text style={styles.sectionSubtitle}>Performance tracking</Text>
            </View> */}
            <MonthStats />
          </View>

          {/* Leave Information */}
          <View style={styles.section}>
           
            <LeaveInfo showViewButton={true} />
          </View>

          {/* Events & Updates */}
          <View style={styles.section}>
          
            <EventsList />
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#3660f9',
    paddingTop: p(10),
    paddingBottom: p(15),
    paddingHorizontal: p(20),
    borderBottomLeftRadius: p(30),
    borderBottomRightRadius: p(30),
    shadowColor: '#3660f9',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: p(14),
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Rubik-Regular',
    marginBottom: p(6),
  },
  userName: {
    fontSize: p(18),
    color: '#ffffff',
    fontFamily: 'Montserrat-Bold',
    marginBottom: p(6),
    lineHeight: p(20),
  },
  dateText: {
    fontSize: p(14),
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Rubik-Regular',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: p(12),
    paddingVertical: p(8),
    borderRadius: p(25),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statusDot: {
    width: p(8),
    height: p(8),
    borderRadius: p(4),
    backgroundColor: '#4caf50',
    marginRight: p(6),
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: p(12),
    color: '#ffffff',
    fontFamily: 'Rubik-Medium',
  },
  headerDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    zIndex: 1,
  },
  decorationCircle1: {
    position: 'absolute',
    top: -p(50),
    right: -p(30),
    width: p(100),
    height: p(100),
    borderRadius: p(50),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorationCircle2: {
    position: 'absolute',
    bottom: -p(40),
    left: -p(20),
    width: p(80),
    height: p(80),
    borderRadius: p(40),
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: p(20),
  },
  mainContainer: {
    paddingHorizontal: p(20),
    paddingTop: p(20),
  },
  section: {
    marginBottom: p(5),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems: 'center',
    // marginBottom: p(15),
    // paddingLeft: p(4),
  },
  sectionTitle: {
    fontSize: p(20),
    fontFamily: 'Montserrat-Bold',
    color: '#1e293b',
    flex: 1,
  },
  sectionSubtitle: {
    fontSize: p(14),
    fontFamily: 'Rubik-Regular',
    color: '#64748b',
    marginTop: p(2),
  },
  sectionBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: p(8),
    paddingVertical: p(4),
    borderRadius: p(12),
  },
  sectionBadgeText: {
    fontSize: p(10),
    fontFamily: 'Rubik-Medium',
    color: '#ffffff',
  },
  bottomSpacing: {
    height: p(20),
  },
});
