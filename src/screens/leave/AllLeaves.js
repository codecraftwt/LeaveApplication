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
import { getEmpLeaves, clearLastActionMessage } from '../../redux/slices/leaveSlice'; // Import clear action

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
  const lastActionMessage = useSelector(state => state?.leaves?.lastActionMessage); // Get message from Redux

  // Handle showing modal when there's a new action message
  useEffect(() => {
    if (lastActionMessage) {
      setModalMessage(lastActionMessage);
      showModal();
      
      // Clear message after showing modal
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

    // Auto-hide after 3 seconds
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

  // Use useFocusEffect to fetch leaves immediately when screen comes into focus
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

  const renderItem = ({ item }) => (
    <View style={styles.cardRow}>
      <View style={styles.accentBar} />
      <View style={styles.cardContent}>
        <View style={styles.cardRowTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.nameText}>{item.name}</Text>
            <Text style={styles.cardSubText}>{item.email}</Text>
          </View>
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => handlenavigate(item)}
          >
            <Feather name="eye" size={p(14)} color="#3360f9" />
          </TouchableOpacity>
        </View>
        <View style={styles.cardRowBottom}>
          <View style={styles.cardInfoBlock}>
            <Text style={styles.cardLabel}>Duration</Text>
            <Text style={styles.cardValue}>{item.duration}</Text>
          </View>
          <View style={styles.cardInfoBlock}>
            <Text style={styles.cardLabel}>Type</Text>
            <Text style={styles.cardValue}>{item.leave_type}</Text>
          </View>
          <View style={styles.cardInfoBlock}>
            <Text style={styles.cardLabel}>Status</Text>
            <View
              style={[
                styles.statusChip,
                item.status === 'Pending'
                  ? styles.pendingChip
                  : item.status === 'Approved'
                  ? styles.approvedChip
                  : item.status === 'Rejected'
                  ? styles.rejectedChip
                  : styles.unknownChip,
              ]}
            >
              <Feather
                name={
                  item.status === 'Pending'
                    ? 'clock'
                    : item.status === 'Approved'
                    ? 'check-circle'
                    : item.status === 'Rejected'
                    ? 'x-circle'
                    : 'help-circle'
                }
                size={p(13)}
                color={
                  item.status === 'Pending'
                    ? '#FF9800'
                    : item.status === 'Approved'
                    ? '#4CAF50'
                    : item.status === 'Rejected'
                    ? '#f44336'
                    : '#999'
                }
                style={{ marginRight: 4 }}
              />
              <Text style={styles.statusChipText}>{item.status}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

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
          <Feather name="eye" size={p(16)} color="#3360f9" />
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
            <Text style={styles.modalText}>{modalMessage}</Text>
          </View>
        </Animated.View>
      </Modal>

      <View style={styles.stickyHeader}>
        <View style={styles.headerRow}>
          <View style={styles.searchBarContainer}>
            <Icon
              name="search"
              size={p(16)}
              color="#666"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchBar}
              placeholder="Search by name, type, or status..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setViewMode(viewMode === 'card' ? 'table' : 'card')}
            activeOpacity={0.7}
          >
            <Feather
              name={viewMode === 'card' ? 'list' : 'grid'}
              size={p(22)}
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
          ItemSeparatorComponent={() => <View style={styles.divider} />}
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
    backgroundColor: '#f4f7fb',
  },
  stickyHeader: {
    backgroundColor: '#3660f9',
    paddingTop: p(15),
    paddingBottom: p(18),
    paddingHorizontal: p(18),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  headerTitle: {
    color: '#fff',
    fontSize: p(20),
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: p(10),
    textAlign: 'left',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: p(10),
    paddingHorizontal: p(12),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    maxWidth: '80%',
    marginRight: p(10),
  },
  searchIcon: {
    marginRight: p(8),
  },
  searchBar: {
    flex: 1,
    paddingVertical: p(12),
    fontSize: p(14),
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: p(16),
    paddingBottom: p(40),
  },
  cardRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: p(16),
    marginBottom: p(16),
    borderWidth: 1,
    borderColor: '#e6e6e6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  accentBar: {
    width: p(6),
    borderTopLeftRadius: p(16),
    borderBottomLeftRadius: p(16),
    backgroundColor: '#3660f9',
    marginRight: p(10),
  },
  cardContent: {
    flex: 1,
    paddingVertical: p(10),
    paddingRight: p(6),
  },
  cardRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: p(8),
  },
  nameText: {
    fontSize: p(15),
    color: '#222',
    fontWeight: '700',
    flex: 1,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 2,
  },
  cardSubText: {
    fontSize: p(12),
    color: '#888',
    fontFamily: 'Rubik-Regular',
    marginBottom: 2,
  },
  cardRowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: p(4),
  },
  cardInfoBlock: {
    flex: 1,
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: p(11),
    color: '#888',
    marginBottom: p(2),
    fontWeight: '500',
    fontFamily: 'Rubik-Regular',
  },
  cardValue: {
    fontSize: p(13),
    color: '#333',
    fontWeight: '600',
    fontFamily: 'Rubik-Regular',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: p(12),
    paddingVertical: p(3),
    paddingHorizontal: p(10),
    marginTop: 2,
    minWidth: p(70),
    justifyContent: 'center',
  },
  statusChipText: {
    fontSize: p(12),
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '700',
  },
  pendingChip: {
    backgroundColor: '#FFF3E0',
  },
  approvedChip: {
    backgroundColor: '#E8F5E9',
  },
  rejectedChip: {
    backgroundColor: '#ffebee',
  },
  unknownChip: {
    backgroundColor: '#f0f0f0',
  },
  eyeButton: {
    backgroundColor: '#f4f7fb',
    padding: p(5),
    borderRadius: p(8),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3360f9',
    marginLeft: p(10),
  },
  divider: {
    height: 10,
    backgroundColor: 'transparent',
  },
  toggleButton: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(8),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#3660f9',
  },
  tableScrollView: {
    flexGrow: 0,
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    marginTop: p(10),
    paddingBottom: p(10),
    elevation: 1,
    overflow: 'hidden',
    minWidth: 700,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f4f7fb',
    paddingVertical: p(10),
    paddingHorizontal: p(10),
    borderTopLeftRadius: p(12),
    borderTopRightRadius: p(12),
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
    minWidth: 700,
  },
  tableHeaderCell: {
    fontWeight: '700',
    fontFamily: 'Montserrat-SemiBold',
    color: '#3360f9',
    fontSize: p(12),
    textAlign: 'left',
    paddingHorizontal: p(8),
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(10),
    paddingHorizontal: p(10),
    backgroundColor: '#fff',
    minWidth: 700,
  },
  tableCell: {
    fontSize: p(13),
    color: '#222',
    fontFamily: 'Rubik-Regular',
    textAlign: 'left',
    paddingHorizontal: p(8),
    paddingVertical: p(4),
  },
  tableEyeButton: {
    padding: p(4),
    borderRadius: p(6),
    backgroundColor: '#f4f7fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
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
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: p(20),
    borderRadius: p(10),
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  modalText: {
    fontSize: p(16),
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
});