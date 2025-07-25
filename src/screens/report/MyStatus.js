import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { getEmployeeStatus } from '../../redux/slices/employeeanalyticsSlice';
import { TouchableWithoutFeedback } from 'react-native';
import { p } from '../../utils/Responsive';
import CustomeLoadingIndicator from '../../components/CustomeLoadingIndicator';
import DateTimePicker from '@react-native-community/datetimepicker';

const MyStatus = () => {
  const user = useSelector(state => state.auth.user);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [fromDate, setFromDate] = useState(
    moment().subtract(15, 'days').format('DD-MM-YYYY'),
  );
  const [toDate, setToDate] = useState(moment().format('DD-MM-YYYY'));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateField, setDateField] = useState(null);
  const [tempDate, setTempDate] = useState(new Date());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showFilterData, setShowFilterData] = useState(false);
  const [lastAnalaytics, setlastanalytics] = useState(true); // Set initial to true
  const dashboard = useSelector(state => state.auth.dashboard);

  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (user?.id) {
      const apiFromDate = fromDate;
      const apiToDate = toDate;

      console.log('Initial API Dates:', apiFromDate, apiToDate);

      dispatch(
        getEmployeeStatus({
          empId: user.id,
          fromDate: apiFromDate,
          toDate: apiToDate,
        }),
      ).then(() => {
        setLoading(false);
      });
    }
  }, [dispatch, user?.id, fromDate, toDate]);

  const employeeAnalytics = useSelector(
    state => state?.employeeAnalytics?.employeeStatus,
  );

  function parseDMY(str) {
    const [d, m, y] = str.split('-');
    return new Date(`${y}-${m}-${d}`);
  }
  function formatDMY(date) {
    return `${date.getDate().toString().padStart(2, '0')}-${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${date.getFullYear()}`;
  }
  const openDatePicker = field => {
    setDateField(field);
    // Convert DD-MM-YYYY to Date object
    const dateString = field === 'from' ? fromDate : toDate;
    const [day, month, year] = dateString.split('-');
    setTempDate(new Date(year, month - 1, day));
    setShowDatePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Format to DD-MM-YYYY
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
    if (fromDate && toDate && user?.id) {
      setFormattedFromDate(fromDate);
      setFormattedToDate(toDate);

      // Use dates directly (already in DD-MM-YYYY)
      dispatch(
        getEmployeeStatus({
          empId: user.id,
          fromDate,
          toDate,
        }),
      );

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

    if (user?.id) {
      dispatch(
        getEmployeeStatus({
          empId: user.id,
          fromDate: fifteenDaysAgo,
          toDate: today,
        }),
      );
    }

    setShowFilterData(false);
    setlastanalytics(true);
  };

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

        <Text style={styles.mainText}>{time}</Text>
        <Text style={styles.mainText}>{outtime}</Text>
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
                ? '#4CAF50'
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
    <View style={styles.statusTableHeader}>
      <Text style={[styles.statusHeaderCell, styles.colId]}>ID</Text>
      <Text style={[styles.statusHeaderCell, styles.colDate]}>Date</Text>
      <Text style={[styles.statusHeaderCell, styles.colIn]}>In</Text>
      <Text style={[styles.statusHeaderCell, styles.colOut]}>Out</Text>
      <Text style={[styles.statusHeaderCell, styles.colStatus]}>Status</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <StatusBar barStyle="dark-content" backgroundColor="#3660f9" />
        <View style={styles.TopContainer}>
          <View style={styles.billabeBar}>
            <Text style={styles.hoursText}>Current Month Billable hours</Text>
            <View style={styles.hoursContainer}>
              <Text style={styles.hoursCount}>
                {Math.floor(dashboard?.current_month_hrs)}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.filter} onPress={openfilter}>
            <Feather name="sliders" size={25} color={'#ffffff'} />
          </TouchableOpacity>
        </View>

        {showFilterData && (
          <View style={styles.dataContainer}>
            <View style={styles.dateRange}>
              <Text style={styles.analyticsTitle}>Status Data From </Text>
              <Text style={styles.analyticsTitle}>
                {formattedFromDate || '---'} TO {formattedToDate || '---'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={clearFilter}
              style={styles.clearFilterButton}
            >
              <Text style={styles.clearFilterText}>Clear Filter</Text>
            </TouchableOpacity>
          </View>
        )}

        {lastAnalaytics && (
          <Text style={styles.analyticsTitle}>Last 15 Days Work Status :</Text>
        )}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          onRequestClose={() => setIsModalVisible(false)}
          transparent={true}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={() => setIsModalVisible(false)}
          >
            <View style={styles.filtermodal}>
              <View style={styles.showDate}>
                <Text style={styles.text}>Select Date Range</Text>
              </View>

              <View>
                {/* From Date Picker */}
                <View style={styles.datePicker}>
                  <Text style={styles.labelStyle}>From Date:</Text>
                  <TouchableOpacity
                    style={styles.date}
                    onPress={() => openDatePicker('from')}
                  >
                    <Text style={styles.dateText}>
                      {fromDate
                        ? moment(fromDate, 'DD-MM-YYYY').format('DD-MM-YYYY')
                        : 'DD-MM-YYYY'}
                    </Text>
                    <Icon
                      name="calendar"
                      size={25}
                      color="#3660f9"
                      style={{ textAlign: 'left' }}
                    />
                  </TouchableOpacity>
                </View>

                {/* To Date Picker */}
                <View style={styles.datePicker}>
                  <Text style={styles.labelStyle}>To Date:</Text>
                  <TouchableOpacity
                    style={styles.date}
                    onPress={() => openDatePicker('to')}
                  >
                    <Text style={styles.dateText}>
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
                </View>
              </View>

              {/* DateTime Picker */}
              {showDatePicker && (
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  maximumDate={
                    dateField === 'from' ? parseDMY(toDate) : undefined
                  }
                  minimumDate={
                    dateField === 'to' ? parseDMY(fromDate) : undefined
                  }
                />
              )}

              {/* Apply Button */}
              <TouchableOpacity style={styles.applybtn} onPress={applyFilter}>
                <Text style={styles.applytext}>Apply</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {loading ? (
          <CustomeLoadingIndicator />
        ) : (
          <>
            {renderHeader()}
            <FlatList
              style={styles.FlatList}
              data={employeeAnalytics?.slice().reverse()}
              renderItem={renderItem}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    Your Status is not available
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
          <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            <View style={styles.modalContent}>
              {selectedEmployee && (
                <>
                  <View style={styles.modalHeader}>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setSelectedEmployee(null)}
                      >
                        <Icon name="arrow-back" size={28} color={'#ffffff'} />
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
                    </View>
                  </ScrollView>
                </>
              )}
            </View>
          </SafeAreaView>
        </Modal>
      </View>
    </View>
  );
};

