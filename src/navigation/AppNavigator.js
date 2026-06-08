import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import AnimatedTabBar from '../components/AnimatedTabBar';
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import DashboardScreen from '../screens/user/DashboardScreen';
import CustomDrawer from '../components/CustomDrawer';
import ProfileScreen from '../screens/ProfileScreen';
// import Leaves from '../screens/Leaves';
import MyLeaves from '../screens/leave/MyLeaves';
import AllLeaves from '../screens/leave/AllLeaves';
import MyStatus from '../screens/report/MyStatus';
import ListStatus from '../screens/report/ListStatus';
import SalarySlip from '../screens/salary/SalarySlip';
import EmployeeAnalytics from '../screens/hours/EmployeeAnalytics';
import HoursReport from '../screens/hours/HoursReport';
import Dinner from '../screens/food/Dinner';
import AddLeave from '../screens/leave/AddLeave';
import LeaveReason from '../screens/leave/LeaveReason';
import RegisterScreen from '../screens/auth/RegisterScreen';
import AnnualSleep from '../screens/salary/AnnualSleep';
import MonthlySleep from '../screens/salary/MonthlySleep';

console.log('DEBUG APPNAVIGATOR IMPORTS:');
console.log('createBottomTabNavigator:', createBottomTabNavigator);
console.log('Feather:', Feather);
console.log('DashboardScreen:', DashboardScreen);
console.log('ProfileScreen:', ProfileScreen);
console.log('MyLeaves:', MyLeaves);
console.log('EmployeeAnalytics:', EmployeeAnalytics);
console.log('Dinner:', Dinner);

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const TabRoutes = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3660f9',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#FFFFFF',
        headerTitleAlign: 'left',
        headerTitleStyle: { fontFamily: 'Poppins-Bold', fontSize: 20 },
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={{ marginLeft: 16 }}>
            <Feather name="menu" size={24} color="#fff" />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <Image
            source={require('../assets/walstar11.png')}
            style={{ width: 90, height: 80, marginRight: 16 }}
            resizeMode="contain"
          />
        ),
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Feather name="home" color={color} size={22} />,
          headerTitle: 'Dashboard'
        }}
      />
      <Tab.Screen
        name="My Leaves"
        component={MyLeaves}
        options={{
          tabBarLabel: 'Leaves',
          tabBarIcon: ({ color }) => <Feather name="calendar" color={color} size={22} />,
          headerTitle: 'My Leaves'
        }}
      />
      <Tab.Screen
        name="Employee Analytics"
        component={EmployeeAnalytics}
        options={{
          tabBarLabel: 'Analytics',
          tabBarIcon: ({ color }) => <Feather name="bar-chart-2" color={color} size={22} />,
          headerTitle: 'Employee Analytics'
        }}
      />
      <Tab.Screen
        name="Dinner"
        component={Dinner}
        options={{
          tabBarLabel: 'Food',
          tabBarIcon: ({ color }) => <Feather name="coffee" color={color} size={22} />,
          headerTitle: 'Food Court'
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Feather name="user" color={color} size={22} />,
          headerTitle: 'My Profile'
        }}
      />
    </Tab.Navigator>
  );
};

const DrawerRoutes = () => (
  <Drawer.Navigator
    drawerContent={props => <CustomDrawer {...props} />}
    screenOptions={{
      drawerStyle: {
        width: 300,
      },
      headerStyle: {
        backgroundColor: '#3660f9',
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTintColor: '#FFFFFF',
      headerTitleAlign: 'left',
      headerTitleStyle: { fontFamily: 'Poppins-Bold', fontSize: 20 },
      headerRight: () => (
        <Image
          source={require('../assets/walstar11.png')}
          style={{ width: 90, height: 80, marginRight: 16 }}
          resizeMode="contain"
        />
      ),
    }}
  >
    <Drawer.Screen name="HomeTabs" component={TabRoutes} options={{ headerShown: false, title: 'Home' }} />
    {/* <Drawer.Screen name="Leaves" component={Leaves} /> */}
    <Drawer.Screen name="All Leaves" component={AllLeaves} />
    <Drawer.Screen name="Employee Status" component={MyStatus} />
    <Drawer.Screen name="List Status" component={ListStatus} />
    <Drawer.Screen name="Salary Slip" component={SalarySlip} />
    <Drawer.Screen name="Hours Report" component={HoursReport} />
    {/* Add other screens here as needed */}
  </Drawer.Navigator>
);

const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Splash" component={SplashScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Drawer" component={DrawerRoutes} />
    <Stack.Screen name="AddLeave" component={AddLeave} />
    <Stack.Screen name="LeaveReason" component={LeaveReason} />
    <Stack.Screen name="SalarySlip" component={SalarySlip} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="AnnualSleep" component={AnnualSleep} />
    <Stack.Screen name="MonthlySleep" component={MonthlySleep} />
  </Stack.Navigator>
);

export default AppNavigator;
