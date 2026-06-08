import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { useDispatch, useSelector } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import {
  getEmpStatus,
  approveRejectEmpStatus,
} from '../../redux/slices/employeeanalyticsSlice';
import { TouchableWithoutFeedback } from 'react-native';
import { p } from '../../utils/Responsive';
import CustomeLoadingIndicator from '../../components/CustomeLoadingIndicator';
import { getOfficeList } from '../../redux/slices/officelistSlice';
import { useToast } from 'react-native-toast-notifications';

const ListStatus = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [fromDate, setFromDate] = useState(
    moment().subtract(15, 'days').format('DD-MM-YYYY'),
  );
  const [toDate, setToDate] = useState(moment().format('DD-MM-YYYY'));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateField, setDateField] = useState(null);
  const [tempDate, setTempDate] = useState(new Date());
  
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const toast = useToast();

  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    setLoading(true);
    dispatch(getEmpStatus()).then(() => {
      setLoading(false);
    });
  }, [dispatch, fromDate, toDate]);

  useEffect(() => {
    dispatch(getOfficeList());
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(getEmpStatus());
      await dispatch(getOfficeList());
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      dispatch(getEmpStatus()).then(() => {
        setLoading(false);
      });
      dispatch(getOfficeList());
    }, [dispatch]),
  );

  const officeData2 = useSelector(state => state?.officeList?.officeList);
  const officeDataa = useMemo(() => {
    return (
      officeData2?.map(item => ({
        label: item.name,
        value: item.id,
      })) || []
    );
  }, [officeData2]);

  const allempStatus = useSelector(state => state?.employeeAnalytics?.teamStatus);
  const empid = useSelector(state => state?.user?.data?.data?.user?.id);

  const convertDateFormat = dateString => {
    if (!dateString) return new Date();
    const [day, month, year] = dateString.split('-');
    return new Date(year, month - 1, day);
  };

  const openDatePicker = field => {
    setDateField(field);
    const dateString = field === 'from' ? fromDate : toDate;
    if (dateString) {
      const [day, month, year] = dateString.split('-');
      setTempDate(new Date(year, month - 1, day));
    } else {
      setTempDate(new Date());
    }
    setShowDatePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const year = selectedDate.getFullYear();
      const formatted = `${day}-${month}-${year}`;
      dateField === 'from' ? setFromDate(formatted) : setToDate(formatted);
    }
  };

  const [formattedFromDate, setFormattedFromDate] = useState('');
  const [formattedToDate, setFormattedToDate] = useState('');
  
  const openfilter = () => {
    setIsModalVisible(true);
  };

  const statusLabels = {
    0: 'Pending',
    1: 'Manager Approved',
    2: 'CTO Approved',
    3: 'Super Admin Approved',
    4: 'HR Manager Approved',
    5: 'Manager Rejected',
    6: 'CTO Rejected',
    7: 'Super Admin Rejected',
    8: 'HR Manager Rejected',
    9: 'Team Leader Approved',
    10: 'Team Leader Rejected',
  };

  const applyFilter = () => {
    if (fromDate && toDate) {
      setFormattedFromDate(fromDate);
      setFormattedToDate(toDate);
      dispatch(getEmpStatus());
      setIsModalVisible(false);
      setShowFilterData(true);
      setlastanalytics(false);
    }
  };

  const clearFilter = () => {
    setFormattedFromDate('');
    setFormattedToDate('');

    const today = moment().format('DD-MM-YYYY');
    const fifteenDaysAgo = moment().subtract(15, 'days').format('DD-MM-YYYY');

    setFromDate(fifteenDaysAgo);
    setToDate(today);
    dispatch(getEmpStatus(empid, fifteenDaysAgo, today));

    setShowFilterData(false);
    setlastanalytics(true);
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showFilterData, setShowFilterData] = useState(false);
  const [lastAnalaytics, setlastanalytics] = useState(true);

  const filteredEmployees = useMemo(() => {
    if (!allempStatus) return [];
    if (!searchQuery.trim()) return allempStatus;

    const query = searchQuery.toLowerCase().trim();
    return allempStatus.filter(item => {
      const fullName = `${item?.user_details?.first_name || ''} ${
        item?.user_details?.last_name || ''
      }`.toLowerCase();
      const date = item?.status_date
        ? moment(item.status_date).format('DD-MM-YYYY').toLowerCase()
        : '';

      return fullName.includes(query) || date.includes(query);
    });
  }, [allempStatus, searchQuery]);

  const getStatusColorBetter = (statusStr) => {
    if (statusStr === '0') return { bg: '#FEF3C7', text: '#D97706' }; // Amber
    if (['5', '6', '7', '8', '10'].includes(statusStr)) return { bg: '#FEF2F2', text: '#EF4444' }; // Red
    if (['1', '2', '3', '4', '9'].includes(statusStr)) return { bg: '#ECFDF5', text: '#10B981' }; // Green
    return { bg: '#F1F5F9', text: '#64748B' }; // Gray default
  };

  const getShortStatus = (statusStr) => {
    const map = {
      '0': 'P', '1': 'MA', '2': 'CTOA', '3': 'SAA', '4': 'HRA',
      '5': 'MR', '6': 'CR', '7': 'SAR', '8': 'HRR', '9': 'TLA', '10': 'TLR'
    };
    return map[statusStr] || 'Null';
  };

  const renderItem = ({ item, index }) => {
    const statusStr = item.status.toString().trim();
    const statusColor = getStatusColorBetter(statusStr);
    const shortName = `${item?.user_details?.first_name || ''} ${item?.user_details?.last_name?.charAt(0) || ''}`.trim();

    return (
      <TouchableOpacity
        style={[
          styles.tableRow,
          { backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }
        ]}
        onPress={() => setSelectedEmployee(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.tableCell, styles.colId]}>{index + 1}</Text>
        <Text style={[styles.tableCell, styles.colDate]}>
          {item?.status_date ? moment(item.status_date).format('DD-MM-YYYY') : '-'}
        </Text>
        <Text style={[styles.tableCell, styles.colName]} numberOfLines={1}>
          {shortName}
        </Text>
        <View style={[styles.tableCell, styles.colStatus, { alignItems: 'center' }]}>
          <View style={[styles.statusBadgeMini, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.statusBadgeMiniText, { color: statusColor.text }]}>
              {getShortStatus(statusStr)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.tableHeaderRow}>
      <Text style={[styles.tableHeaderCell, styles.colId]}>ID</Text>
      <Text style={[styles.tableHeaderCell, styles.colDate]}>Date</Text>
      <Text style={[styles.tableHeaderCell, styles.colName]}>Name</Text>
      <Text style={[styles.tableHeaderCell, styles.colStatus]}>Status</Text>
    </View>
  );

  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [tempSelectedEmployee, setTempSelectedEmployee] = useState(null);

  const handleApprove = async () => {
    if (!selectedEmployee) return;

    try {
      setIsApproving(true);
      const response = await dispatch(
        approveRejectEmpStatus({
          id: selectedEmployee.id,
          empId: selectedEmployee.emp_id,
          workstatus: 1,
          comment: 'Approved by manager',
        }),
      );

      if (response?.payload) {
        setSelectedEmployee(null);
        dispatch(getEmpStatus());
      }
    } catch (error) {
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) return;

    const employeeData = Platform.OS === 'ios' ? tempSelectedEmployee : selectedEmployee;
    if (!employeeData) return;

    try {
      setIsRejecting(true);
      const response = await dispatch(
        approveRejectEmpStatus({
          id: employeeData.id,
          empId: employeeData.emp_id,
          workstatus: 0,
          comment: rejectionReason,
        }),
      );

      if (response?.payload) {
        setRejectModalVisible(false);
        setRejectionReason('');
        setSelectedEmployee(null);
        setTempSelectedEmployee(null);
        dispatch(getEmpStatus());
      }
    } catch (error) {
    } finally {
      setIsRejecting(false);
    }
  };

  const openRejectModal = () => {
    setRejectModalVisible(true);
    if (Platform.OS === 'ios') {
      setTempSelectedEmployee(selectedEmployee);
      setSelectedEmployee(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={styles.main}>
        
        {/* Search & Filter Top Bar */}
        <View style={styles.topActionRow}>
          <View style={styles.searchContainer}>
            <Feather name="search" size={p(18)} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or date..."
              placeholderTextColor={'#94A3B8'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn} onPress={openfilter}>
            <Feather name="sliders" size={p(22)} color={'#3660f9'} />
          </TouchableOpacity>
        </View>

        {showFilterData && (
          <View style={styles.dataContainer}>
            <View style={styles.dateRange}>
              <Text style={styles.analyticsTitleLabel}>Status Data From:</Text>
              <Text style={styles.analyticsTitleValue}>
                {formattedFromDate || '---'} TO {formattedToDate || '---'}
              </Text>
            </View>
            <TouchableOpacity onPress={clearFilter} style={styles.clearFilterButton}>
              <Feather name="x" size={p(16)} color="#FFFFFF" />
              <Text style={styles.clearFilterText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        {lastAnalaytics && !showFilterData && (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderTitle}>Latest Status of Employees</Text>
          </View>
        )}

        {/* Filter Modal */}
        <Modal
          visible={isModalVisible}
          animationType="fade"
          onRequestClose={() => setIsModalVisible(false)}
          transparent={true}
          statusBarTranslucent={true}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={() => setIsModalVisible(false)}
          >
            <TouchableOpacity activeOpacity={1} style={styles.filtermodal}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.text}>Filter By Date</Text>
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                  <Feather name="x" size={p(24)} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <View>
                <View style={styles.datePicker}>
                  <Text style={styles.labelStyle}>From Date</Text>
                  <TouchableOpacity style={styles.dateBtn} onPress={() => openDatePicker('from')}>
                    <Text style={styles.dateText}>
                      {fromDate ? moment(fromDate, 'DD-MM-YYYY').format('DD-MM-YYYY') : 'Select Date'}
                    </Text>
                    <Feather name="calendar" size={p(20)} color="#3660f9" />
                  </TouchableOpacity>
                </View>

                <View style={styles.datePicker}>
                  <Text style={styles.labelStyle}>To Date</Text>
                  <TouchableOpacity style={styles.dateBtn} onPress={() => openDatePicker('to')}>
                    <Text style={styles.dateText}>
                      {toDate ? moment(toDate, 'DD-MM-YYYY').format('DD-MM-YYYY') : 'Select Date'}
                    </Text>
                    <Feather name="calendar" size={p(20)} color="#3660f9" />
                  </TouchableOpacity>
                </View>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  maximumDate={dateField === 'from' && toDate ? convertDateFormat(toDate) : undefined}
                  minimumDate={dateField === 'to' && fromDate ? convertDateFormat(fromDate) : undefined}
                />
              )}

              <TouchableOpacity style={styles.applybtn} onPress={applyFilter}>
                <Text style={styles.applytext}>Apply Filter</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {loading ? (
          <CustomeLoadingIndicator />
        ) : (
          <View style={styles.tableWrapper}>
            {renderHeader()}
            <FlatList
              data={filteredEmployees?.slice().reverse()}
              renderItem={renderItem}
              keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => <View style={styles.tableDivider} />}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3660f9']} tintColor="#3660f9" />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Feather name="search" size={p(40)} color="#CBD5E1" style={{ marginBottom: p(10) }} />
                  <Text style={styles.emptyText}>
                    {searchQuery.trim() ? 'No matching records found' : 'Status data is not available'}
                  </Text>
                </View>
              }
            />
          </View>
        )}

        {/* Details Modal */}
        <Modal
          visible={!!selectedEmployee}
          animationType="slide"
          onRequestClose={() => setSelectedEmployee(null)}
          statusBarTranslucent={true}
        >
          <SafeAreaView style={styles.detailsModalContainer}>
            <StatusBar backgroundColor="#3660f9" barStyle="light-content" />
            <View style={styles.detailsModalHeader}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedEmployee(null)}>
                <Feather name="arrow-left" size={p(22)} color="#3660f9" />
              </TouchableOpacity>
              <Text style={styles.modalHeaderText}>Work Status</Text>
            </View>

            <ScrollView style={styles.modalScrollView} contentContainerStyle={{ paddingBottom: p(40) }}>
              {selectedEmployee && (() => {
                const modalStatusStr = selectedEmployee.status?.toString().trim();
                const modalStatusColor = getStatusColorBetter(modalStatusStr);
                
                return (
                <View style={styles.modalBody}>
                  
                  <View style={styles.infoCard}>
                    <View style={styles.statusHeaderRow}>
                      <Text style={styles.infoCardTitle}>General Information</Text>
                      <View style={[styles.fullStatusBadge, { backgroundColor: modalStatusColor.bg }]}>
                        <Text style={[styles.fullStatusBadgeText, { color: modalStatusColor.text }]}>
                          {statusLabels[selectedEmployee.status] || 'Unknown Status'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailGrid}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Employee Name</Text>
                        <Text style={styles.detailValue}>
                          {`${selectedEmployee?.user_details?.first_name || ''} ${selectedEmployee?.user_details?.last_name || ''}`.trim()}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Date</Text>
                        <Text style={styles.detailValue}>
                          {selectedEmployee.in_time ? moment(selectedEmployee.in_time).format('DD-MM-YYYY') : '-'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailGrid}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>In Time</Text>
                        <Text style={styles.detailValue}>
                          {selectedEmployee.in_time ? moment(selectedEmployee.in_time).format('h:mm A') : '-'}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Out Time</Text>
                        <Text style={styles.detailValue}>
                          {selectedEmployee.out_time ? moment(selectedEmployee.out_time).format('h:mm A') : '-'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.statsContainer}>
                    <View style={styles.statsCard}>
                      <Text style={styles.statsValue}>{selectedEmployee.total_worked_hrs || '0'}</Text>
                      <Text style={styles.statsLabel}>Total Hrs</Text>
                    </View>
                    <View style={styles.statsCard}>
                      <Text style={[styles.statsValue, { color: '#F59E0B' }]}>{selectedEmployee.break_taken_hrs || '0'}</Text>
                      <Text style={styles.statsLabel}>Break Hrs</Text>
                    </View>
                    <View style={styles.statsCard}>
                      <Text style={[styles.statsValue, { color: '#10B981' }]}>{selectedEmployee.total_billable || '0'}</Text>
                      <Text style={styles.statsLabel}>Billable Hrs</Text>
                    </View>
                  </View>

                  <Text style={styles.sectionTitle}>Work Details</Text>
                  {selectedEmployee.empstatusdetails && selectedEmployee.empstatusdetails.length > 0 ? (
                    selectedEmployee.empstatusdetails.map((statusDetail, index) => (
                      <View key={index} style={styles.workCard}>
                        <View style={styles.workHeader}>
                          <View style={styles.workCategory}>
                            <Text style={styles.categoryLabel}>Category</Text>
                            <Text style={styles.categoryValue}>
                              {statusDetail.work_category === 1 ? 'Client' : statusDetail.work_category === 0 ? 'Study' : 'None'}
                            </Text>
                          </View>
                          <View style={[styles.workTypeBadge, { backgroundColor: statusDetail.hour_type.toString().trim() === '0' ? '#FEF2F2' : '#ECFDF5' }]}>
                            <Text style={[styles.workTypeText, { color: statusDetail.hour_type.toString().trim() === '0' ? '#EF4444' : '#10B981' }]}>
                              {statusDetail.hour_type.toString().trim() === '0' ? 'Offline' : 'Billable'}
                            </Text>
                          </View>
                        </View>
                        
                        <View style={styles.clientInfoBox}>
                          <Text style={styles.clientLabel}>Client / Project</Text>
                          <Text style={styles.clientName}>{statusDetail.client?.name || 'No Client'}</Text>
                        </View>

                        <View style={styles.workDetailsBox}>
                          <Text style={styles.workDetailsLabel}>Details</Text>
                          <Text style={styles.workDetailsText}>{statusDetail.work_status}</Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noWorkText}>No detailed work logs found.</Text>
                  )}

                  {/* Action Buttons */}
                  {(!selectedEmployee.status || selectedEmployee.status === '0') && (
                    <View style={styles.actionButtonsContainer}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.approveBtn, isApproving && styles.disabledButton]}
                        disabled={isApproving || isRejecting}
                        onPress={handleApprove}
                      >
                        {isApproving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.actionBtnText}>Approve</Text>}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn, isRejecting && styles.disabledButton]}
                        disabled={isApproving || isRejecting}
                        onPress={openRejectModal}
                      >
                        {isRejecting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.actionBtnText}>Reject</Text>}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                );
              })()}
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Reject Modal */}
        <Modal
          visible={rejectModalVisible}
          animationType="fade"
          transparent={true}
          statusBarTranslucent={true}
          onRequestClose={() => !isRejecting && setRejectModalVisible(false)}
        >
          <View style={styles.rejectModalWrapper}>
            <View style={styles.rejectModalContent}>
              <View style={styles.rejectModalHeader}>
                <Text style={styles.rejectModalTitle}>Rejection Reason</Text>
                <TouchableOpacity
                  disabled={isRejecting}
                  onPress={() => {
                    setRejectModalVisible(false);
                    setRejectionReason('');
                    if (Platform.OS === 'ios') {
                      setTimeout(() => {
                        setSelectedEmployee(tempSelectedEmployee);
                        setTempSelectedEmployee(null);
                      }, 300);
                    }
                  }}
                >
                  <Feather name="x" size={p(24)} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.reasonInput}
                placeholder="Please enter the reason for rejection..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                value={rejectionReason}
                onChangeText={setRejectionReason}
                editable={!isRejecting}
              />
              <TouchableOpacity
                style={[styles.submitReasonBtn, isRejecting && styles.disabledButton]}
                disabled={isRejecting || !rejectionReason.trim()}
                onPress={handleRejectSubmit}
              >
                {isRejecting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.submitReasonBtnText}>Submit Rejection</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
};

