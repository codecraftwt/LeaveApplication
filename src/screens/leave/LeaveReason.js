import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Modal,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import { p } from '../../utils/Responsive';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { approveLeave, rejectLeave, resetApproveRejectState } from '../../redux/slices/leaveSlice';

export default function LeaveReason() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const { 
    approveLeaveLoading, 
    approveLeaveError, 
    approveLeaveSuccess,
    rejectLeaveLoading, 
    rejectLeaveError, 
    rejectLeaveSuccess 
  } = useSelector(state => state.leaves);

  const employee = route.params?.employee || {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    status: 'Pending',
    date: '2025-07-20 To 2025-07-22',
    no_of_days: 3,
    leave_type_id: 'Sick Leave',
    leave_description: 'Family emergency leave required.',
    reject_reason: '',
  };

  const [status, setStatus] = useState(employee.status);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    return () => {
      dispatch(resetApproveRejectState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (approveLeaveSuccess) {
      setStatus('Approved');
      dispatch(resetApproveRejectState());
      navigation.navigate('Drawer', { screen: 'All Leaves' });
    }
    
    if (rejectLeaveSuccess) {
      setStatus('Rejected');
      setRejectModalVisible(false);
      employee.reject_reason = rejectionReason;
      dispatch(resetApproveRejectState());
      navigation.navigate('Drawer', { screen: 'All Leaves' });
    }
  }, [approveLeaveSuccess, rejectLeaveSuccess, dispatch, rejectionReason, employee, navigation]);

  useEffect(() => {
    if (approveLeaveError || rejectLeaveError) {
      dispatch(resetApproveRejectState());
      navigation.navigate('Drawer', { screen: 'All Leaves' });
    }
  }, [approveLeaveError, rejectLeaveError, dispatch, navigation]);

  const handleApprove = () => {
    dispatch(approveLeave({ id: employee.id }));
  };

  const handleReject = () => {
    setRejectModalVisible(true);
  };

  const handleRejectSubmit = () => {
    if (!rejectionReason.trim()) return;
    dispatch(rejectLeave({ id: employee.id, reason: rejectionReason }));
  };

  const getStatusStyles = (statusStr) => {
    switch (statusStr) {
      case 'Approved': return { bg: '#D1FAE5', text: '#059669', icon: 'check-circle' };
      case 'Pending': return { bg: '#FEF3C7', text: '#D97706', icon: 'clock' };
      case 'Rejected': return { bg: '#FEE2E2', text: '#DC2626', icon: 'x-circle' };
      default: return { bg: '#F1F5F9', text: '#64748B', icon: 'help-circle' };
    }
  };

  const statusStyle = getStatusStyles(status);

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar backgroundColor="#3660f9" barStyle="light-content" />
      
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={p(22)} color="#3660f9" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Leave</Text>
        </View>
      </View>
      
      <ScrollView
        style={{ backgroundColor: '#F8FAFC' }}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.employeeInfo}>
            <View style={styles.avatarContainer}>
              <Feather name="user" size={p(28)} color="#3660f9" />
            </View>
            <View style={styles.employeeDetails}>
              <Text style={styles.employeeName} numberOfLines={2}>{employee.name}</Text>
              <Text style={styles.employeeEmail} numberOfLines={1}>{employee.email}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Feather name={statusStyle.icon} size={p(14)} color={statusStyle.text} style={{ marginRight: p(4) }} />
              <Text style={[styles.statusText, { color: statusStyle.text }]}>{status}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Leave Details</Text>
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Feather name="calendar" size={p(18)} color="#3660f9" />
              </View>
              <View style={styles.detailTextWrap}>
                <Text style={styles.detailLabel}>Dates</Text>
                <Text style={styles.detailValue}>{employee.date}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Feather name="clock" size={p(18)} color="#3660f9" />
              </View>
              <View style={styles.detailTextWrap}>
                <Text style={styles.detailLabel}>Duration</Text>
                <Text style={styles.detailValue}>
                  {employee.no_of_days} {employee.no_of_days > 1 ? 'Days' : 'Day'}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Feather name="tag" size={p(18)} color="#3660f9" />
              </View>
              <View style={styles.detailTextWrap}>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>{employee.leave_type_id}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reason for Leave</Text>
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionText}>
                {employee.leave_description || 'No reason provided by the employee.'}
              </Text>
            </View>
          </View>

          {status === 'Rejected' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rejection Reason</Text>
              <View style={styles.rejectionBox}>
                <Text style={styles.rejectionText}>
                  {rejectionReason || employee.reject_reason || 'No rejection reason recorded.'}
                </Text>
              </View>
            </View>
          )}

          {status === 'Pending' && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={handleReject}
                disabled={rejectLeaveLoading}
              >
                {rejectLeaveLoading ? (
                  <ActivityIndicator color="#EF0107" size="small" />
                ) : (
                  <Text style={styles.rejectButtonText}>Reject Leave</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={handleApprove}
                disabled={approveLeaveLoading}
              >
                {approveLeaveLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.approveButtonText}>Approve Leave</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Reject Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={rejectModalVisible}
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setRejectModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContent}
            onPress={e => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Feather name="alert-triangle" size={p(24)} color="#EF4444" />
              <Text style={styles.modalTitle}>Reject Application</Text>
            </View>
            
            <Text style={styles.modalSubtitle}>
              Please provide a clear reason for rejecting this leave application. This will be sent to the employee.
            </Text>

            <TextInput
              style={styles.reasonInput}
              multiline
              numberOfLines={4}
              placeholder="Enter rejection reason here..."
              placeholderTextColor="#94A3B8"
              value={rejectionReason}
              onChangeText={setRejectionReason}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setRejectModalVisible(false);
                  setRejectionReason('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleRejectSubmit}
              >
                <Text style={styles.submitButtonText}>Reject Leave</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#3660f9',
  },
  headerContainer: {
    backgroundColor: '#3660f9',
    borderBottomWidth: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? p(10) : p(40),
    paddingBottom: p(20),
    paddingHorizontal: p(16),
  },
  backBtn: {
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
  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    fontSize: p(18),
  },
  container: {
    flexGrow: 1,
    padding: p(16),
    paddingBottom: p(40),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: p(20),
    padding: p(20),
    shadowColor: '#3660f9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(20),
  },
  avatarContainer: {
    width: p(50),
    height: p(50),
    borderRadius: p(25),
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(14),
  },
  employeeDetails: {
    flex: 1,
    marginRight: p(12),
  },
  employeeName: {
    fontSize: p(16),
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
    marginBottom: p(2),
  },
  employeeEmail: {
    fontSize: p(13),
    color: '#64748B',
    fontFamily: 'Poppins-Medium',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(6),
    paddingHorizontal: p(12),
    borderRadius: p(16),
  },
  statusText: {
    fontSize: p(12),
    fontFamily: 'Poppins-Bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: p(20),
  },
  section: {
    marginBottom: p(24),
  },
  sectionTitle: {
    fontSize: p(15),
    fontFamily: 'Poppins-Bold',
    color: '#1E293B',
    marginBottom: p(12),
  },
  detailGrid: {
    flexDirection: 'column',
    gap: p(12),
    marginBottom: p(24),
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: p(16),
    padding: p(14),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  detailIconContainer: {
    width: p(40),
    height: p(40),
    borderRadius: p(12),
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(14),
  },
  detailTextWrap: {
    flex: 1,
  },
  detailLabel: {
    fontSize: p(12),
    color: '#64748B',
    marginBottom: p(2),
    fontFamily: 'Poppins-Medium',
  },
  detailValue: {
    fontSize: p(14),
    fontFamily: 'Poppins-SemiBold',
    color: '#1E293B',
  },
  descriptionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: p(16),
    padding: p(16),
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  descriptionText: {
    fontSize: p(14),
    lineHeight: p(22),
    color: '#475569',
    fontFamily: 'Poppins-Regular',
  },
  rejectionBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: p(16),
    padding: p(16),
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  rejectionText: {
    color: '#DC2626',
    fontSize: p(14),
    fontFamily: 'Poppins-Medium',
    lineHeight: p(22),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: p(10),
    gap: p(12),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: p(14),
    paddingVertical: p(14),
    flex: 1,
  },
  approveButton: {
    backgroundColor: '#3660f9',
    shadowColor: '#3660f9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  rejectButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  approveButtonText: {
    color: '#fff',
    fontSize: p(14),
    fontFamily: 'Poppins-Bold',
  },
  rejectButtonText: {
    color: '#EF0107',
    fontSize: p(14),
    fontFamily: 'Poppins-Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: p(20),
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: p(24),
    padding: p(24),
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(10),
  },
  modalTitle: {
    fontSize: p(18),
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
    marginLeft: p(10),
  },
  modalSubtitle: {
    fontSize: p(13),
    color: '#64748B',
    marginBottom: p(20),
    fontFamily: 'Poppins-Regular',
    lineHeight: p(20),
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    borderRadius: p(12),
    padding: p(14),
    fontSize: p(14),
    fontFamily: 'Poppins-Regular',
    marginBottom: p(24),
    minHeight: p(120),
    color: '#1E293B',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: p(12),
  },
  modalButton: {
    flex: 1,
    paddingVertical: p(14),
    borderRadius: p(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    color: '#475569',
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(14),
  },
  submitButton: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: p(14),
    fontFamily: 'Poppins-Bold',
  },
});
