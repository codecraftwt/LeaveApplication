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
  const dash = useSelector(state => state?.dash?.data?.data);
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

  // Refresh function
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(getEmpStatus());

      await dispatch(getOfficeList());
    } catch (error) {
      console.log('Refresh Error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  // useFocusEffect to refresh data when screen comes into focus
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
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  const openDatePicker = field => {
    setDateField(field);
    const dateString = field === 'from' ? fromDate : toDate;
    const [day, month, year] = dateString.split('-');
    setTempDate(new Date(year, month - 1, day));
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

  const closeDatePicker = () => {
    setShowDatePicker(false);
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
  //apply filter function
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

  // cleare filter function
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
  const [office, setOffice] = useState(null);
  const [team, setTeam] = useState(null);

  // Sample data for dropdowns
  const officeData = [
    { label: 'Office 1', value: 'office1' },
    { label: 'Office 2', value: 'office2' },
    { label: 'Office 3', value: 'office3' },
  ];

  const teamData = [
    { label: 'Team A', value: 'teamA' },
    { label: 'Team B', value: 'teamB' },
    { label: 'Team C', value: 'teamC' },
  ];

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

  const renderItem = ({ item, index }) => {
    const fullDateTime = item?.in_time;
    const time = fullDateTime ? moment(fullDateTime).format('h:mm A') : '';

    const out = item?.out_time;
    const outtime = out ? moment(out).format('h:mm A') : '';

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: index % 2 === 0 ? '#e7f0fc' : '#F9F9F9',
          },
        ]}
        onPress={() => setSelectedEmployee(item)}
      >
        <Text style={styles.mainText}>{index + 1}</Text>

        <Text style={styles.mainText}>
          {item?.status_date
            ? moment(item.status_date).format('DD-MM-YYYY')
            : ''}
        </Text>

        <Text style={styles.mainText}>
          {`${item?.user_details?.first_name || ''} ${
            item?.user_details?.last_name?.charAt(0) || ''
          }`.trim()}
        </Text>
        <Text
          style={[
            styles.statusText,
            {
              backgroundColor: ['0', '5', '6', '7', '8', '10'].includes(
                item.status.toString().trim(),
              )
                ? '#ff9633'
                : ['1', '2', '3', '4', '9'].includes(
                    item.status.toString().trim(),
                  )
                ? '#50C878'
                : '#FF0000',
            },
            {
              fontSize: p(14),
              fontFamily: 'Poppins-SemiBold',
              color: '#fff',
            },
          ]}
        >
          {/* {console.log('Item Status:', item.status)} {} */}
          {item.status.toString().trim() === '0'
            ? 'P'
            : item.status.toString().trim() === '1'
            ? 'MA'
            : item.status.toString().trim() === '2'
            ? 'CTOA'
            : item.status.toString().trim() === '3'
            ? 'SAA'
            : item.status.toString().trim() === '4'
            ? 'HRA'
            : item.status.toString().trim() === '5'
            ? 'MR'
            : item.status.toString().trim() === '6'
            ? 'CR'
            : item.status.toString().trim() === '7'
            ? 'SAR'
            : item.status.toString().trim() === '8'
            ? 'HRR'
            : item.status.toString().trim() === '9'
            ? 'TLA'
            : item.status.toString().trim() === '10'
            ? 'TLR'
            : 'Null'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerText}>ID</Text>
      <Text style={styles.headerText}>Date</Text>
      <Text style={styles.headerText}>Name</Text>
      <Text style={styles.headerText}>Status</Text>
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
        approveRejectEmpStatus(
          selectedEmployee.id,
          selectedEmployee.emp_id, // FIXED: Use emp_id instead of user_details.id
          1, // Approval status
          'Approved by manager', // Default comment
        ),
      );

      if (response) {
        toast.show('Status approved successfully', {
          type: 'success',
          placement: 'bottom',
        });
        setSelectedEmployee(null);
        dispatch(getEmpStatus()); // Refresh data
      }
    } catch (error) {
      console.log('Approve Error:', error);
      toast.show(error?.message || 'Failed to approve status', {
        type: 'danger',
        placement: 'bottom',
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      toast.show('Please provide a reason for rejection', {
        type: 'warning',
        placement: 'bottom',
      });
      return;
    }

    // Use the appropriate employee data based on platform
    const employeeData =
      Platform.OS === 'ios' ? tempSelectedEmployee : selectedEmployee;

    if (!employeeData) {
      toast.show('Employee data not found', {
        type: 'danger',
        placement: 'bottom',
      });
      return;
    }

    try {
      setIsRejecting(true);
      const response = await dispatch(
        approveRejectEmpStatus(
          employeeData.id,
          employeeData.emp_id, // FIXED: Use emp_id instead of user_details.id
          0, // Rejection status
          rejectionReason,
        ),
      );

      if (response) {
        toast.show('Status rejected successfully', {
          type: 'success',
          placement: 'bottom',
        });
        setRejectModalVisible(false);
        setRejectionReason('');
        setSelectedEmployee(null);
        setTempSelectedEmployee(null);
        dispatch(getEmpStatus()); // Refresh data
      }
    } catch (error) {
      console.log('Reject Error:', error);
      toast.show(error?.message || 'Failed to reject status', {
        type: 'danger',
        placement: 'bottom',
      });
    } finally {
      setIsRejecting(false);
    }
  };

  const openRejectModal = () => {
    setRejectModalVisible(true);
    // On iOS, temporarily hide the main modal
    if (Platform.OS === 'ios') {
      setTempSelectedEmployee(selectedEmployee);
      setSelectedEmployee(null);
    }
  };

  return (
    <View style={styles.container}>
       <View
          style={{ flexDirection: 'row', alignItems: 'center', padding: 10 ,backgroundColor:'#3660f9',borderRadius:p(10) }}
        >
          <View style={{ flex: 1 }}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or date..."
              placeholderTextColor={'#898186'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.TopContainer}>
            <TouchableOpacity style={styles.filter} onPress={openfilter}>
              <Feather name="sliders" size={18} color={'#3660f9'} />
            </TouchableOpacity>
          </View>
        </View>
      <View style={styles.main}>
        <StatusBar barStyle="light-content" backgroundColor="#3660f9" />

       

        {showFilterData && (
          <View style={styles.dataContainer}>
            <View style={styles.dateRange}>
              <Text style={styles.analyticsTitle}>Status Data From : </Text>
              <Text style={styles.analyticsTitle}>
                {formattedFromDate || '---'} TO {formattedToDate || '---'}
              </Text>
            </View>
            <View>
              <TouchableOpacity
                onPress={clearFilter}
                style={styles.clearFilterButton}
              >
                <Text style={styles.clearFilterText}>Clear Filter</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {lastAnalaytics && (
          <Text style={styles.analyticsTitle}>
            Latest Status of Epmployyes :
          </Text>
        )}

        <Modal
          visible={isModalVisible}
          animationType="slide"
          onRequestClose={() => setIsModalVisible(false)}
          transparent={true}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            onPress={() => setIsModalVisible(false)}
          >
            <TouchableWithoutFeedback>
              <View style={styles.filtermodal}>
                <View style={styles.showDate}>
                  <Text style={styles.text}>Select Date Range</Text>
                </View>
                <View>
                  <View style={styles.DatePicker}>
                    <View style={styles.datePicker}>
                      <Text style={styles.labelStyle}>From Date :</Text>
                      <TouchableOpacity
                        style={styles.date}
                        onPress={() => openDatePicker('from')}
                      >
                        <Text
                          style={{
                            color: '#929292',
                            fontFamily: 'Rubik-Regular',
                            fontSize: 16,
                          }}
                        >
                          {fromDate
                            ? moment(fromDate, 'DD-MM-YYYY').format(
                                'DD-MM-YYYY',
                              )
                            : 'DD-MM-YYYY'}
                        </Text>
                        <Icon
                          name="calendar"
                          size={24}
                          color="#3660f9"
                          // style={{textAlign: 'left'}}
                        />
                      </TouchableOpacity>
                      {showDatePicker && (
                        <DateTimePicker
                          value={tempDate}
                          mode="date"
                          display={
                            Platform.OS === 'ios' ? 'spinner' : 'default'
                          }
                          onChange={handleDateChange}
                          maximumDate={parseDMY(toDate)}
                          minimumDate={parseDMY(fromDate)}
                        />
                      )}
                    </View>
                    <View style={styles.datePicker}>
                      <Text style={styles.labelStyle}>To Date :</Text>
                      <TouchableOpacity
                        style={styles.date}
                        onPress={() => openDatePicker('to')}
                      >
                        <Text
                          style={{
                            color: '#929292',
                            fontFamily: 'Rubik-Regular',
                            fontSize: p(16),
                          }}
                        >
                          {toDate
                            ? moment(toDate, 'DD-MM-YYYY').format('DD-MM-YYYY')
                            : 'DD-MM-YYYY'}
                        </Text>
                        <Icon
                          name="calendar"
                          size={24}
                          color="#3660f9"
                          style={{ textAlign: 'left' }}
                        />
                      </TouchableOpacity>
                      {showDatePicker && (
                        <DateTimePicker
                          value={tempDate}
                          mode="date"
                          display={
                            Platform.OS === 'ios' ? 'spinner' : 'default'
                          }
                          onChange={handleDateChange}
                          maximumDate={parseDMY(fromDate)}
                          minimumDate={parseDMY(toDate)}
                        />
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.applybtn}
                    onPress={applyFilter}
                  >
                    <Text style={styles.applytext}>Apply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </Modal>
        {loading ? (
          <CustomeLoadingIndicator />
        ) : (
          <>
            {renderHeader()}
            <FlatList
              style={styles.FlatList}
              data={filteredEmployees?.slice().reverse()}
              renderItem={renderItem}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#3660f9']}
                  tintColor="#3660f9"
                  title="Pull to refresh"
                  titleColor="#3660f9"
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {searchQuery.trim()
                      ? 'No matching records found'
                      : 'Your Status is not available'}
                  </Text>
                </View>
              }
            />
          </>
        )}

        <Modal
          visible={!!selectedEmployee}
          animationType="slide"
          onRequestClose={() => setSelectedEmployee(null)}
        >
          <SafeAreaView
            style={{ flex: 1, backgroundColor: '#fff' }}
            edges={['top']} // Only apply top safe area
          >
            <View style={styles.modalContent}>
              {selectedEmployee && (
                <>
                  <View style={styles.modalHeader}>
                    <View style={{ flexDirection: 'row' }}>
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setSelectedEmployee(null)}
                      >
                        <Icon name="arrow-back" size={28} color={'#fff'} />
                      </TouchableOpacity>
                      <Text style={styles.modalHeaderText}>Work Status</Text>
                    </View>
                    <Image
                      resizeMode="contain"
                      style={styles.logoImage}
                      source={require('../../assets/logozz.png')}
                    />
                  </View>
                  <ScrollView style={styles.modalScrollView}>
                    <View style={styles.modalBody}>
                      <View style={styles.statusHeader}>
                        <Text style={styles.statusLabel}>
                          General Information
                        </Text>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                selectedEmployee?.status === '1' ||
                                selectedEmployee?.status === '2' ||
                                selectedEmployee?.status === '3' ||
                                selectedEmployee?.status === '4' ||
                                selectedEmployee?.status === '9'
                                  ? '#E8F5E9'
                                  : '#FFEBEE',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusBadgeText,
                              {
                                color:
                                  selectedEmployee?.status === '1' ||
                                  selectedEmployee?.status === '2' ||
                                  selectedEmployee?.status === '3' ||
                                  selectedEmployee?.status === '4' ||
                                  selectedEmployee?.status === '9'
                                    ? '#4CAF50'
                                    : '#F44336',
                              },
                            ]}
                          >
                            {statusLabels[selectedEmployee?.status] ||
                              'Unknown Status'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                          <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Date</Text>
                            <Text style={styles.infoValue}>
                              {selectedEmployee?.in_time
                                ? moment(selectedEmployee.in_time).format(
                                    'DD-MM-YYYY',
                                  )
                                : '-'}
                            </Text>
                          </View>
                          <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>In Time</Text>
                            <Text style={styles.infoValue}>
                              {selectedEmployee?.in_time
                                ? moment(selectedEmployee.in_time).format(
                                    'h:mm A',
                                  )
                                : '-'}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.infoRow}>
                          <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Out Time</Text>
                            <Text style={styles.infoValue}>
                              {selectedEmployee?.out_time
                                ? moment(selectedEmployee.out_time).format(
                                    'h:mm A',
                                  )
                                : '-'}
                            </Text>
                          </View>
                          <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Total Hours</Text>
                            <Text style={styles.infoValue}>
                              {selectedEmployee?.total_worked_hrs || '-'}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.statsContainer}>
                        <View style={styles.statsCard}>
                          <Text style={styles.statsLabel}>Available Hours</Text>
                          <Text style={styles.statsValue}>
                            {selectedEmployee?.total_avaiable_hrs || '0'}
                          </Text>
                        </View>
                        <View style={styles.statsCard}>
                          <Text style={styles.statsLabel}>Break Hours</Text>
                          <Text style={styles.statsValue}>
                            {selectedEmployee?.break_taken_hrs || '0'}
                          </Text>
                        </View>
                        <View style={styles.statsCard}>
                          <Text style={styles.statsLabel}>Billable Hours</Text>
                          <Text style={styles.statsValue}>
                            {selectedEmployee?.total_billable || '0'}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.sectionTitle}>Work Details</Text>
                      {selectedEmployee?.empstatusdetails?.map(
                        (statusDetail, index) => (
                          <View key={index} style={styles.workCard}>
                            <View style={styles.workHeader}>
                              <View style={styles.workCategory}>
                                <Text style={styles.categoryLabel}>
                                  Category
                                </Text>
                                <Text style={styles.categoryValue}>
                                  {statusDetail?.work_category === 1
                                    ? 'Client'
                                    : statusDetail?.work_category === 0
                                    ? 'Study'
                                    : 'None'}
                                </Text>
                              </View>
                              <View
                                style={[
                                  styles.workType,
                                  {
                                    backgroundColor:
                                      statusDetail.hour_type
                                        .toString()
                                        .trim() === '0'
                                        ? '#FFEBEE'
                                        : '#E8F5E9',
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.workTypeText,
                                    {
                                      color:
                                        statusDetail.hour_type
                                          .toString()
                                          .trim() === '0'
                                          ? '#F44336'
                                          : '#4CAF50',
                                    },
                                  ]}
                                >
                                  {statusDetail.hour_type.toString().trim() ===
                                  '0'
                                    ? 'Offline'
                                    : 'Billable'}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.clientInfo}>
                              <Text style={styles.clientName}>
                                {statusDetail.client?.name || 'No Client'}
                              </Text>
                            </View>
                            <View style={styles.workDetails}>
                              <Text style={styles.workDetailsLabel}>
                                Details
                              </Text>
                              <Text style={styles.workDetailsText}>
                                {statusDetail.work_status}
                              </Text>
                            </View>
                          </View>
                        ),
                      )}
                      <View style={styles.actionButtonsContainer}>
                        {(!selectedEmployee?.status ||
                          selectedEmployee?.status === '0') && (
                          <>
                            <TouchableOpacity
                              style={[
                                styles.actionButton,
                                styles.approveButton,
                                isApproving && styles.disabledButton,
                              ]}
                              disabled={isApproving}
                              onPress={handleApprove}
                            >
                              {isApproving ? (
                                <ActivityIndicator color="#fff" size="small" />
                              ) : (
                                <Text style={styles.actionButtonText}>
                                  Approve
                                </Text>
                              )}
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.actionButton,
                                styles.rejectButton,
                                isRejecting && styles.disabledButton,
                              ]}
                              disabled={isRejecting}
                              onPress={openRejectModal}
                            >
                              {isRejecting ? (
                                <ActivityIndicator color="#fff" size="small" />
                              ) : (
                                <Text style={styles.actionButtonText}>
                                  Reject
                                </Text>
                              )}
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    </View>
                  </ScrollView>
                </>
              )}
            </View>
          </SafeAreaView>
        </Modal>
      </View>

      {/* Rejection Reason Modal - Moved outside main modal */}
      <Modal
        visible={rejectModalVisible}
        animationType="fade"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => !isRejecting && setRejectModalVisible(false)}
      >
        <View style={styles.rejectModalContainer}>
          <View style={styles.rejectModalContent}>
            <View style={styles.rejectModalHeader}>
              <Text style={styles.rejectModalTitle}>Rejection Reason</Text>
              <TouchableOpacity
                disabled={isRejecting}
                onPress={() => {
                  setRejectModalVisible(false);
                  setRejectionReason('');
                  // On iOS, restore the main modal
                  if (Platform.OS === 'ios') {
                    setTimeout(() => {
                      setSelectedEmployee(tempSelectedEmployee);
                      setTempSelectedEmployee(null);
                    }, 300);
                  }
                }}
              >
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.reasonInput}
              placeholder="Enter reason for rejection"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              editable={!isRejecting}
            />
            <TouchableOpacity
              style={[
                styles.submitButton,
                isRejecting && styles.disabledButton,
              ]}
              disabled={isRejecting}
              onPress={handleRejectSubmit}
            >
              {isRejecting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ListStatus;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3360f9',
  },
  main: {
    flex: 1,
    backgroundColor: '#fff',
    padding: p(15),
    // borderTopLeftRadius: p(30),
    // borderTopRightRadius: p(30),
  },
  TopContainer: {
    flexDirection: 'row',
    paddingLeft: p(10),
  },
  hoursContainer: {
    backgroundColor: '#E97B1C',
    paddingHorizontal: p(12),
    paddingVertical: p(5),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: p(3),
    borderColor: '#E97B1C',
    borderRadius: p(5),
  },
  hoursCount: {
    fontSize: p(23.4),
    fontFamily: 'Rubik-Regular',
    color: '#fff',
    fontWeight: 'bold',
  },
  filter: {
    padding: p(8),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: p(10),
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#E97C1F',
    paddingVertical: p(10),
    borderRadius: p(5),
    marginBottom: p(10),
  },
  headerText: {
    flex: 1,
    fontFamily: 'Rubik-Regular',
    color: '#fff',
    fontSize: p(14),
    textAlign: 'left',
    paddingLeft: p(10),
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: p(7),
    marginVertical: p(3),
    borderRadius: p(5),
    alignItems: 'center',
  },
  workCard: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(15),
    marginBottom: p(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainText: {
    fontSize: p(12),
    fontFamily: 'Poppins-Regular',
    color: '#000000',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: p(10),
    justifyContent: 'space-between',
    backgroundColor: '#3660f9',
    paddingBottom: p(5),
  },
  modalHeaderText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: p(18),
    color: '#fff',
  },
  closeButton: {
    marginRight: p(20),
  },
  modalBody: {
    padding: p(15),
    paddingTop: p(20),
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(20),
    backgroundColor: '#fff',
    padding: p(15),
    borderRadius: p(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusLabel: {
    fontSize: p(14),
    fontFamily: 'Montserrat-SemiBold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: p(10),
    paddingVertical: p(4),
    borderRadius: p(20),
  },
  statusBadgeText: {
    fontSize: p(12),
    fontFamily: 'Rubik-Regular',
    paddingHorizontal: p(4),
    paddingVertical: p(2),
  },
  statusText: {
    fontSize: p(14),
    fontFamily: 'Rubik-Regular',
    color: '#000000',
    paddingVertical: p(5),
    paddingHorizontal: p(10),
    borderRadius: p(5),
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(15),
    marginBottom: p(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: p(15),
  },
  infoItem: {
    flex: 1,
    marginHorizontal: p(5),
    backgroundColor: '#e9ecef',
    padding: p(10),
    borderRadius: p(10),
  },
  infoLabel: {
    fontSize: p(14),
    fontFamily: 'Rubik-Regular',
    color: '#666',
    marginBottom: p(5),
  },
  infoValue: {
    fontSize: p(16),
    fontFamily: 'Rubik-Regular',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: p(20),
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(15),
    marginHorizontal: p(5),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsLabel: {
    fontSize: p(12),
    fontFamily: 'Rubik-Regular',
    color: '#666',
    marginBottom: p(5),
    textAlign: 'center',
  },
  statsValue: {
    fontSize: p(18),
    fontFamily: 'Rubik-Bold',
    color: '#3660f9',
  },
  sectionTitle: {
    fontSize: p(18),
    fontFamily: 'Montserrat-SemiBold',
    color: '#333',
    marginBottom: p(15),
    marginTop: p(10),
  },
  workHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(10),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: p(10),
  },
  workCategory: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: p(12),
    fontFamily: 'Rubik-Regular',
    color: '#666',
  },
  categoryValue: {
    fontSize: p(16),
    fontFamily: 'Rubik-Regular',
    color: '#333',
  },
  workType: {
    paddingHorizontal: p(12),
    paddingVertical: p(6),
    borderRadius: p(20),
  },
  workTypeText: {
    fontSize: p(12),
    fontFamily: 'Rubik-Regular',
  },
  clientInfo: {
    marginBottom: p(10),
    backgroundColor: '#dee2e6',
    padding: p(10),
    borderRadius: p(10),
  },
  clientName: {
    fontSize: p(16),
    fontFamily: 'Rubik-Bold',
    color: '#3660f9',
  },
  workDetails: {
    backgroundColor: '#f8f9fa',
    borderRadius: p(10),
    padding: p(12),
  },
  workDetailsLabel: {
    fontSize: p(12),
    fontFamily: 'Rubik-Regular',
    color: '#666',
    marginBottom: p(5),
  },
  workDetailsText: {
    fontSize: p(14),
    fontFamily: 'Rubik-Regular',
    color: '#333',
    lineHeight: p(20),
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: p(15),
    paddingVertical: p(20),
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    paddingVertical: p(12),
    borderRadius: p(8),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: p(5),
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: p(16),
    fontFamily: 'Rubik-Regular',
  },
  disabledButton: {
    opacity: 0.7,
  },
  rejectModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  rejectModalContent: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(20),
    width: '90%',
    maxWidth: 400,
    zIndex: 10000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  rejectModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(20),
    paddingBottom: p(10),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rejectModalTitle: {
    fontSize: p(18),
    fontFamily: 'Montserrat-SemiBold',
    color: '#333',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: p(8),
    padding: p(12),
    fontSize: p(14),
    fontFamily: 'Rubik-Regular',
    color: '#333',
    minHeight: p(100),
    textAlignVertical: 'top',
    marginBottom: p(20),
  },
  submitButton: {
    backgroundColor: '#F44336',
    paddingVertical: p(12),
    borderRadius: p(8),
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: p(16),
    fontFamily: 'Rubik-Regular',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
  },
  filtermodal: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: p(20),
    padding: p(20),
  },
  showDate: {
    marginBottom: p(15),
  },
  text: {
    fontSize: p(20),
    fontFamily: 'Montserrat-SemiBold',
    color: '#333',
  },
  DatePicker: {
    marginBottom: p(20),
  },
  datePicker: {
    marginBottom: p(15),
  },
  labelStyle: {
    fontSize: p(14),
    fontFamily: 'Rubik-Regular',
    color: '#333',
  },
  date: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: p(12),
    paddingHorizontal: p(15),
    borderRadius: p(10),
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  applybtn: {
    backgroundColor: '#3660f9',
    paddingVertical: p(15),
    borderRadius: p(10),
    alignItems: 'center',
  },
  applytext: {
    color: '#fff',
    fontSize: p(16),
    fontFamily: 'Rubik-Regular',
  },
  dataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: p(8),
    marginVertical: p(10),
    paddingVertical: p(10),
  },
  clearFilterButton: {
    backgroundColor: '#e74c3c',
    borderRadius: p(5),
    paddingVertical: p(2),
    paddingHorizontal: p(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearFilterText: {
    fontSize: p(12),
    color: '#fff',
    fontFamily: 'Rubik-Regular',
  },
  analyticsTitle: {
    fontSize: p(12),
    marginBottom: p(15),
    color: '#333',
    fontFamily: 'Montserrat-SemiBold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#d1d5db', // light gray
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: p(14),
    color: '#000000',
    marginBottom: p(8),
    fontFamily: 'Rubik-Regular',
  },
});
