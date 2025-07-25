import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { p } from '../../utils/Responsive';
import Feather from 'react-native-vector-icons/Feather';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

export default function LeaveInfo({ showViewButton = true }) {
  const dashboard = useSelector(state => state.auth.dashboard);
  const taken = dashboard?.taken_leaves || 0;
  const pending = dashboard?.remaining_leaves || 0;
  const navigation = useNavigation();


  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Leave Information</Text>
        {showViewButton && (
          <TouchableOpacity style={styles.viewBtn} onPress={() => navigation.navigate('My Leaves')}>
            <Text style={styles.viewText}>View</Text>
            <Feather
              name="eye"
              size={p(16)}
              color="#3360f9"
              style={{ marginLeft: p(4) }}
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.card}>
        <View style={styles.col}>
          <Text style={styles.value}>{taken}</Text>
          <Text style={styles.label}>Current Year{"\n"}Taken Leaves</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.col}>
          <Text style={styles.value}>{pending}</Text>
          <Text style={styles.label}>Total{"\n"}Pending Leaves</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: p(10),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: p(6),
    paddingHorizontal: p(2),
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(15),
    color: '#222',
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewText: {
    color: '#3360f9',
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(13),
  },
  card: {
    backgroundColor: '#3360f9',
    borderRadius: p(14),
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(10),
    paddingHorizontal: p(16),
    justifyContent: 'space-between',
    minHeight: p(60),
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  col: {
    flex: 1,
    alignItems: 'center',
  },
  value: {
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    fontSize: p(22),
    marginBottom: p(1),
  },
  label: {
    color: '#fff',
    fontFamily: 'Poppins-Regular',
    fontSize: p(12),
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: p(15),
  },
  divider: {
    width: 1,
    height: p(32),
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: p(14),
  },
});