export default ListStatus;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  main: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: p(16),
    paddingTop: p(16),
    paddingBottom: p(12),
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: p(14),
    paddingHorizontal: p(14),
    marginRight: p(12),
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: p(8),
  },
  searchInput: {
    flex: 1,
    height: p(48),
    fontSize: p(14),
    color: '#1E293B',
    fontFamily: 'Poppins-Regular',
  },
  filterBtn: {
    width: p(48),
    height: p(48),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: p(14),
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    paddingHorizontal: p(16),
    paddingBottom: p(12),
    paddingTop: p(4),
  },
  sectionHeaderTitle: {
    fontSize: p(14),
    fontFamily: 'Poppins-Bold',
    color: '#1E293B',
  },
  dataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: p(14),
    backgroundColor: '#F0F4FF',
    borderRadius: p(14),
    marginHorizontal: p(16),
    marginBottom: p(16),
    borderWidth: 1,
    borderColor: '#D8E2FF',
  },
  dateRange: {
    flex: 1,
  },
  analyticsTitleLabel: {
    fontSize: p(11),
    color: '#3660f9',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: p(2),
  },
  analyticsTitleValue: {
    fontSize: p(12),
    color: '#1E293B',
    fontFamily: 'Poppins-Bold',
  },
  clearFilterButton: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    borderRadius: p(8),
    paddingVertical: p(6),
    paddingHorizontal: p(10),
    alignItems: 'center',
  },
  clearFilterText: {
    fontSize: p(11),
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    marginLeft: p(4),
  },
  tableWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: p(20),
    borderTopRightRadius: p(20),
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#F1F5F9',
    marginHorizontal: p(2),
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingVertical: p(14),
    paddingHorizontal: p(16),
    borderTopLeftRadius: p(20),
    borderTopRightRadius: p(20),
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableHeaderCell: {
    fontFamily: 'Poppins-Bold',
    color: '#64748B',
    fontSize: p(11),
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(14),
    paddingHorizontal: p(16),
  },
  tableCell: {
    fontSize: p(12),
    color: '#1E293B',
    fontFamily: 'Poppins-Medium',
  },
  tableDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  listContent: {
    paddingBottom: p(40),
  },
  colId: { flex: 0.6, textAlign: 'left' },
  colDate: { flex: 1.4, textAlign: 'left' },
  colName: { flex: 1.2, textAlign: 'left' },
  colStatus: { flex: 1.2, textAlign: 'center' },
  
  statusBadgeMini: {
    paddingHorizontal: p(8),
    paddingVertical: p(4),
    borderRadius: p(6),
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: p(40),
  },
  statusBadgeMiniText: {
    fontFamily: 'Poppins-Bold',
    fontSize: p(10),
  },
  emptyContainer: {
    padding: p(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: p(14),
    color: '#94A3B8',
    fontFamily: 'Poppins-Medium',
  },
  
  // Filter Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingHorizontal: p(20),
  },
  filtermodal: {
    backgroundColor: '#FFFFFF',
    borderRadius: p(24),
    padding: p(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(20),
  },
  text: {
    fontSize: p(18),
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
  },
  datePicker: {
    marginBottom: p(16),
  },
  labelStyle: {
    fontSize: p(13),
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
    marginBottom: p(6),
  },
  dateBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: p(14),
    paddingHorizontal: p(16),
    borderRadius: p(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateText: {
    fontSize: p(14),
    color: '#1E293B',
    fontFamily: 'Poppins-Medium',
  },
  applybtn: {
    backgroundColor: '#3660f9',
    paddingVertical: p(16),
    borderRadius: p(14),
    alignItems: 'center',
    marginTop: p(10),
    shadowColor: '#3660f9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  applytext: {
    color: '#FFFFFF',
    fontSize: p(15),
    fontFamily: 'Poppins-Bold',
  },
  
  // Details Modal
  detailsModalContainer: {
    flex: 1,
    backgroundColor: '#3660f9',
  },
  detailsModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? p(40) : p(45),
    paddingBottom: p(16),
    paddingHorizontal: p(16),
    backgroundColor: '#3660f9',
  },
  closeButton: {
    width: p(36),
    height: p(36),
    borderRadius: p(18),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(12),
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  modalHeaderText: {
    flex: 1,
    fontFamily: 'Poppins-Bold',
    fontSize: p(18),
    color: '#FFFFFF',
  },
  modalScrollView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalBody: {
    padding: p(16),
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: p(16),
    padding: p(16),
    marginBottom: p(20),
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(16),
    paddingBottom: p(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoCardTitle: {
    fontSize: p(14),
    fontFamily: 'Poppins-Bold',
    color: '#1E293B',
  },
  fullStatusBadge: {
    paddingHorizontal: p(10),
    paddingVertical: p(6),
    borderRadius: p(8),
  },
  fullStatusBadgeText: {
    fontSize: p(11),
    fontFamily: 'Poppins-Bold',
  },
  detailGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: p(12),
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: p(11),
    fontFamily: 'Poppins-Medium',
    color: '#94A3B8',
    marginBottom: p(4),
  },
  detailValue: {
    fontSize: p(13),
    fontFamily: 'Poppins-SemiBold',
    color: '#1E293B',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: p(24),
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: p(14),
    padding: p(12),
    marginHorizontal: p(4),
    alignItems: 'center',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statsValue: {
    fontSize: p(18),
    fontFamily: 'Poppins-Bold',
    color: '#3660f9',
    marginBottom: p(2),
  },
  statsLabel: {
    fontSize: p(10),
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: p(16),
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
    marginBottom: p(12),
    marginLeft: p(4),
  },
  workCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: p(16),
    padding: p(16),
    marginBottom: p(16),
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  workHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(12),
  },
  workCategory: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: p(11),
    fontFamily: 'Poppins-Medium',
    color: '#94A3B8',
    marginBottom: p(2),
  },
  categoryValue: {
    fontSize: p(14),
    fontFamily: 'Poppins-Bold',
    color: '#1E293B',
  },
  workTypeBadge: {
    paddingHorizontal: p(10),
    paddingVertical: p(4),
    borderRadius: p(8),
  },
  workTypeText: {
    fontSize: p(11),
    fontFamily: 'Poppins-Bold',
  },
  clientInfoBox: {
    backgroundColor: '#F0F4FF',
    padding: p(12),
    borderRadius: p(10),
    marginBottom: p(12),
  },
  clientLabel: {
    fontSize: p(10),
    fontFamily: 'Poppins-Medium',
    color: '#3660f9',
    marginBottom: p(2),
  },
  clientName: {
    fontSize: p(13),
    fontFamily: 'Poppins-Bold',
    color: '#1E293B',
  },
  workDetailsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: p(10),
    padding: p(12),
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  workDetailsLabel: {
    fontSize: p(11),
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
    marginBottom: p(4),
  },
  workDetailsText: {
    fontSize: p(13),
    fontFamily: 'Poppins-Regular',
    color: '#334155',
    lineHeight: p(20),
  },
  noWorkText: {
    fontSize: p(13),
    fontFamily: 'Poppins-Regular',
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: p(10),
  },

  // Action Buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: p(10),
    marginBottom: p(20),
  },
  actionBtn: {
    flex: 1,
    paddingVertical: p(16),
    borderRadius: p(14),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: p(6),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  approveBtn: {
    backgroundColor: '#10B981',
  },
  rejectBtn: {
    backgroundColor: '#EF4444',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: p(15),
    fontFamily: 'Poppins-Bold',
  },
  disabledButton: {
    opacity: 0.6,
  },

  // Reject Modal
  rejectModalWrapper: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    paddingHorizontal: p(20),
  },
  rejectModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: p(24),
    padding: p(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  rejectModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(20),
  },
  rejectModalTitle: {
    fontSize: p(18),
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
  },
  reasonInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: p(14),
    padding: p(16),
    fontSize: p(14),
    fontFamily: 'Poppins-Regular',
    color: '#1E293B',
    minHeight: p(120),
    textAlignVertical: 'top',
    marginBottom: p(20),
  },
  submitReasonBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: p(16),
    borderRadius: p(14),
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitReasonBtnText: {
    color: '#FFFFFF',
    fontSize: p(15),
    fontFamily: 'Poppins-Bold',
  },
});
