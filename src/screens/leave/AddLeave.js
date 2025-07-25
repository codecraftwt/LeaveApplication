import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Modal,
} from 'react-native';
import { p } from '../../utils/Responsive';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/Header';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import { addLeave, resetAddLeaveState } from '../../redux/slices/leaveSlice';
import { useFocusEffect } from '@react-navigation/native';

const leaveCategories = [
  { label: 'Select Leave Category', value: null },
  { label: 'Maternity Leave', value: 4 },
  { label: 'Leave Without Pay', value: 5 },
  { label: 'Casual', value: 3 },
  { label: 'Emergency', value: 2 },
  { label: 'Medical', value: 1 },
];

const leaveTypes = [
  { label: 'Half Day', value: 'halfDay' },
  { label: 'Single Day', value: 'singleDay' },
  { label: 'Multiple Days', value: 'multipleDays' },
];

export default function AddLeave({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const { addLeaveLoading, addLeaveError } = useSelector(state => state.leaves);
  
  const [category, setCategory] = useState(leaveCategories[0]);
  const [leaveType, setLeaveType] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateField, setDateField] = useState('from');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollViewRef = useRef(null);

  // Formaconst [isSubmitting, setIsSubmitting] = useState(false);t date as YYYY-MM-DD
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const handleAddLeave = () => {
    setFormError('');
  
    // Validation
    if (!category?.value) {
      setFormError('Please select a leave category.');
      return;
    }
  
    if (!leaveType) {
      setFormError('Please select a leave type.');
      return;
    }
  
    if (!fromDate) {
      setFormError('Please select a date.');
      return;
    }
  
    if (leaveType.value === 'multipleDays' && !toDate) {
      setFormError('Please select a To Date.');
      return;
    }
  
    if (leaveType.value === 'multipleDays' && fromDate > toDate) {
      setFormError('From Date cannot be after To Date.');
      return;
    }
  
    if (!reason.trim()) {
      setFormError('Please enter a reason.');
      return;
    }
  
    if (!user?.id) {
      setFormError('User information missing.');
      return;
    }
  
    // ✅ Correct formatted payload
    const payload = {
      leave_category_id: category.value,
      leavetypeid: leaveType.value,
      leave_from_date: formatDate(fromDate),
      leave_to_date:
        leaveType.value === 'multipleDays'
          ? formatDate(toDate)
          : formatDate(fromDate),
      leave_description: reason.trim(),
    };
  
    console.log('🚀 Submitting payload:', payload);
  
    dispatch(addLeave({ userId: user.id, leaveData: payload }));
  };
  


  const resetForm = () => {
    setCategory(leaveCategories[0]);
    setLeaveType(null);
    setFromDate(null);
    setToDate(null);
    setReason('');
    setFormError('');
  }
  // Handle success state
  useEffect(() => {
    if (!addLeaveLoading && !addLeaveError && showSuccessModal) {
      const timer = setTimeout(() => {
        setShowSuccessModal(false);
        resetForm();
        navigation.goBack();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal, addLeaveLoading, addLeaveError]);

  // Handle API response
  useEffect(() => {
  if (isSubmitting && !addLeaveLoading) {
    if (addLeaveError) {
      setFormError(addLeaveError);
    } else {
      setShowSuccessModal(true);
    }
    setIsSubmitting(false); // reset flag
  }
}, [addLeaveLoading, addLeaveError, isSubmitting]);

  // Handle date selection
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    
    if (selectedDate) {
      if (dateField === 'from') {
        setFromDate(selectedDate);
        // For single day leave, set toDate same as fromDate
        if (leaveType?.value === 'singleDay') {
          setToDate(selectedDate);
        }
      } else {
        setToDate(selectedDate);
      }
    }
  };

  React.useEffect(() => {
    dispatch(resetAddLeaveState());
  }, [dispatch]);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(resetAddLeaveState());
    }, [dispatch])
  );

  return (
    <View style={styles.container}>
      <Header title="Add Leave" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? p(60) : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Leave Category Dropdown */}
          <Text style={styles.label}>Leave Category</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowDropdown(!showDropdown)}
            activeOpacity={0.8}
          >
            <Text style={styles.dropdownText}>{category?.label}</Text>
            <Feather
              name={showDropdown ? 'chevron-up' : 'chevron-down'}
              size={p(18)}
              color="#888"
            />
          </TouchableOpacity>
          {showDropdown && (
            <View style={styles.dropdownList}>
              {leaveCategories.map(cat => (
                <TouchableOpacity
                  key={cat.value || 'default'}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setCategory(cat);
                    setShowDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Leave Type Radio Buttons */}
          <View style={{ marginTop: p(18) }}>
            {leaveTypes.map(type => (
              <TouchableOpacity
                key={type.value}
                style={styles.radioRow}
                onPress={() => setLeaveType(type)}
                activeOpacity={0.7}
              >
                <View style={styles.radioOuter}>
                  {leaveType?.value === type.value && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Date Selection */}
          <Text style={[styles.label, { marginTop: p(18) }]}>
            {leaveType?.value === 'multipleDays' ? 'Dates' : 'Date'}
          </Text>
          
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {/* From Date */}
            <TouchableOpacity
              style={styles.dateInput}
              activeOpacity={0.8}
              onPress={() => {
                setShowDatePicker(true);
                setDateField('from');
              }}
            >
              <Text style={styles.dateText}>
                {fromDate ? formatDate(fromDate) : 'From Date'}
              </Text>
              <MaterialIcons name="date-range" size={p(20)} color="#3360f9" />
            </TouchableOpacity>
            
            {/* To Date - Only show for multiple days */}
            {leaveType?.value === 'multipleDays' && (
              <TouchableOpacity
                style={styles.dateInput}
                activeOpacity={0.8}
                onPress={() => {
                  setShowDatePicker(true);
                  setDateField('to');
                }}
              >
                <Text style={styles.dateText}>
                  {toDate ? formatDate(toDate) : 'To Date'}
                </Text>
                <MaterialIcons name="date-range" size={p(20)} color="#3360f9" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={
                (dateField === 'from' && fromDate) || 
                (dateField === 'to' && toDate) || 
                new Date()
              }
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {/* Reason Input */}
          <Text style={[styles.label, { marginTop: p(18) }]}>Reason :</Text>
          <TextInput
            style={styles.reasonInput}
            placeholder="Reason for leave"
            value={reason}
            onChangeText={setReason}
            placeholderTextColor="#888"
            multiline
            minHeight={p(100)}
          />

          {/* Error Message */}
          {(formError) && (
            <Text style={styles.errorText}>{formError}</Text>
          )}

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => navigation.goBack()}
              disabled={addLeaveLoading}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.addBtn, 
                addLeaveLoading && { backgroundColor: '#85a0f9' }
              ]} 
              onPress={handleAddLeave} 
              disabled={addLeaveLoading}
            >
              <Text style={styles.addBtnText}>
                {addLeaveLoading ? 'Adding...' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successDialog}>
            <MaterialIcons 
              name="check-circle" 
              size={p(48)} 
              color="#4CAF50" 
              style={{ marginBottom: p(10) }}
            />
            <Text style={styles.successText}>Leave added successfully!</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: p(18),
    paddingBottom: p(340), 
  },
  label: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(15),
    color: '#222',
    marginBottom: p(6),
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: p(8),
    paddingVertical: p(12),
    paddingHorizontal: p(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fafbfc',
  },
  dropdownText: {
    fontFamily: 'Poppins-Regular',
    fontSize: p(15),
    color: '#444',
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: p(8),
    marginTop: p(2),
    backgroundColor: '#fafbfc',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: p(12),
    paddingHorizontal: p(14),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: {
    fontFamily: 'Poppins-Regular',
    fontSize: p(15),
    color: '#444',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(8),
  },
  radioOuter: {
    width: p(22),
    height: p(22),
    borderRadius: p(11),
    borderWidth: 2,
    borderColor: '#3360f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(10),
  },
  radioInner: {
    width: p(12),
    height: p(12),
    borderRadius: p(6),
    backgroundColor: '#3360f9',
  },
  radioLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: p(15),
    color: '#222',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: p(8),
    paddingVertical: p(12),
    paddingHorizontal: p(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fafbfc',
    marginTop: p(2),
  },
  dateText: {
    fontFamily: 'Poppins-Regular',
    fontSize: p(15),
    color: '#444',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: p(8),
    paddingVertical: p(12),
    paddingHorizontal: p(14),
    fontFamily: 'Poppins-Regular',
    fontSize: p(15),
    color: '#222',
    backgroundColor: '#fafbfc',
    marginTop: p(2),
    textAlignVertical: 'top',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: p(28),
  },
  closeBtn: {
    backgroundColor: '#e0e0e0',
    borderRadius: p(8),
    paddingVertical: p(12),
    paddingHorizontal: p(28),
  },
  closeBtnText: {
    color: '#222',
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(15),
  },
  addBtn: {
    backgroundColor: '#3360f9',
    borderRadius: p(8),
    paddingVertical: p(12),
    paddingHorizontal: p(28),
  },
  addBtnText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(15),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successDialog: {
    backgroundColor: 'white',
    padding: p(25),
    borderRadius: p(12),
    alignItems: 'center',
    width: '80%',
  },
  successText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(18),
    color: '#333',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    marginTop: p(10),
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    fontSize: p(14),
  },
});