export default MyStatus;

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
    paddingTop: p(15),
  },
  billabeBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3660f9',
    borderRadius: p(5),
    paddingLeft: p(12),
    marginRight: p(10),
  },
  hoursText: {
    fontSize: p(16),
    fontFamily: 'Rubik-Regular',
    color: '#ffffff',
    flex: 1,
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
    color: '#ffffff',
    fontWeight: 'bold',
  },
  filter: {
    padding: p(10),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3660f9',
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
    color: '#ffffff',
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
    paddingVertical: p(15),
  },
  modalHeaderText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: p(20),
    color: '#ffffff',
    marginLeft: p(15),
  },
  closeButton: {
    padding: p(5),
  },
  modalScrollView: {
    flex: 1,
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
    fontSize: p(16),
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
    paddingVertical: p(4),
    paddingHorizontal: p(8),
    borderRadius: p(5),
  },
  pendingText: {
    margin: p(8),
    fontWeight: 'bold',
    fontSize: p(14),
    paddingHorizontal: p(8),
    paddingVertical: p(4),
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
  data: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: p(10),
    marginHorizontal: p(10),
  },
  dataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: p(10),
    backgroundColor: '#f1f1f1',
    borderRadius: p(8),
    marginVertical: p(10),
  },
  dateText: {
    fontSize: p(16),
    color: '#333',
    fontWeight: '600',
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
  clearFilterButton: {
    backgroundColor: '#e74c3c',
    borderRadius: p(5),
    paddingVertical: p(5),
    paddingHorizontal: p(15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearFilterText: {
    fontSize: p(16),
    color: '#fff',
    fontFamily: 'Rubik-Regular',
  },
  analyticsTitle: {
    fontSize: p(16),
    marginVertical: p(15),
    color: '#333',
    fontFamily: 'Montserrat-SemiBold',
  },
  dataTableCell1: {
    fontSize: p(13),
    color: '#000',
    fontFamily: 'Rubik-Regular',
  },
  dataTableCell11: {
    fontSize: p(16),
    color: '#333',
    fontFamily: 'Rubik-Regular',
  },
  dataTableCell2: {
    fontSize: p(13),
    color: '#000',
    fontFamily: 'Rubik-Regular',
  },
  dataTableCell22: {
    fontSize: p(16),
    color: '#3660f9',
    fontFamily: 'Poppins-Bold',
  },
  tableRow: {
    paddingHorizontal: p(15),
    paddingVertical: p(5),
  },
  statusIndividualContainer: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  stetusdetails: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 5,
  },
  statusinfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 0.8,
    borderColor: '#3660f9',
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: p(8),
  },
  // --- Status Table Styles ---
  statusTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E97C1F',
    paddingVertical: p(8),
    borderRadius: p(5),
    marginBottom: p(8),
    alignItems: 'center',
    paddingHorizontal: p(6),
  },
  statusHeaderCell: {
    color: '#fff',
    fontFamily: 'Rubik-Regular',
    fontSize: p(13),
    textAlign: 'left',
    paddingLeft: p(4),
  },
  statusTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: p(5),
    marginBottom: p(6),
    paddingVertical: p(7),
    paddingHorizontal: p(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  statusCell: {
    fontSize: p(12),
    fontFamily: 'Poppins-Regular',
    color: '#222',
    textAlign: 'left',
    paddingVertical: p(2),
    paddingHorizontal: p(4),
  },
  statusBadgeMini: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(12),
    borderRadius: p(5),
    paddingHorizontal: p(8),
    paddingVertical: p(3),
    overflow: 'hidden',
    textAlign: 'center',
    minWidth: p(32),
  },
  colId: { flex: 0.7, minWidth: 30 },
  colDate: { flex: 1.5, minWidth: 80 },
  colIn: { flex: 1, minWidth: 60 },
  colOut: { flex: 1, minWidth: 60 },
  colStatus: { flex: 1, minWidth: 60, alignItems: 'center', justifyContent: 'center' },
});
