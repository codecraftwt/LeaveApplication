import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { p } from '../../utils/Responsive';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { getLeaves } from '../../redux/slices/leaveSlice';
import { useFocusEffect } from '@react-navigation/native';
import LeaveInfo from '../../components/dashboard/LeaveInfo';

const leaveTypeColors = {
  Casual: '#4fc3f7',
  Medical: '#81c784',
  Emergency: '#ffb74d',
  Join: '#ba68c8',
};

const statusColors = {
  Approved: '#22bb33',
  Pending: '#ff9800',
  Rejected: '#e53935',
};

function LeaveCard({ item }) {
  const leftColor = leaveTypeColors[item.type] || '#90caf9';
  const statusColor = statusColors[item.status] || '#888';

  return (
    <View style={[styles.leaveCard, { borderLeftColor: leftColor }]}>
      <View style={styles.leaveCardHeader}>
        <Text style={styles.leaveCardName}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.leaveCardRow}>
        <View style={styles.leaveCardCol}>
          <View style={styles.iconLabelRow}>
            <Feather name="tag" size={p(16)} color={leftColor} style={styles.icon} />
            <Text style={styles.leaveCardLabel}>Type</Text>
          </View>
          <Text style={styles.leaveCardValue}>{item.type}</Text>
        </View>

        <View style={styles.leaveCardCol}>
          <View style={styles.iconLabelRow}>
            <MaterialIcons name="date-range" size={p(16)} color="#3360f9" style={styles.icon} />
            <Text style={styles.leaveCardLabel}>Date</Text>
          </View>
          <Text style={styles.leaveCardValue}>{item.date}</Text>
        </View>

        <View style={styles.leaveCardColDays}>
          <View style={styles.iconLabelRow}>
            <Feather name="calendar" size={p(16)} color="#3360f9" style={styles.icon} />
            <Text style={styles.leaveCardLabel}>Days</Text>
          </View>
          <Text style={styles.leaveCardValue}>{item.days}</Text>
        </View>
      </View>

      <View style={styles.leaveCardRow}>
        <View style={styles.leaveCardColFull}>
          <Text style={styles.leaveCardLabel}>Reason</Text>
          <Text style={styles.leaveCardValue}>{item.reason || '-'}</Text>
        </View>
      </View>
    </View>
  );
}

// Add a helper to format date strings to dd-mm-yy
function formatDateDMY(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}-${m}-${y.slice(2)}`;
}

const MyLeaves = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { leaves, loading, error } = useSelector(state => state.leaves);
  const leaveList = (leaves?.leave || []).slice().reverse();

  useFocusEffect(
    React.useCallback(() => {
      dispatch(getLeaves());
    }, [dispatch])
  );

  return (
    <View style={styles.container}>
      <LeaveInfo taken={9} pending={0.5} showViewButton={false} />
      <View style={styles.headerSection}>
        <Text style={styles.detailsTitle}>My Leave Details</Text>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => navigation.navigate('AddLeave')}
          activeOpacity={0.8}
        >
          <Text style={styles.applyButtonText}>Apply for Leave</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.divider} />
      {loading && (
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <ActivityIndicator size="large" color="#3360f9" />
        </View>
      )}
      {error && (
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>{error}</Text>
      )}
      <FlatList
        data={leaveList}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <LeaveCard
            item={{
              name: `${item.userdata?.first_name || ''} ${item.userdata?.last_name || ''}`,
              type: item.type?.name || '',
              date: item.from_date === item.to_date
                ? formatDateDMY(item.from_date)
                : `${formatDateDMY(item.from_date)} - ${formatDateDMY(item.to_date)}`,
              days: item.no_of_days,
              status: item.status === 1 ? 'Approved' : item.status === 0 ? 'Pending' : 'Rejected',
              reason: item.leave_description,
            }}
          />
        )}
        contentContainerStyle={{ paddingBottom: 32, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default MyLeaves;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fb',
    padding: p(12),
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(10),
    paddingHorizontal: p(4),
    paddingVertical: p(10),
    backgroundColor: '#fff',
    borderRadius: p(14),
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e4ea',
    marginVertical: p(12),
    borderRadius: 1,
  },
  detailsTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(17),
    color: '#222',
    letterSpacing: 0.2,
  },
  applyButton: {
    backgroundColor: '#3360f9',
    borderRadius: p(8),
    paddingVertical: p(8),
    paddingHorizontal: p(18),
    shadowColor: '#3360f9',
    shadowOpacity: 0.10,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  applyButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(15),
    letterSpacing: 0.2,
  },
  leaveCard: {
    backgroundColor: '#fff',
    borderRadius: p(18),
    marginBottom: p(18),
    padding: p(18),
    borderLeftWidth: p(6),
    borderLeftColor: '#3360f9',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  leaveCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(10),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: p(10),
  },
  leaveCardName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(16),
    color: '#222',
    flex: 1,
    letterSpacing: 0.1,
  },
  statusBadge: {
    borderRadius: p(16),
    paddingHorizontal: p(14),
    paddingVertical: p(4),
    alignItems: 'center',
    backgroundColor: '#f4f6fb',
    // borderWidth: 1.5,
    // borderColor: '#3360f9',
    minWidth: p(70),
  },
  statusText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(13),
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  leaveCardRow: {
    flexDirection: 'row',
    marginBottom: p(6),
    alignItems: 'flex-start',
  },
  leaveCardCol: {
    flex: 1,
    alignItems: 'flex-start',
    minWidth: p(90),
  },
  leaveCardColDays: {
    alignItems: 'flex-end',
    minWidth: p(60),
    marginLeft: 'auto',
  },
  leaveCardColFull: {
    flex: 1,
    marginTop: p(4),
  },
  leaveCardLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: p(12),
    color: '#888',
    marginBottom: p(2),
    letterSpacing: 0.1,
  },
  leaveCardValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(14),
    color: '#333',
    letterSpacing: 0.1,
  },
  iconLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: p(5),
  },
});
