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
  Casual: '#3B82F6',    // Blue
  Medical: '#10B981',   // Emerald
  Emergency: '#EF4444', // Red
  Join: '#8B5CF6',      // Purple
};

const leaveTypeBgColors = {
  Casual: '#EFF6FF',
  Medical: '#ECFDF5',
  Emergency: '#FEF2F2',
  Join: '#F5F3FF',
};

const statusColors = {
  Approved: { bg: '#D1FAE5', text: '#059669' },
  Pending: { bg: '#FEF3C7', text: '#D97706' },
  Rejected: { bg: '#FEE2E2', text: '#DC2626' },
};

function LeaveCard({ item }) {
  const typeColor = leaveTypeColors[item.type] || '#3B82F6';
  const typeBgColor = leaveTypeBgColors[item.type] || '#EFF6FF';
  const statusConfig = statusColors[item.status] || { bg: '#F1F5F9', text: '#64748B' };

  return (
    <View style={styles.leaveCard}>
      <View style={styles.leaveCardHeader}>
        <View style={styles.titleRow}>
          <View style={[styles.colorPill, { backgroundColor: typeColor }]} />
          <Text style={styles.leaveCardName}>{item.name}</Text>
        </View>
        <View style={styles.badgesWrap}>
          <View style={[styles.typeBadge, { backgroundColor: typeBgColor, borderWidth: 1, borderColor: typeColor + '20' }]}>
            <Text style={[styles.typeBadgeText, { color: typeColor }]}>{item.type}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Text style={[styles.statusText, { color: statusConfig.text }]}>{item.status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Feather name="calendar" size={p(13)} color="#64748B" />
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
        <View style={styles.dotSeparator} />
        <View style={styles.detailItem}>
          <Feather name="clock" size={p(13)} color="#64748B" />
          <Text style={styles.detailText}>{item.days} {item.days > 1 ? 'Days' : 'Day'}</Text>
        </View>
      </View>

      {item.reason ? (
        <View style={styles.leaveCardFooter}>
          <Feather name="align-left" size={p(12)} color="#94A3B8" style={{ marginRight: p(6), marginTop: p(2) }} />
          <Text style={styles.leaveCardReason} numberOfLines={1}>
            {item.reason}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

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
      <View>
        <View style={{ paddingTop: p(12), paddingHorizontal: p(16) }}>
          <LeaveInfo showViewButton={false} />
        </View>

        <View style={styles.headerSection}>
          <Text style={styles.detailsTitle}>My Leaves</Text>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => navigation.navigate('AddLeave')}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={p(16)} color="#FFFFFF" style={{ marginRight: p(4) }} />
            <Text style={styles.applyButtonText}>Apply Leave</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={{ alignItems: 'center', marginTop: p(20) }}>
            <ActivityIndicator size="large" color="#3660f9" />
          </View>
        )}
        {error && (
          <Text style={{ color: '#EF0107', textAlign: 'center', marginTop: p(10), fontFamily: 'Poppins-Medium' }}>
            {error}
          </Text>
        )}
      </View>

      <FlatList
        data={leaveList}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: p(16) }}>
            <LeaveCard
              item={{
                name: `${item.userdata?.first_name || ''} ${item.userdata?.last_name || ''}`,
                type: item.type?.name || '',
                date: item.from_date === item.to_date
                  ? formatDateDMY(item.from_date)
                  : `${formatDateDMY(item.from_date)} to ${formatDateDMY(item.to_date)}`,
                days: item.no_of_days,
                status: item.status === 1 ? 'Approved' : item.status === 0 ? 'Pending' : 'Rejected',
                reason: item.leave_description,
              }}
            />
          </View>
        )}
        contentContainerStyle={{ paddingBottom: p(40) }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default MyLeaves;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: p(16),
    marginBottom: p(12),
    marginTop: p(8),
  },
  detailsTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: p(18),
    color: '#1E293B',
    letterSpacing: -0.3,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3660f9', // Primary Blue
    borderRadius: p(12),
    paddingVertical: p(8),
    paddingHorizontal: p(16),
    shadowColor: '#3660f9',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(13),
    letterSpacing: 0.2,
  },
  leaveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: p(16),
    marginBottom: p(12),
    padding: p(14),
    shadowColor: '#64748B',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  leaveCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(10),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: p(10),
  },
  colorPill: {
    width: p(4),
    height: p(16),
    borderRadius: p(2),
    marginRight: p(8),
  },
  leaveCardName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(14),
    color: '#0F172A',
    flex: 1,
  },
  badgesWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: p(6),
  },
  typeBadge: {
    borderRadius: p(6),
    paddingHorizontal: p(8),
    paddingVertical: p(3),
  },
  typeBadgeText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(9),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    borderRadius: p(12),
    paddingHorizontal: p(10),
    paddingVertical: p(4),
  },
  statusText: {
    fontFamily: 'Poppins-Medium',
    fontSize: p(10),
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(10),
    paddingHorizontal: p(12),
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontFamily: 'Poppins-Medium',
    fontSize: p(11.5),
    color: '#475569',
    marginLeft: p(6),
  },
  dotSeparator: {
    width: p(4),
    height: p(4),
    borderRadius: p(2),
    backgroundColor: '#CBD5E1',
    marginHorizontal: p(10),
  },
  leaveCardFooter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: p(8),
    paddingHorizontal: p(10),
    paddingVertical: p(8),
    marginTop: p(2),
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  leaveCardReason: {
    fontFamily: 'Poppins-Regular',
    fontSize: p(11.5),
    color: '#64748B',
    flex: 1,
    lineHeight: p(18),
  },
});
