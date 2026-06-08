import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Modal,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import { p } from '../../utils/Responsive';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { getEmpLeaves, clearLastActionMessage } from '../../redux/slices/leaveSlice';

export default function AllLeaves() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('card');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0];

  const empLeaves = useSelector(state => state?.leaves?.empLeaves);
  const loading = useSelector(state => state?.allLeaves?.isLeaveLoading);
  const lastActionMessage = useSelector(state => state?.leaves?.lastActionMessage);

  useEffect(() => {
    if (lastActionMessage) {
      setModalMessage(lastActionMessage);
      showModal();
      
      setTimeout(() => {
        dispatch(clearLastActionMessage());
      }, 3000);
    }
  }, [lastActionMessage]);

  const showModal = () => {
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      hideModal();
    }, 3000);
  };

  const hideModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  const fetchLeaves = async () => {
    await dispatch(getEmpLeaves());
  };

  useFocusEffect(
    useCallback(() => {
      fetchLeaves();
    }, [dispatch])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaves();
    setRefreshing(false);
  };

  const limitedEmpLeaves = empLeaves
    ? [...empLeaves].reverse().slice(0, 50)
    : [];

  const handlenavigate = item => {
    navigation.navigate('LeaveReason', {
      employee: {
        ...item,
        id: item.id,
        leave_id: item.id,
      },
    });
  };

  function formatDateDMY(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}-${m}-${y.slice(2)}`;
  }

  const formattedLeaves =
    limitedEmpLeaves?.map(item => ({
      id: item.id.toString(),
      leave_id: item.id,
      name: `${item.userdata.first_name} ${item.userdata.last_name}`.trim(),
      date:
        item.to_date && item.to_date !== item.from_date
          ? `${item.from_date} To ${item.to_date}`
          : item.from_date,
      from_date: item.from_date,
      duration: `${item.no_of_days} ${item.no_of_days > 1 ? 'Days' : 'Day'}`,
      status:
        item.status === 0
          ? 'Pending'
          : item.status === 1
          ? 'Approved'
          : item.status === 2
          ? 'Rejected'
          : 'Unknown',
      leave_description: item.leave_description,
      email: item.userdata.email,
      leave_type: item.type?.name || 'N/A',
      leave_type_id: item.leave_type_id,
      reject_reason: item.reject_reason || '',
    })) || [];

  const filteredData = formattedLeaves.filter(item => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase().trim();
    const name = item.name?.toLowerCase() || '';
    const leaveType = item.leave_type?.toLowerCase() || '';
    const status = item.status?.toLowerCase() || '';

    return (
      name.includes(query) ||
      leaveType.includes(query) ||
      status.includes(query)
    );
  });

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Approved': return { bg: '#D1FAE5', text: '#059669' };
      case 'Pending': return { bg: '#FEF3C7', text: '#D97706' };
      case 'Rejected': return { bg: '#FEE2E2', text: '#DC2626' };
      default: return { bg: '#F1F5F9', text: '#64748B' };
    }
  };

  const getTypeStyles = (type) => {
    const t = type.toLowerCase();
    if (t.includes('casual')) return { bg: '#EFF6FF', text: '#3B82F6' };
    if (t.includes('medical')) return { bg: '#ECFDF5', text: '#10B981' };
    if (t.includes('emergency')) return { bg: '#FEF2F2', text: '#EF4444' };
    return { bg: '#F5F3FF', text: '#8B5CF6' };
  };

  const renderItem = ({ item }) => {
    const statusStyle = getStatusStyles(item.status);
    const typeStyle = getTypeStyles(item.leave_type);

    return (
      <View style={styles.leaveCard}>
        <View style={styles.leaveCardHeader}>
          <View style={styles.titleRow}>
            <View style={[styles.colorPill, { backgroundColor: typeStyle.text }]} />
            <View style={styles.nameTypeWrap}>
              <Text style={styles.leaveCardName}>{item.name}</Text>
            </View>
          </View>
          <View style={styles.badgesWrap}>
            <View style={[styles.typeBadge, { backgroundColor: typeStyle.bg, borderWidth: 1, borderColor: typeStyle.text + '20' }]}>
              <Text style={[styles.typeBadgeText, { color: typeStyle.text }]}>{item.leave_type}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Feather name="calendar" size={p(13)} color="#64748B" />
            <Text style={styles.detailText}>{formatDateDMY(item.from_date)}</Text>
          </View>
          <View style={styles.dotSeparator} />
          <View style={styles.detailItem}>
            <Feather name="clock" size={p(13)} color="#64748B" />
            <Text style={styles.detailText}>{item.duration}</Text>
          </View>
        </View>

        {item.leave_description ? (
          <View style={styles.leaveCardFooterReason}>
            <Feather name="align-left" size={p(12)} color="#94A3B8" style={{ marginRight: p(6), marginTop: p(2) }} />
            <Text style={styles.leaveCardReason} numberOfLines={1}>
              {item.leave_description}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.actionBtnOutline}
          onPress={() => handlenavigate(item)}
          activeOpacity={0.7}
        >
          <Feather name="eye" size={p(14)} color="#3660f9" style={{ marginRight: p(6) }} />
          <Text style={styles.actionBtnOutlineText}>Review Leave</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTableHeader = () => (
    <View style={styles.tableHeaderRow}>
      <Text style={[styles.tableHeaderCell, styles.colName]}>Name</Text>
      <Text style={[styles.tableHeaderCell, styles.colType]}>Type</Text>
      <Text style={[styles.tableHeaderCell, styles.colDate]}>Date</Text>
      <Text style={[styles.tableHeaderCell, styles.colStatus]}>Status</Text>
      <Text style={[styles.tableHeaderCell, styles.colAction]}>Action</Text>
    </View>
  );
  
  const renderTableRow = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, styles.colName]} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={[styles.tableCell, styles.colType]}>{item.leave_type}</Text>
      <Text style={[styles.tableCell, styles.colDate]}>
        {formatDateDMY(item.from_date)}
      </Text>
      <Text style={[styles.tableCell, styles.colStatus]}>{item.status}</Text>
      <View
        style={[
          styles.tableCell,
          styles.colAction,
          { alignItems: 'center', justifyContent: 'center' },
        ]}
      >
        <TouchableOpacity
          onPress={() => handlenavigate(item)}
          style={styles.tableEyeButton}
        >
          <Feather name="eye" size={p(16)} color="#3660f9" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Notification Modal */}
      <Modal
        transparent
        visible={modalVisible}
        onRequestClose={hideModal}
        animationType="none"
      >
        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
          <View style={styles.modalContent}>
            <Feather name="info" size={p(24)} color="#3660f9" style={{ marginBottom: p(8) }} />
            <Text style={styles.modalText}>{modalMessage}</Text>
          </View>
        </Animated.View>
      </Modal>

      <View style={styles.stickyHeader}>
        <View style={styles.headerRow}>
          <View style={styles.searchBarContainer}>
            <Feather
              name="search"
              size={p(18)}
              color="#64748B"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchBar}
              placeholder="Search leaves..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setViewMode(viewMode === 'card' ? 'table' : 'card')}
            activeOpacity={0.8}
          >
            <Feather
              name={viewMode === 'card' ? 'list' : 'grid'}
              size={p(20)}
              color="#3660f9"
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3660f9" />
        </View>
      ) : viewMode === 'card' ? (
        <FlatList
          data={filteredData}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3660f9']}
              tintColor="#3660f9"
            />
          }
        />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          style={styles.tableScrollView}
        >
          <View style={styles.tableContainer}>
            {renderTableHeader()}
            <FlatList
              data={filteredData}
              keyExtractor={item => item.id}
              renderItem={renderTableRow}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.tableListContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#3660f9']}
                  tintColor="#3660f9"
                />
              }
              ItemSeparatorComponent={() => (
                <View style={styles.tableDivider} />
              )}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  stickyHeader: {
    backgroundColor: '#F8FAFC',
    paddingTop: p(16),
    paddingBottom: p(12),
    paddingHorizontal: p(16),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: p(14),
    paddingHorizontal: p(14),
    marginRight: p(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchIcon: {
    marginRight: p(8),
  },
  searchBar: {
    flex: 1,
    paddingVertical: p(12),
    fontFamily: 'Poppins-Regular',
    fontSize: p(14),
    color: '#1E293B',
  },
  toggleButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: p(14),
    padding: p(12),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#64748B',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: p(16),
    paddingBottom: p(40),
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
  nameTypeWrap: {
    flex: 1,
  },
  leaveCardName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(14),
    color: '#0F172A',
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
    marginBottom: p(12),
    paddingHorizontal: p(4),
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
  leaveCardFooterReason: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: p(8),
    paddingHorizontal: p(10),
    paddingVertical: p(8),
    marginBottom: p(12),
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
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: p(10),
    backgroundColor: '#EFF6FF',
    borderRadius: p(10),
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  actionBtnOutlineText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(13),
    color: '#3660f9',
  },
  tableScrollView: {
    flexGrow: 0,
    paddingHorizontal: p(16),
  },
  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: p(12),
    marginBottom: p(20),
    paddingBottom: p(10),
    elevation: 4,
    shadowColor: '#3660f9',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    overflow: 'hidden',
    minWidth: 700,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingVertical: p(12),
    paddingHorizontal: p(10),
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    minWidth: 700,
  },
  tableHeaderCell: {
    fontFamily: 'Poppins-SemiBold',
    color: '#64748B',
    fontSize: p(12),
    textAlign: 'left',
    paddingHorizontal: p(8),
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(12),
    paddingHorizontal: p(10),
    backgroundColor: '#FFFFFF',
    minWidth: 700,
  },
  tableCell: {
    fontSize: p(13),
    color: '#1E293B',
    fontFamily: 'Poppins-Medium',
    textAlign: 'left',
    paddingHorizontal: p(8),
  },
  tableEyeButton: {
    padding: p(6),
    borderRadius: p(8),
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: p(10),
  },
  colName: {
    flex: 2,
    minWidth: 120,
  },
  colType: {
    flex: 1,
    minWidth: 80,
  },
  colDate: {
    flex: 1,
    minWidth: 100,
  },
  colStatus: {
    flex: 1,
    minWidth: 80,
  },
  colAction: {
    width: 50,
    flexShrink: 0,
    flexGrow: 0,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    padding: p(20),
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: p(24),
    borderRadius: p(20),
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  modalText: {
    fontSize: p(15),
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    color: '#1E293B',
  },
});