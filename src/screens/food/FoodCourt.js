import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FoodCourt = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Food Court</Text>
  </View>
);

export default FoodCourt;

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