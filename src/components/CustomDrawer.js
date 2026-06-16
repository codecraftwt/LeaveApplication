import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
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

  const renderIcon = (icon, iconType = 'Feather', iconBg = '#EEF2FF') => {
    const iconEl = iconType === 'FontAwesome5' ? (
      <FontAwesome5 name={icon} size={p(18)} color="#3660f9" />
    ) : (
      <Feather name={icon} size={p(18)} color="#3660f9" />
    );
    return (
      <View style={[styles.menuIconBg, { backgroundColor: iconBg }]}>
        {iconEl}
      </View>
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

  // ── Header entrance animation ───────────────────────────────────────────
  const headerFade = useRef(new Animated.Value(0)).current;
  const avatarScale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.spring(avatarScale, { toValue: 1, tension: 70, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const displayName =
    userDetails?.name ||
    `${userDetails?.first_name || ''} ${userDetails?.last_name || ''}`.trim() ||
    'User';
  const displayRole = userDetails?.user_role?.name || userDetails?.role || 'Employee';

  return (
    <View style={styles.container}>
      {/* ── Clean Modern Header ── */}
      <Animated.View style={[styles.header, { opacity: headerFade }]}>
        {/* Avatar */}
        <Animated.View style={[styles.avatarWrapper, { transform: [{ scale: avatarScale }] }]}>
          <View style={styles.avatarRing}>
            <Image
              source={require('../assets/logow.png')}
              style={styles.avatar}
              resizeMode="contain"
            />
          </View>
          <View style={styles.activeBadge} />
        </Animated.View>

        <Text style={styles.name}>{displayName}</Text>

        <View style={styles.rolePill}>
          <Text style={styles.roleText}>{displayRole}</Text>
        </View>
      </Animated.View>
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
                    activeOpacity={0.75}
                  >
                    <View style={styles.menuItemLeft}>
                      {renderIcon(item.icon, 'Feather', '#EEF2FF')}
                      <Text style={styles.menuLabel}>{item.label}</Text>
                    </View>
                    <Animated.View
                      style={{
                        transform: [{ rotate: isOpen ? '180deg' : '0deg' }],
                      }}
                    >
                      <Feather name="chevron-down" size={p(16)} color="#94A3B8" />
                    </Animated.View>
                  </TouchableOpacity>
                  {isOpen && (
                    <View style={styles.subMenuSection}>
                      {item.children.map(child => (
                        <TouchableOpacity
                          key={child.label}
                          style={styles.subMenuItem}
                          onPress={() => navigation.navigate(child.screen, child.params)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.subMenuDot} />
                          {renderIcon(child.icon, child.iconType, '#F0F9FF')}
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
                activeOpacity={0.75}
              >
                <View style={styles.menuItemLeft}>
                  {renderIcon(item.icon, 'Feather', '#EEF2FF')}
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <Feather name="chevron-right" size={p(16)} color="#CBD5E1" />
              </TouchableOpacity>
            );
          })}
        </View>
      </DrawerContentScrollView>
      <TouchableOpacity style={styles.logoutContainer} onPress={confirmLogout} activeOpacity={0.85}>
        <View style={styles.logoutIconWrap}>
          <Feather name="log-out" size={p(18)} color="#E11D48" />
        </View>
        <Text style={styles.logoutText}>Sign Out</Text>
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

  // ── Header ──
  header: {
    backgroundColor: '#3660f9',
    alignItems: 'center',
    paddingTop: p(44),
    paddingBottom: p(26),
    paddingHorizontal: p(20),
    borderBottomLeftRadius: p(28),
    borderBottomRightRadius: p(28),
    shadowColor: '#3660f9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: p(6),
  },

  // Avatar
  avatarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: p(14),
  },
  avatarRing: {
    width: p(82),
    height: p(82),
    borderRadius: p(41),
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  avatar: {
    width: p(70),
    height: p(70),
    borderRadius: p(35),
    backgroundColor: '#F1F5F9',
  },
  activeBadge: {
    position: 'absolute',
    bottom: p(3),
    right: p(3),
    width: p(13),
    height: p(13),
    borderRadius: p(7),
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#3660f9',
  },

  // Name & role
  name: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    fontSize: p(18),
    textAlign: 'center',
    marginBottom: p(8),
    letterSpacing: 0.2,
  },
  rolePill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: p(20),
    paddingHorizontal: p(16),
    paddingVertical: p(5),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  roleText: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Poppins-Medium',
    fontSize: p(12),
  },
  menuSection: {
    paddingHorizontal: p(14),
    paddingTop: p(4),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: p(12),
    paddingHorizontal: p(14),
    marginBottom: p(10),
    backgroundColor: '#FFFFFF',
    borderRadius: p(16),
    shadowColor: '#1a2980',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconBg: {
    width: p(38),
    height: p(38),
    borderRadius: p(11),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(12),
  },
  menuIcon: {
    marginRight: p(14),
  },
  menuLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(14),
    color: '#1E293B',
    flex: 1,
  },
  subMenuSection: {
    backgroundColor: '#F8FAFF',
    borderRadius: p(14),
    marginTop: p(-4),
    marginBottom: p(10),
    marginHorizontal: p(4),
    paddingVertical: p(6),
    borderWidth: 1,
    borderColor: '#E8EDFF',
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(10),
    paddingHorizontal: p(14),
    borderRadius: p(10),
  },
  subMenuDot: {
    width: p(5),
    height: p(5),
    borderRadius: p(3),
    backgroundColor: '#93C5FD',
    marginRight: p(8),
  },
  subMenuLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: p(13),
    color: '#475569',
    marginLeft: p(8),
    flex: 1,
  },
  logoutContainer: {
    marginHorizontal: p(16),
    marginBottom: p(30),
    marginTop: p(4),
    borderRadius: p(16),
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FFE4E6',
    paddingVertical: p(14),
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    gap: p(10),
  },
  logoutIconWrap: {
    width: p(34),
    height: p(34),
    borderRadius: p(10),
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#E11D48',
    fontFamily: 'Poppins-Bold',
    fontSize: p(15),
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
