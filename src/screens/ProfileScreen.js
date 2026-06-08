import React, { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { p } from '../utils/Responsive';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import { useSelector, useDispatch } from 'react-redux';
import { getUser } from '../redux/slices/authSlice';

const tempProfile = {
  avatar: require('../assets/logow.png'),
};

function formatDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`;
}

function ProfileScreen() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const userDetails = useSelector(state => state.auth.userDetails);

  useEffect(() => {
    if (user?.id) {
      dispatch(getUser(user.id));
    }
  }, [dispatch, user?.id]);

  const profile = userDetails;

  return (
    <View style={styles.container}>
      {/* Fixed Profile Card at the top */}
      <View style={styles.headerContainer}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarRing}>
              <Image style={styles.image} source={tempProfile.avatar} />
            </View>
            <View style={styles.activeBadge} />
          </View>
          
          <View style={styles.profileInfoContainer}>
            <Text style={styles.username}>
              {profile?.name || `${profile?.first_name || ''} ${profile?.last_name || ''}` || 'Loading...'}
            </Text>
            
            <View style={styles.badgesRow}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {profile?.user_role?.name || profile?.role || 'Employee'}
                </Text>
              </View>
              <View style={styles.idContainer}>
                <Feather name="hash" size={p(12)} color="#94A3B8" />
                <Text style={styles.empId}>
                   <Text style={styles.empIdValue}>{profile?.employee_id || 'N/A'}</Text>
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Scrollable details below */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: p(40) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Cards */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Profile Details</Text>
          
          <View style={styles.detailsContainer}>
            <InfoItem 
              icon="calendar" 
              label="Joining Date" 
              value={formatDate(profile?.joining_date) || '-'} 
            />
            <InfoItem 
              icon="mail" 
              label="Company Email" 
              value={profile?.email || '-'} 
            />
            <InfoItem 
              icon="phone" 
              label="Mobile Number" 
              value={profile?.user_otherdetails?.phone || profile?.phone || '-'} 
            />
            <InfoItem 
              icon="gift" 
              label="Date of Birth" 
              value={formatDate(profile?.birth_date) || '-'} 
            />
            <InfoItem 
              icon="map-pin" 
              label="Address" 
              value={profile?.user_otherdetails?.address || profile?.address || '-'} 
              isLast
            />
          </View>
        </View>

        {/* Delete Account */}
        <TouchableOpacity style={styles.deleteBtn} activeOpacity={0.8}>
          <MaterialIcons
            name="delete-outline"
            size={p(22)}
            color="#EF4444"
            style={{ marginRight: p(8) }}
          />
          <Text style={styles.deleteBtnText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const InfoItem = ({ icon, label, value, isLast }) => (
  <View style={[styles.infoItemRow, isLast && styles.lastItemRow]}>
    <View style={styles.iconWrap}>
      <Feather name={icon} size={p(18)} color="#3660f9" />
    </View>
    <View style={styles.infoTextWrap}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} textBreakStrategy="simple">
        {value}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    paddingHorizontal: p(20),
    paddingTop: p(20),
    paddingBottom: p(16), // Increased space before scroll view
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: p(20),
    paddingTop: p(8), // Added padding top for breathing room
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: p(20),
    padding: p(20),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#3660f9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: p(16),
  },
  avatarRing: {
    padding: p(3),
    borderRadius: p(45),
    borderWidth: 2,
    borderColor: '#EEF2FF',
    backgroundColor: '#FFFFFF',
  },
  image: {
    height: p(70),
    width: p(70),
    resizeMode: 'contain',
    borderRadius: p(35),
    backgroundColor: '#F8FAFC',
  },
  activeBadge: {
    position: 'absolute',
    bottom: p(4),
    right: p(4),
    width: p(14),
    height: p(14),
    borderRadius: p(7),
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  username: {
    fontSize: p(18),
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
    marginBottom: p(6),
    letterSpacing: -0.2,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: p(8),
  },
  roleBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: p(10),
    paddingVertical: p(4),
    borderRadius: p(8),
  },
  roleText: {
    color: '#3660f9',
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(11),
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: p(8),
    paddingVertical: p(4),
    borderRadius: p(8),
  },
  empId: {
    marginLeft: p(4),
    fontSize: p(11),
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
  },
  empIdValue: {
    fontFamily: 'Poppins-Bold',
    color: '#334155',
  },
  infoSection: {
    marginBottom: p(8),
  },
  sectionTitle: {
    fontSize: p(16),
    fontFamily: 'Poppins-Bold',
    color: '#1E293B',
    marginBottom: p(16),
    marginLeft: p(4),
    letterSpacing: -0.2,
  },
  detailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: p(24),
    padding: p(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  infoItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: p(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lastItemRow: {
    borderBottomWidth: 0,
  },
  iconWrap: {
    width: p(44),
    height: p(44),
    borderRadius: p(14),
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(16),
  },
  infoTextWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: p(12),
    color: '#94A3B8',
    fontFamily: 'Poppins-Medium',
    marginBottom: p(2),
  },
  infoValue: {
    fontSize: p(14),
    fontFamily: 'Poppins-SemiBold',
    color: '#334155',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: p(20),
    marginTop: p(24),
    paddingVertical: p(16),
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  deleteBtnText: {
    color: '#EF4444',
    fontFamily: 'Poppins-Bold',
    fontSize: p(15),
  },
});

export default ProfileScreen;
