import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { p } from '../../utils/Responsive';
import { useDispatch, useSelector } from 'react-redux';
import { getEmpAnalytics } from '../../redux/slices/employeeanalyticsSlice';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

function getLast10DaysRange() {
  const today = new Date();
  const to = today;
  const from = new Date(today);
  from.setDate(from.getDate() - 9); // last 10 days including today
  const format = d => `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getFullYear()}`;
  return { fromDate: format(from), toDate: format(to) };
}

export default function EmployeeAnalytics() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const { analytics, loading, error } = useSelector(state => state.employeeAnalytics);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fromDate, setFromDate] = useState(getLast10DaysRange().fromDate);
  const [toDate, setToDate] = useState(getLast10DaysRange().toDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateField, setDateField] = useState(null); // 'from' or 'to'
  const [tempDate, setTempDate] = useState(new Date());
  const [tempFromDate, setTempFromDate] = useState(fromDate);
  const [tempToDate, setTempToDate] = useState(toDate);

  // Fetch analytics on focus or when date range changes
  useFocusEffect(
    React.useCallback(() => {
      if (user?.id && fromDate && toDate) {
        dispatch(getEmpAnalytics({ empid: user.id, fromdate: fromDate, todate: toDate }));
      }
    }, [dispatch, user?.id, fromDate, toDate])
  );

  // Prepare analytics data for cards
  const analyticsData = analytics?.data
    ? [
        {
          title: 'Billable Hours',
          value: analytics.data.total_billable_hours,
          icon: 'cash-outline',
          backgroundColor: '#FF6F91',
        },
        {
          title: 'Offline Hours',
          value: analytics.data.total_offline_hours,
          icon: 'desktop-outline',
          backgroundColor: '#FF6347',
        },
        {
          title: 'Study Hours',
          value: analytics.data.total_study_hours,
          icon: 'book-outline',
          backgroundColor: '#2F80E9',
        },
        {
          title: 'Inhouse Hours',
          value: analytics.data.total_inhous_hours,
          icon: 'business-outline',
          backgroundColor: '#E6A54B',
        },
      ]
    : [];

  function formatValue(val) {
    if (typeof val !== 'number') return val;
    if (Number.isInteger(val)) return val;
    return val.toFixed(1);
  }

  function parseDMY(str) {
    const [d, m, y] = str.split('-');
    return new Date(`${y}-${m}-${d}`);
  }
  
  function formatDMY(date) {
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getFullYear()}`;
  }

  // Date picker logic
  const openDatePicker = (field) => {
    setDateField(field);
    const currentDate = field === 'from' ? tempFromDate : tempToDate;
    setTempDate(parseDMY(currentDate));
    setShowDatePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      const formatted = formatDMY(selectedDate);
      if (dateField === 'from') {
        setTempFromDate(formatted);
        if (Platform.OS === 'ios') {
          setFromDate(formatted);
        }
      } else {
        setTempToDate(formatted);
        if (Platform.OS === 'ios') {
          setToDate(formatted);
        }
      }
    }
  };

  const handleAndroidDateConfirm = () => {
    setShowDatePicker(false);
    if (dateField === 'from') {
      setFromDate(tempFromDate);
    } else {
      setToDate(tempToDate);
    }
  };

  const handleAndroidDateCancel = () => {
    setShowDatePicker(false);
    // Reset temp dates to current values
    setTempFromDate(fromDate);
    setTempToDate(toDate);
  };

  const openFilterModal = () => {
    setTempFromDate(fromDate);
    setTempToDate(toDate);
    setIsModalVisible(true);
  };

  const applyFilter = () => {
    setFromDate(tempFromDate);
    setToDate(tempToDate);
    setIsModalVisible(false);
  };

  const clearFilter = () => {
    const { fromDate: defaultFrom, toDate: defaultTo } = getLast10DaysRange();
    setFromDate(defaultFrom);
    setToDate(defaultTo);
    setTempFromDate(defaultFrom);
    setTempToDate(defaultTo);
    setIsModalVisible(false);
  };

  return (
    <View style={styles.main}>
      <View style={styles.filterRow}>
          <Text style={styles.filterTitle}>Last 10 Days Analytics</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={styles.filterBtn}
              onPress={openFilterModal}
            >
              <Feather name="sliders" size={p(18)} color="#3360f9" />
            </TouchableOpacity>
            {/* Show Clear Filter button only if filter is not default */}
            {(() => {
              const { fromDate: defaultFrom, toDate: defaultTo } = getLast10DaysRange();
              const isDefault = fromDate === defaultFrom && toDate === defaultTo;
              if (!isDefault) {
                return (
                  <TouchableOpacity
                    style={styles.clearBtn}
                    onPress={clearFilter}
                  >
                    <Text style={styles.clearBtnText}>Clear Filter</Text>
                  </TouchableOpacity>
                );
              }
              return null;
            })()}
          </View>
        </View>
      <View style={styles.sub}>
        
        <Text style={{textAlign: 'center', marginBottom: p(10), color: '#222', fontFamily: 'Poppins-Regular'}}>
          Analytics from {fromDate} to {toDate}
        </Text>
        {loading ? (
          <View style={{ alignItems: 'center', marginTop: p(30) }}>
            <Text>Loading...</Text>
          </View>
        ) : error ? (
          <View style={{ alignItems: 'center', marginTop: p(30) }}>
            <Text style={{ color: 'red' }}>{error}</Text>
          </View>
        ) : (
          <View style={styles.cardGrid}>
            {analyticsData.map((item, idx) => (
              <View
                key={item.title}
                style={[styles.card, { backgroundColor: item.backgroundColor }]}
              >
                <Icon
                  name={item.icon}
                  size={p(38)}
                  color="#fff"
                  style={styles.cardIcon}
                />
                <Text style={styles.cardValue}>{formatValue(item.value)}</Text>
                <Text style={styles.cardLabel}>{item.title}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      {/* Modal for Date Range */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Date Range</Text>
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                  <Icon name="close" size={p(22)} color="#333" />
                </TouchableOpacity>
              </View>
              <View style={styles.modalFieldRow}>
                <Text style={styles.modalLabel}>From Date</Text>
                <TouchableOpacity style={styles.modalInput} onPress={() => openDatePicker('from')}>
                  <Text style={styles.modalInputText}>{tempFromDate}</Text>
                  <Icon name="calendar" size={p(20)} color="#3660f9" />
                </TouchableOpacity>
              </View>
              <View style={styles.modalFieldRow}>
                <Text style={styles.modalLabel}>To Date</Text>
                <TouchableOpacity style={styles.modalInput} onPress={() => openDatePicker('to')}>
                  <Text style={styles.modalInputText}>{tempToDate}</Text>
                  <Icon name="calendar" size={p(20)} color="#3660f9" />
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalBtn}
                  onPress={applyFilter}
                >
                  <Text style={styles.modalBtnText}>Apply Filter</Text>
                </TouchableOpacity>
              </View>
              {showDatePicker && (
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  maximumDate={dateField === 'from' ? parseDMY(tempToDate) : undefined}
                  minimumDate={dateField === 'to' ? parseDMY(tempFromDate) : undefined}
                />
              )}
              {Platform.OS === 'android' && showDatePicker && (
                <View style={styles.androidPickerButtons}>
                  <TouchableOpacity style={styles.androidPickerBtn} onPress={handleAndroidDateCancel}>
                    <Text style={styles.androidPickerBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.androidPickerBtn} onPress={handleAndroidDateConfirm}>
                    <Text style={styles.androidPickerBtnText}>OK</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  sub: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    padding: p(16),
  },
  filterRow: {
    backgroundColor: '#3360f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: p(18),
    paddingHorizontal: p(16),
    paddingVertical: p(10),
  },
  filterTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(16),
    color: '#fff',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: p(8),
    paddingHorizontal: p(12),
    borderRadius: p(8),
    marginRight: p(10),
  },
  filterBtnText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(15),
    marginLeft: p(6),
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
    borderWidth: 1,
    borderColor: '#3360f9',
    paddingVertical: p(6),
    paddingHorizontal: p(10),
    borderRadius: p(8),
  },
  clearBtnText: {
    color: '#3360f9',
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(14),
    // marginLeft: p(6),
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: p(12),
  },
  card: {
    width: width / 2 - p(28),
    borderRadius: p(18),
    marginBottom: p(18),
    alignItems: 'center',
    paddingVertical: p(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardIcon: {
    marginBottom: p(10),
  },
  cardValue: {
    fontSize: p(32),
    fontFamily: 'Poppins-Bold',
    color: '#fff',
    marginBottom: p(5),
  },
  cardLabel: {
    fontSize: p(15),
    fontFamily: 'Poppins-Regular',
    color: '#fff',
    opacity: 0.95,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: p(20),
    padding: p(22),
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: p(18),
  },
  modalTitle: {
    fontSize: p(18),
    fontFamily: 'Poppins-Bold',
    color: '#222',
  },
  modalFieldRow: {
    width: '100%',
    marginBottom: p(14),
  },
  modalLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(14),
    color: '#222',
    marginBottom: p(6),
  },
  modalInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f6fa',
    borderRadius: p(8),
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: p(12),
    paddingHorizontal: p(14),
  },
  modalInputText: {
    fontFamily: 'Poppins-Regular',
    fontSize: p(15),
    color: '#444',
  },
  modalBtn: {
    backgroundColor: '#3360f9',
    borderRadius: p(10),
    paddingVertical: p(15),
    paddingHorizontal: p(10),
    marginTop: p(10),
  },
  modalBtnText: {
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    fontSize: p(14),
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: p(10),
  },
  cancelBtn: {
    backgroundColor: '#e0e0e0',
    borderRadius: p(10),
    paddingVertical: p(14),
  },
  cancelBtnText: {
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(14),
  },
  androidPickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: p(10),
  },
  androidPickerBtn: {
    paddingVertical: p(10),
    paddingHorizontal: p(20),
    borderRadius: p(8),
    backgroundColor: '#3360f9',
  },
  androidPickerBtnText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(16),
  },
});
