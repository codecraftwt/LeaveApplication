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
          <TouchableOpacity style={styles.viewBtn} onPress={() => navigation.navigate('My Leaves')} activeOpacity={0.7}>
            <Text style={styles.viewText}>View all</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.cardsRow}>
        {/* Taken Leaves Card */}
        <View style={[styles.card, { backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' }]}>
          <View style={[styles.iconWrap, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}>
            <Feather name="calendar" size={p(16)} color="#FFFFFF" />
          </View>
          <View style={styles.textWrap}>
            <Text style={[styles.value, { color: '#FFFFFF' }]}>{taken}</Text>
            <Text style={[styles.label, { color: 'rgba(255, 255, 255, 0.9)' }]} numberOfLines={1} adjustsFontSizeToFit>Taken Leaves</Text>
          </View>
        </View>

        {/* Pending Leaves Card */}
        <View style={[styles.card, { backgroundColor: '#10B981', borderColor: '#10B981' }]}>
          <View style={[styles.iconWrap, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}>
            <Feather name="clock" size={p(16)} color="#FFFFFF" />
          </View>
          <View style={styles.textWrap}>
            <Text style={[styles.value, { color: '#FFFFFF' }]}>{pending}</Text>
            <Text style={[styles.label, { color: 'rgba(255, 255, 255, 0.9)' }]} numberOfLines={1} adjustsFontSizeToFit>Pending Leaves</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: p(16),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: p(10),
    paddingHorizontal: p(2),
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(16),
    color: '#0F172A',
  },
  viewBtn: {
    backgroundColor: '#EFF6FF',
    borderRadius: p(20),
    paddingVertical: p(4),
    paddingHorizontal: p(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewText: {
    color: '#3B82F6',
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(12),
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: p(12),
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: p(16),
    paddingVertical: p(16),
    paddingHorizontal: p(16),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#64748B',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconWrap: {
    width: p(36),
    height: p(36),
    borderRadius: p(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(12),
  },
  textWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  value: {
    color: '#1E293B',
    fontFamily: 'Montserrat-Bold',
    fontSize: p(22),
    lineHeight: p(26),
  },
  label: {
    color: '#64748B',
    fontFamily: 'Poppins-Medium',
    fontSize: p(11),
    marginTop: p(2),
  },
});

