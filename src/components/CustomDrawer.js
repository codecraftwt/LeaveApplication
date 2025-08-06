import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { p } from '../utils/Responsive';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { handleLogout } from '../utils/helpers';
import { useDispatch, useSelector } from 'react-redux';
import { getUser } from '../redux/slices/authSlice';

const menuItems = [
  { label: 'Dashboard', icon: 'grid', screen: 'Dashboard' },
  { label: 'Profile', icon: 'user', screen: 'Profile' },
  {
    label: 'Leave',
    icon: 'calendar',
    children: [
      {
        label: 'My Leaves',
        icon: 'id-badge',
        screen: 'My Leaves',
        iconType: 'FontAwesome5',
      },
      {
        label: 'All Leaves',
        icon: 'users',
        screen: 'All Leaves',
        iconType: 'Feather',
        allowedRoles: [1, 3, 10, 11, 12],
      },
    ],
  },
  {
    label: 'Employee Status',
    icon: 'check-square',
    children: [
      {
        label: 'My Status',
        icon: 'user-check',
        screen: 'Employee Status',
        iconType: 'Feather',
      },
      {
        label: 'List Status',
        icon: 'list',
        screen: 'List Status',
        iconType: 'Feather',
        allowedRoles: [1, 3, 10, 11, 12, 13],
      },
    ],
  },
  { label: 'Salary Slip', icon: 'dollar-sign', screen: 'Salary Slip' },
  {
    label: 'Employee Analytics',
    icon: 'bar-chart-2',
    screen: 'Employee Analytics',
  },
  {
    label: 'Hours Report',
    icon: 'clock',
    screen: 'Hours Report',
    allowedRoles: [1, 3, 10, 11, 12, 13, 14],
  },
  {
    label: 'Food Court',
    icon: 'coffee',
    children: [
      {
        label: 'Dinner',
        icon: 'utensils',
        screen: 'Dinner',
        iconType: 'FontAwesome5',
      },
    ],
  },
];

export default function CustomDrawer(props) {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const userDetails = useSelector(state => state.auth.userDetails);
  // console.log('userDetails--------------------------------->', userDetails);

  useEffect(() => {
    if (user?.id) {
      dispatch(getUser(user.id));
    }
  }, [dispatch, user?.id]);

  const { navigation } = props;
  const [expanded, setExpanded] = useState({});

  // Function to filter menu items based on user role
  const getFilteredMenuItems = () => {
    const userRoleId = userDetails?.role || userDetails?.user_role?.id;

    return menuItems
      .filter(item => {
        // If no allowedRoles specified, show for all users
        if (!item.allowedRoles) {
          // If item has children, filter the children as well
          if (item.children) {
            const filteredChildren = item.children.filter(child => {
              if (!child.allowedRoles) {
                return true;
              }
              return child.allowedRoles.includes(userRoleId);
            });

            // Only show parent if it has visible children
            return filteredChildren.length > 0;
          }
          return true;
        }

        // Check if user's role is in the allowed roles list
        return item.allowedRoles.includes(userRoleId);
      })
      .map(item => {
        // If item has children, filter them based on role
        if (item.children) {
          return {
            ...item,
            children: item.children.filter(child => {
              if (!child.allowedRoles) {
                return true;
              }
              return child.allowedRoles.includes(userRoleId);
            }),
          };
        }
        return item;
      });
  };

  const handleExpand = label => {
    setExpanded(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const renderIcon = (icon, iconType = 'Feather') => {
    if (iconType === 'FontAwesome5') {
      return (
        <FontAwesome5
          name={icon}
          size={p(20)}
          color="#3360f9"
          style={styles.menuIcon}
        />
      );
    }
    return (
      <Feather
        name={icon}
        size={p(22)}
        color="#3360f9"
        style={styles.menuIcon}
      />
    );
  };

  const confirmLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => {
            handleLogout();
            props.navigation.replace('Login');
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={require('../assets/logow.png')}
            style={styles.avatar}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.name}>
          {userDetails?.name ||
            `${userDetails?.first_name || ''} ${userDetails?.last_name || ''}`}
        </Text>
        <Text style={styles.role}>
          {userDetails?.user_role?.name || userDetails?.role || ''}
        </Text>
      </View>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.menuSection}>
          {getFilteredMenuItems().map((item, idx) => {
            if (item.children) {
              const isOpen = expanded[item.label];
              return (
                <View key={item.label}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleExpand(item.label)}
                  >
                    {renderIcon(item.icon)}
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Feather
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={p(18)}
                      color="#3360f9"
                      style={{ marginLeft: 'auto' }}
                    />
                  </TouchableOpacity>
                  {isOpen && (
                    <View style={styles.subMenuSection}>
                      {item.children.map(child => (
                        <TouchableOpacity
                          key={child.label}
                          style={styles.subMenuItem}
                          onPress={() => navigation.navigate(child.screen)}
                        >
                          {renderIcon(child.icon, child.iconType)}
                          <Text style={styles.subMenuLabel}>{child.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            }
            return (
              <TouchableOpacity
                key={item.label}
                style={styles.menuItem}
                onPress={() => navigation.navigate(item.screen)}
              >
                {renderIcon(item.icon)}
                <Text style={styles.menuLabel}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </DrawerContentScrollView>
      <TouchableOpacity style={styles.logoutContainer} onPress={confirmLogout}>
        <Feather name="log-out" size={p(22)} color="red" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // marginTop: p(10),
  },
  header: {
    backgroundColor: '#3360f9',
    alignItems: 'center',
    paddingTop: p(70),
    paddingBottom: p(24),
    borderBottomLeftRadius: p(32),
    borderBottomRightRadius: p(32),
    marginTop: p(-15),
  },
  avatarContainer: {
    backgroundColor: '#fff',
    borderRadius: p(60),
    padding: p(6),
    marginBottom: p(10),
  },
  avatar: {
    width: p(70),
    height: p(70),
    borderRadius: p(35),
    backgroundColor: '#fff',
  },
  name: {
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    fontSize: p(18),
    marginBottom: p(2),
    textAlign: 'center',
  },
  role: {
    color: '#fff',
    fontFamily: 'Poppins-Regular',
    fontSize: p(14),
    marginBottom: p(6),
    textAlign: 'center',
    opacity: 0.85,
  },
  menuSection: {
    // marginTop: p(-35),
    paddingHorizontal: p(18),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(14),
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  menuIcon: {
    marginRight: p(18),
  },
  menuLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(15),
    color: '#222',
  },
  subMenuSection: {
    backgroundColor: '#f7faff',
    paddingLeft: p(30),
    paddingBottom: p(4),
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(10),
  },
  subMenuLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: p(14),
    color: '#444',
    marginLeft: p(10),
  },
  logoutContainer: {
    padding: p(18),
    borderTopWidth: 1,
    borderTopColor: '#f2f2f2',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(27), // Move the logout button up
  },
  logoutText: {
    color: 'red',
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(16),
    marginLeft: p(8),
  },
});
