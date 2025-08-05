import React, { useState } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import { p } from '../../utils/Responsive';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function LeaveReason() {
  const navigation = useNavigation();
  const route = useRoute();

  // Use static props if none passed via route
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
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = () => {
    setIsApproving(true);
    setTimeout(() => {
      setStatus('Approved');
      setIsApproving(false);
      navigation.goBack();
    }, 1000);
  };

  const handleReject = () => {
    setRejectModalVisible(true);
  };

  const handleRejectSubmit = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    setIsRejecting(true);
    setTimeout(() => {
      setStatus('Rejected');
      setRejectModalVisible(false);
      employee.reject_reason = rejectionReason;
      setIsRejecting(false);
      navigation.goBack();
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar backgroundColor="#3660f9" barStyle="light-content" />
      {/* Custom Header for LeaveReason page with adjusted iOS padding */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={p(22)} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Leave Reason</Text>
          <Image
            source={require('../../assets/walstar11.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Employee Info */}
          <View style={styles.employeeInfo}>
            <View style={styles.avatarContainer}>
              <Icon name="user-circle" size={p(50)} color="#ff9633" />
            </View>
            <View style={styles.employeeDetails}>
              <Text style={styles.employeeName}>{employee.name}</Text>
              <Text style={styles.employeeEmail}>{employee.email}</Text>
            </View>
          </View>

          {/* Status */}
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    status === 'Pending'
                      ? '#FFF3E0'
                      : status === 'Approved'
                      ? '#E8F5E9'
                      : '#FFEBEE',
                },
              ]}
            >
              <Icon
                name={
                  status === 'Pending'
                    ? 'clock-o'
                    : status === 'Approved'
                    ? 'check-circle'
                    : 'times-circle'
                }
                size={p(16)}
                color={
                  status === 'Pending'
                    ? '#FF9800'
                    : status === 'Approved'
                    ? '#4CAF50'
                    : '#F44336'
                }
              />
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      status === 'Pending'
                        ? '#FF9800'
                        : status === 'Approved'
                        ? '#4CAF50'
                        : '#F44336',
                  },
                ]}
              >
                {status}
              </Text>
            </View>
          </View>

          {/* Leave Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Leave Information</Text>
            <View style={styles.detailGrid}>
              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Icon name="calendar" size={p(20)} color="#3660f9" />
                </View>
                <Text style={styles.detailLabel}>Leave Dates</Text>
                <Text style={styles.detailValue}>{employee.date}</Text>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Icon name="clock-o" size={p(20)} color="#3660f9" />
                </View>
                <Text style={styles.detailLabel}>Duration</Text>
                <Text style={styles.detailValue}>
                  {employee.no_of_days}{' '}
                  {employee.no_of_days > 1 ? 'Days' : 'Day'}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Icon name="file-text" size={p(20)} color="#3660f9" />
                </View>
                <Text style={styles.detailLabel}>Leave Type</Text>
                <Text style={styles.detailValue}>{employee.leave_type_id}</Text>
              </View>
            </View>
          </View>

          {/* Reason */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reason for Leave</Text>
            <View style={styles.descriptionBox}>
              <Icon
                name="comment"
                size={p(20)}
                color="#3660f9"
                style={styles.descriptionIcon}
              />
              <Text style={styles.descriptionText}>
                {employee.leave_description || 'No description provided'}
              </Text>
            </View>
          </View>

          {/* Rejection Reason */}
          {status === 'Rejected' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rejection Reason</Text>
              <View style={[styles.descriptionBox, styles.rejectionBox]}>
                <Icon
                  name="times-circle"
                  size={p(20)}
                  color="#f44336"
                  style={styles.descriptionIcon}
                />
                <Text style={[styles.descriptionText, styles.rejectionText]}>
                  {rejectionReason ||
                    employee.reject_reason ||
                    'No rejection reason provided'}
                </Text>
              </View>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {status === 'Pending' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={handleApprove}
                disabled={isApproving}
              >
                {isApproving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Icon name="check-circle" size={p(18)} color="#fff" />
                    <Text style={styles.buttonText}>Approve</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {status === 'Pending' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={handleReject}
                disabled={isRejecting}
              >
                {isRejecting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Icon name="times-circle" size={p(18)} color="#fff" />
                    <Text style={styles.buttonText}>Reject</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Reject Modal */}
      <Modal
        animationType="slide"
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
            <Text style={styles.modalTitle}>Reject Leave Request</Text>
            <Text style={styles.modalSubtitle}>
              Please provide a reason for rejection
            </Text>

            <TextInput
              style={styles.reasonInput}
              multiline
              numberOfLines={4}
              placeholder="Enter rejection reason..."
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
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleRejectSubmit}
              >
                <Text style={styles.modalButtonText}>Submit</Text>
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
  container: {
    flexGrow: 1,
  },
  // Custom header styles for LeaveReason page
  headerContainer: {
    backgroundColor: '#3360f9',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? p(20) : p(18),
    paddingBottom: p(10),
    paddingHorizontal: p(16),
  },
  backBtn: {
    width: p(32),
    height: p(32),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    fontSize: p(18),
  },
  logo: {
    width: p(80),
    height: p(36),
    marginLeft: p(8),
  },
  card: {
    backgroundColor: '#fff',
    marginTop: p(0),
    borderTopLeftRadius: p(25),
    borderTopRightRadius: p(25),
    padding: p(25),
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(20),
  },
  avatarContainer: {
    width: p(70),
    height: p(70),
    borderRadius: p(35),
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(15),
  },
  employeeDetails: {
    flex: 1,
  },
  employeeName: {
    fontSize: p(18),
    fontFamily: 'Montserrat-SemiBold',
    color: '#2c3e50',
    marginBottom: p(4),
  },
  employeeEmail: {
    fontSize: p(14),
    color: '#666',
    fontFamily: 'Rubik-Regular',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: p(25),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(8),
    paddingHorizontal: p(15),
    borderRadius: p(20),
  },
  statusText: {
    fontSize: p(14),
    fontFamily: 'Rubik-Regular',
    marginLeft: p(8),
  },
  section: {
    marginBottom: p(25),
  },
  sectionTitle: {
    fontSize: p(16),
    fontFamily: 'Montserrat-SemiBold',
    color: '#2c3e50',
    marginBottom: p(15),
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '31%',
    backgroundColor: '#f1f5fa',
    borderRadius: p(15),
    padding: p(15),
    marginBottom: p(15),
    alignItems: 'center',
  },
  detailIconContainer: {
    width: p(35),
    height: p(35),
    borderRadius: p(20),
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: p(10),
  },
  detailLabel: {
    fontSize: p(12),
    color: '#666',
    marginBottom: p(4),
    fontFamily: 'Rubik-Regular',
  },
  detailValue: {
    fontSize: p(12),
    fontFamily: 'Rubik-Regular',
    color: '#2c3e50',
    textAlign: 'center',
  },
  descriptionBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: p(15),
    padding: p(20),
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  descriptionIcon: {
    marginRight: p(10),
    marginTop: p(2),
  },
  descriptionText: {
    flex: 1,
    fontSize: p(14),
    lineHeight: p(22),
    color: '#2c3e50',
    fontFamily: 'Rubik-Regular',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: p(20),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: p(12),
    paddingVertical: p(12),
    paddingHorizontal: p(20),
    flex: 1,
    marginHorizontal: p(5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    minHeight: p(45),
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: p(14),
    fontFamily: 'Montserrat-SemiBold',
    marginLeft: p(8),
  },
  deleteButton: {
    padding: p(8),
    backgroundColor: '#FFEBEE',
    borderRadius: p(20),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: p(20),
    padding: p(20),
    width: '90%',
    maxWidth: p(400),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: p(20),
    fontFamily: 'Montserrat-SemiBold',
    color: '#2c3e50',
    marginBottom: p(8),
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: p(14),
    color: '#666',
    marginBottom: p(20),
    textAlign: 'center',
    fontFamily: 'Rubik-Regular',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: p(10),
    padding: p(12),
    fontSize: p(14),
    fontFamily: 'Rubik-Regular',
    marginBottom: p(20),
    minHeight: p(100),
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: p(12),
    borderRadius: p(10),
    marginHorizontal: p(5),
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#f44336',
  },
  modalButtonText: {
    fontSize: p(14),
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
  },
  rejectionBox: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    padding: p(15),
  },
  rejectionText: {
    color: '#f44336',
    fontSize: p(14),
    fontFamily: 'Rubik-Regular',
    lineHeight: p(20),
  },
});
