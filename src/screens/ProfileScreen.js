import React, { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { globalColors } from '../theme/globalColors';
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
      <ScrollView
        style={styles.mainContainer}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <Image style={styles.image} source={tempProfile.avatar} />
          </View>
          <Text style={styles.username}>
            {profile?.name ||
              `${profile?.first_name || ''} ${profile?.last_name || ''}`}
          </Text>
          <Text style={styles.infoValue1}>EmpId : {profile?.employee_id}</Text>
          <View style={styles.roleBox}>
            <Text style={styles.role}>
              {profile?.user_role?.name || profile?.role || ''}
            </Text>
          </View>
        </View>
        <View style={styles.infoSection}>
          <View style={styles.infoItemRow}>
            <Feather
              name="calendar"
              size={20}
              color="#3660f9"
              style={styles.infoIcon}
            />
            <View>
              <Text style={styles.infoLabel}>Joining Date</Text>
              <Text style={styles.infoValue}>
                {formatDate(profile?.joining_date)}
              </Text>
            </View>
          </View>
          <View style={styles.infoItemRow}>
            <Feather
              name="mail"
              size={20}
              color="#3660f9"
              style={styles.infoIcon}
            />
            <View>
              <Text style={styles.infoLabel}>Company Mail</Text>
              <Text style={styles.infoValue}>{profile?.email}</Text>
            </View>
          </View>
          <View style={styles.infoItemRow}>
            <Feather
              name="phone"
              size={20}
              color="#3660f9"
              style={styles.infoIcon}
            />
            <View>
              <Text style={styles.infoLabel}>Mobile No</Text>
              <Text style={styles.infoValue}>
                {profile?.user_otherdetails?.phone || profile?.phone || ''}
              </Text>
            </View>
          </View>
          <View style={styles.infoItemRow}>
            <Feather
              name="gift"
              size={20}
              color="#3660f9"
              style={styles.infoIcon}
            />
            <View>
              <Text style={styles.infoLabel}>Date of Birth</Text>
              <Text style={styles.infoValue}>
                {formatDate(profile?.birth_date)}
              </Text>
            </View>
          </View>
          <View style={styles.infoItemRow}>
            <Feather
              name="map-pin"
              size={20}
              color="#3660f9"
              style={styles.infoIcon}
            />
            <View>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={[styles.infoValue, { marginRight: 15 }]}>
                {profile?.user_otherdetails?.address || profile?.address || ''}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.deleteBtn}>
          <MaterialIcons
            name="delete"
            size={22}
            color="#EF0107"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.deleteBtnText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3660f9',
  },
  mainContainer: {
    backgroundColor: '#f6f8fa',
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: p(18),
    paddingVertical: p(8),
    paddingHorizontal: p(10),
    marginTop: p(10),
    marginHorizontal: p(16),
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  avatarWrapper: {
    borderWidth: 3,
    borderColor: '#e6e6e6',
    borderRadius: p(60),
    padding: 4,
    backgroundColor: '#fff',
    marginBottom: p(10),
  },
  image: {
    height: p(80),
    width: p(80),
    resizeMode: 'contain',
    borderRadius: p(50),
    backgroundColor: '#fff',
    borderColor: '#e6e6e6',
    borderWidth: p(2),
  },
  username: {
    fontSize: p(18),
    fontFamily: 'Rubik-Bold',
    color: '#222',
    marginTop: p(6),
  },
  roleBox: {
    backgroundColor: '#3660f9',
    borderRadius: p(12),
    paddingVertical: p(5),
    paddingHorizontal: p(10),
    marginVertical: p(5),
    alignSelf: 'center',
  },
  role: {
    fontSize: p(13),
    fontFamily: 'Rubik-Regular',
    color: '#FFF',
    textAlign: 'center',
    flexWrap: 'nowrap',
    flexShrink: 1,
  },
  infoSection: {
    marginTop: p(24),
    backgroundColor: '#fff',
    borderRadius: p(14),
    paddingVertical: p(10),
    paddingHorizontal: p(10),
    marginHorizontal: p(16),
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  infoItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
    paddingHorizontal: p(6),
  },
  infoIcon: {
    marginRight: p(14),
    width: p(28),
    textAlign: 'center',
  },
  infoLabel: {
    fontSize: p(14),
    color: '#5C5C5C',
    fontFamily: 'Montserrat-Regular',
  },
  infoValue: {
    fontSize: p(16),
    fontFamily: 'Rubik-Regular',
    color: '#333333',
  },
  infoValue1: {
    fontSize: p(14),
    fontFamily: 'Rubik-Regular',
    color: '#4D4D4D',
    marginTop: 2,
    marginBottom: 2,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: p(12),
    marginTop: p(32),
    marginHorizontal: p(16),
    paddingVertical: p(14),
    elevation: 2,
    shadowColor: '#EF0107',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#EF0107',
  },
  deleteBtnText: {
    color: '#EF0107',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: p(15),
  },
});

export default ProfileScreen;
