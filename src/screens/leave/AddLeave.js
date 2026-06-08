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
  const timerRef = useRef(null);

  // Format date as YYYY-MM-DD
  const formatDate = date => {
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

    // Set submitting flag to track the submission
    setIsSubmitting(true);

    dispatch(addLeave({ userId: user.id, leaveData: payload }));
  };

  const resetForm = () => {
    setCategory(leaveCategories[0]);
    setLeaveType(null);
    setFromDate(null);
    setToDate(null);
    setReason('');
    setFormError('');
  };
  
  // Handle API response and success state
  useEffect(() => {
    if (isSubmitting && !addLeaveLoading) {
      if (addLeaveError) {
        setFormError(addLeaveError);
        setIsSubmitting(false);
      } else {
        // Success case
        setShowSuccessModal(true);
        setIsSubmitting(false);

        // Clear any previous timer
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        // Set new timer
        timerRef.current = setTimeout(() => {
          console.log('🔄 Auto navigating back...');
          // Close modal and navigate back
          setShowSuccessModal(false);
          resetForm();
          // Navigate to Drawer -> HomeTabs -> My Leaves
          navigation.navigate('Drawer', { 
            screen: 'HomeTabs', 
            params: { screen: 'My Leaves' } 
          });
        }, 2500);
      }
    }
  }, [addLeaveLoading, addLeaveError, isSubmitting, navigation]);

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

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(resetAddLeaveState());
    }, [dispatch]),
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
          <View style={styles.formGroup}>
            <Text style={styles.label}>Leave Category</Text>
            <TouchableOpacity
              style={[styles.inputBox, showDropdown && styles.inputBoxActive]}
              onPress={() => setShowDropdown(!showDropdown)}
              activeOpacity={0.8}
            >
              <Text style={[styles.inputText, !category?.value && { color: '#94A3B8' }]}>
                {category?.label}
              </Text>
              <Feather
                name={showDropdown ? 'chevron-up' : 'chevron-down'}
                size={p(20)}
                color="#64748B"
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
          </View>

          {/* Leave Type Radio Buttons */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Leave Duration</Text>
            <View style={styles.radioContainer}>
              {leaveTypes.map(type => {
                const isSelected = leaveType?.value === type.value;
                return (
                  <TouchableOpacity
                    key={type.value}
                    style={[styles.radioCard, isSelected && styles.radioCardActive]}
                    onPress={() => setLeaveType(type)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterActive]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <Text style={[styles.radioLabel, isSelected && styles.radioLabelActive]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Date Selection */}
          {(leaveType?.value === 'singleDay' || leaveType?.value === 'halfDay' || leaveType?.value === 'multipleDays') && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {leaveType?.value === 'multipleDays' ? 'Select Dates' : 'Select Date'}
              </Text>
              
              <View style={styles.dateRow}>
                {/* From Date */}
                <TouchableOpacity
                  style={[styles.inputBox, styles.dateBox]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setShowDatePicker(true);
                    setDateField('from');
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dateSubLabel}>From</Text>
                    <Text style={[styles.inputText, !fromDate && { color: '#94A3B8' }]}>
                      {fromDate ? formatDate(fromDate) : 'YYYY-MM-DD'}
                    </Text>
                  </View>
                  <View style={styles.dateIconWrap}>
                    <Feather name="calendar" size={p(18)} color="#3660f9" />
                  </View>
                </TouchableOpacity>

                {/* To Date - Only show for multiple days */}
                {leaveType?.value === 'multipleDays' && (
                  <TouchableOpacity
                    style={[styles.inputBox, styles.dateBox]}
                    activeOpacity={0.8}
                    onPress={() => {
                      setShowDatePicker(true);
                      setDateField('to');
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dateSubLabel}>To</Text>
                      <Text style={[styles.inputText, !toDate && { color: '#94A3B8' }]}>
                        {toDate ? formatDate(toDate) : 'YYYY-MM-DD'}
                      </Text>
                    </View>
                    <View style={styles.dateIconWrap}>
                      <Feather name="calendar" size={p(18)} color="#3660f9" />
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

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
            />
          )}

          {/* Reason Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Reason</Text>
            <TextInput
              style={[styles.inputBox, styles.textArea]}
              placeholder="Please describe your reason for taking leave..."
              value={reason}
              onChangeText={setReason}
              placeholderTextColor="#94A3B8"
              multiline
              minHeight={p(120)}
              textAlignVertical="top"
            />
          </View>

          {/* Error Message */}
          {formError ? (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={p(16)} color="#EF0107" />
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          ) : null}

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => navigation.goBack()}
              disabled={addLeaveLoading || isSubmitting}
            >
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.addBtn,
                (addLeaveLoading || isSubmitting) && styles.addBtnDisabled,
              ]}
              onPress={handleAddLeave}
              disabled={addLeaveLoading || isSubmitting}
              activeOpacity={0.8}
            >
              {addLeaveLoading || isSubmitting ? (
                <Text style={styles.addBtnText}>Submitting...</Text>
              ) : (
                <>
                  <Text style={styles.addBtnText}>Submit Application</Text>
                  <Feather name="arrow-right" size={p(18)} color="#FFFFFF" style={{ marginLeft: p(8) }} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (timerRef.current) clearTimeout(timerRef.current);
          setShowSuccessModal(false);
          resetForm();
          navigation.navigate('Drawer', { 
            screen: 'HomeTabs', 
            params: { screen: 'My Leaves' } 
          });
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successDialog}>
            <View style={styles.successIconWrap}>
              <Feather name="check" size={p(40)} color="#10B981" />
            </View>
            <Text style={styles.successTitle}>Success!</Text>
            <Text style={styles.successText}>Your leave application has been submitted successfully.</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: p(20),
    paddingBottom: p(340),
  },
  formGroup: {
    marginBottom: p(24),
  },
  label: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(14),
    color: '#1E293B',
    marginBottom: p(8),
    letterSpacing: 0.2,
  },
  inputBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: p(14),
    paddingVertical: p(16),
    paddingHorizontal: p(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#64748B',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  inputBoxActive: {
    borderColor: '#3660f9',
    backgroundColor: '#F0F4FF',
  },
  inputText: {
    fontFamily: 'Poppins-Medium',
    fontSize: p(14),
    color: '#0F172A',
    flex: 1,
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: p(12),
    marginTop: p(8),
    overflow: 'hidden',
    shadowColor: '#64748B',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  dropdownItem: {
    paddingVertical: p(14),
    paddingHorizontal: p(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemText: {
    fontFamily: 'Poppins-Medium',
    fontSize: p(14),
    color: '#334155',
  },
  radioContainer: {
    flexDirection: 'column',
    gap: p(10),
  },
  radioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: p(12),
    padding: p(14),
    shadowColor: '#64748B',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  radioCardActive: {
    borderColor: '#3660f9',
    backgroundColor: '#EEF2FF',
  },
  radioOuter: {
    width: p(20),
    height: p(20),
    borderRadius: p(10),
    borderWidth: 2,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(12),
  },
  radioOuterActive: {
    borderColor: '#3660f9',
  },
  radioInner: {
    width: p(10),
    height: p(10),
    borderRadius: p(5),
    backgroundColor: '#3660f9',
  },
  radioLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: p(14),
    color: '#475569',
  },
  radioLabelActive: {
    color: '#3660f9',
    fontFamily: 'Poppins-SemiBold',
  },
  dateRow: {
    flexDirection: 'row',
    gap: p(12),
  },
  dateBox: {
    flex: 1,
    alignItems: 'center',
  },
  dateSubLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: p(11),
    color: '#94A3B8',
    marginBottom: p(2),
  },
  dateIconWrap: {
    width: p(36),
    height: p(36),
    borderRadius: p(8),
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textArea: {
    paddingTop: p(16),
  },
  btnRow: {
    flexDirection: 'row',
    gap: p(12),
    marginTop: p(10),
  },
  closeBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: p(14),
    paddingVertical: p(16),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#64748B',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  closeBtnText: {
    color: '#475569',
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(15),
  },
  addBtn: {
    flex: 2,
    backgroundColor: '#3660f9', // Primary Blue
    borderRadius: p(14),
    paddingVertical: p(16),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3660f9',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  addBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    fontSize: p(15),
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: p(10),
    padding: p(12),
    marginBottom: p(20),
  },
  errorText: {
    color: '#EF0107',
    fontFamily: 'Poppins-Medium',
    fontSize: p(13),
    marginLeft: p(8),
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: p(20),
  },
  successDialog: {
    backgroundColor: '#FFFFFF',
    padding: p(30),
    borderRadius: p(24),
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  successIconWrap: {
    width: p(80),
    height: p(80),
    borderRadius: p(40),
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: p(20),
  },
  successTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: p(22),
    color: '#0F172A',
    marginBottom: p(8),
  },
  successText: {
    fontFamily: 'Poppins-Regular',
    fontSize: p(15),
    color: '#64748B',
    textAlign: 'center',
    lineHeight: p(22),
  },
});
