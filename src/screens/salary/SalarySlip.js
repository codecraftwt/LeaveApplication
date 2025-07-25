import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SalarySlip = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Salary Slip</Text>
  </View>
);

export default SalarySlip;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: '#3360f9',
  },
}); 