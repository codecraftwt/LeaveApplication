import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { p } from '../utils/Responsive';

const PermissionModal = ({ visible, onClose, onGrantPermission }) => {
  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
    onClose();
  };

  const handleGrantPermission = () => {
    onGrantPermission();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <Icon name="shield-checkmark" size={p(50)} color="#0079dd" />
          </View>
          
          <Text style={styles.title}>Storage Permission Required</Text>
          
          <Text style={styles.description}>
            To generate and save PDF files, this app needs access to your device's storage.
          </Text>
          
          <Text style={styles.subDescription}>
            This permission allows the app to save your salary slips and annual package PDFs to your Downloads folder.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleGrantPermission}
            >
              <Icon name="checkmark-circle" size={p(20)} color="#fff" />
              <Text style={styles.primaryButtonText}>Grant Permission</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={openSettings}
            >
              <Icon name="settings" size={p(20)} color="#0079dd" />
              <Text style={styles.secondaryButtonText}>Open Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(25),
    margin: p(20),
    alignItems: 'center',
    maxWidth: p(350),
  },
  iconContainer: {
    marginBottom: p(20),
  },
  title: {
    fontSize: p(20),
    fontFamily: 'Montserrat-SemiBold',
    color: '#333',
    textAlign: 'center',
    marginBottom: p(15),
  },
  description: {
    fontSize: p(16),
    fontFamily: 'Rubik-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: p(24),
    marginBottom: p(10),
  },
  subDescription: {
    fontSize: p(14),
    fontFamily: 'Rubik-Regular',
    color: '#888',
    textAlign: 'center',
    lineHeight: p(20),
    marginBottom: p(25),
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(12),
    paddingHorizontal: p(20),
    borderRadius: p(8),
    marginBottom: p(10),
  },
  primaryButton: {
    backgroundColor: '#0079dd',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: p(16),
    fontFamily: 'Montserrat-SemiBold',
    marginLeft: p(8),
  },
  secondaryButton: {
    backgroundColor: '#f0f8ff',
    borderWidth: 1,
    borderColor: '#0079dd',
  },
  secondaryButtonText: {
    color: '#0079dd',
    fontSize: p(16),
    fontFamily: 'Montserrat-SemiBold',
    marginLeft: p(8),
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: p(16),
    fontFamily: 'Rubik-Regular',
  },
});

export default PermissionModal; 