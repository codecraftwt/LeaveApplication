import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  TouchableWithoutFeedback,
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
  { label: 'Dashboard', icon: 'grid', screen: 'HomeTabs', params: { screen: 'Dashboard' } },
  {
    label: 'Leave',
    icon: 'calendar',
    children: [
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
        allowedRoles: [1, 3, 10, 11, 12, 13, 14],
      },
    ],
  },
  { label: 'Salary Slip', icon: 'dollar-sign', screen: 'Salary Slip' },
  {
    label: 'Hours Report',
    icon: 'clock',
    screen: 'Hours Report',
    allowedRoles: [1, 3, 10, 11, 12, 13, 14],
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    handleLogout();
    props.navigation.replace('Login');
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
        contentContainerStyle={{ flexGrow: 1, paddingTop: 10 }}
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
                      color="#64748B"
                      style={{ marginLeft: 'auto' }}
                    />
                  </TouchableOpacity>
                  {isOpen && (
                    <View style={styles.subMenuSection}>
                      {item.children.map(child => (
                        <TouchableOpacity
                          key={child.label}
                          style={styles.subMenuItem}
                          onPress={() => navigation.navigate(child.screen, child.params)}
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
                onPress={() => navigation.navigate(item.screen, item.params)}
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

      {/* Custom Logout Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowLogoutModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <View style={styles.modalIconContainer}>
                  <Feather name="log-out" size={p(22)} color="#E11D48" />
                </View>
                <Text style={styles.modalTitle}>Confirm Logout</Text>
                <Text style={styles.modalMessage}>Are you sure you want to log out of your account?</Text>

                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setShowLogoutModal(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalConfirmButton}
                    onPress={handleLogoutConfirm}
                  >
                    <Text style={styles.modalConfirmText}>Logout</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#3660f9',
    alignItems: 'center',
    paddingTop: p(50),
    paddingBottom: p(30),
    borderBottomLeftRadius: p(30),
    borderBottomRightRadius: p(30),
    shadowColor: '#3660f9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: p(5),
  },
  avatarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: p(50),
    padding: p(4),
    marginBottom: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  avatar: {
    width: p(76),
    height: p(76),
    borderRadius: p(38),
    backgroundColor: '#FFFFFF',
  },
  name: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    fontSize: p(18),
    marginBottom: p(2),
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  role: {
    color: '#E0E7FF',
    fontFamily: 'Poppins-Medium',
    fontSize: p(14),
    textAlign: 'center',
  },
  menuSection: {
    paddingHorizontal: p(16),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(14),
    paddingHorizontal: p(16),
    marginBottom: p(14),
    backgroundColor: '#FFFFFF',
    borderRadius: p(12),
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  menuIcon: {
    marginRight: p(14),
  },
  menuLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(14),
    color: '#1E293B',
  },
  subMenuSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: p(12),
    marginTop: p(-8),
    marginBottom: p(14),
    paddingLeft: p(16),
    paddingVertical: p(8),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(12),
    paddingHorizontal: p(16),
    borderRadius: p(8),
  },
  subMenuLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: p(14),
    color: '#475569',
    marginLeft: p(12),
  },
  logoutContainer: {
    margin: p(16),
    padding: p(16),
    backgroundColor: '#FFF1F2',
    borderRadius: p(16),
    borderWidth: 1,
    borderColor: '#FFE4E6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: p(30),
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: {
    color: '#E11D48',
    fontFamily: 'Poppins-Bold',
    fontSize: p(16),
    marginLeft: p(10),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: p(20),
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: p(20),
    padding: p(20),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconContainer: {
    width: p(50),
    height: p(50),
    borderRadius: p(25),
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: p(12),
  },
  modalTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: p(18),
    color: '#0F172A',
    marginBottom: p(6),
  },
  modalMessage: {
    fontFamily: 'Poppins-Medium',
    fontSize: p(13),
    color: '#64748B',
    textAlign: 'center',
    marginBottom: p(20),
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: p(10),
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: p(12),
    borderRadius: p(10),
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  modalCancelText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(13),
    color: '#475569',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: p(12),
    borderRadius: p(10),
    backgroundColor: '#E11D48',
    alignItems: 'center',
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  modalConfirmText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(13),
    color: '#FFFFFF',
  },
});
