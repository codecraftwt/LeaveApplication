import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import DashboardScreen from '../screens/user/DashboardScreen';
import CustomDrawer from '../components/CustomDrawer';
import { Image } from 'react-native';
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

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const DrawerRoutes = () => (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#3360f9' },
        headerTintColor: '#fff',
        headerTitleAlign: 'left',
        headerTitleStyle: { fontFamily: 'Poppins-SemiBold', fontSize: 20 },
        headerRight: () => (
          <Image
            source={require('../assets/walstar11.png')}
            style={{ width: 90, height: 80, marginRight: 16 }}
            resizeMode="contain"
          />
        ),
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} options={{ headerTitle: '' }} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      {/* <Drawer.Screen name="Leaves" component={Leaves} /> */}
      <Drawer.Screen name="My Leaves" component={MyLeaves} />
      <Drawer.Screen name="All Leaves" component={AllLeaves} />
      <Drawer.Screen name="Employee Status" component={MyStatus} />
      <Drawer.Screen name="List Status" component={ListStatus} />
      <Drawer.Screen name="Salary Slip" component={SalarySlip} />
      <Drawer.Screen name="Employee Analytics" component={EmployeeAnalytics} />
      <Drawer.Screen name="Hours Report" component={HoursReport} />
      <Drawer.Screen name="Dinner" component={Dinner} />
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
    </Stack.Navigator>
);

export default AppNavigator;
