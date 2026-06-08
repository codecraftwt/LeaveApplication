import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { p } from '../../utils/Responsive';
import { useSelector } from 'react-redux';

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec',
];

export default function MonthStats() {
  const dashboard = useSelector(state => state.auth.dashboard);
  const stats = dashboard || {};
  const currentDate = new Date();
  const currentMonthIndex = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const lastThreeMonths = [
    {
      month: monthNames[(currentMonthIndex - 1 + 12) % 12],
      year: currentYear + Math.floor((currentMonthIndex - 1) / 12),
      hours: stats.last_month || 0,
      color: '#3B82F6', // Blue
    },
    {
      month: monthNames[(currentMonthIndex - 2 + 12) % 12],
      year: currentYear + Math.floor((currentMonthIndex - 2) / 12),
      hours: stats.preview_month || 0,
      color: '#F59E0B', // Amber
    },
    {
      month: monthNames[(currentMonthIndex - 3 + 12) % 12],
      year: currentYear + Math.floor((currentMonthIndex - 3) / 12),
      hours: stats.long_preview_month || 0,
      color: '#10B981', // Emerald
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Achieved Hours</Text>

      <View style={styles.unifiedCard}>
        {lastThreeMonths.map((item, idx) => (
          <React.Fragment key={idx}>
            <View style={styles.segment}>
              <Text style={styles.hours}>{item.hours}</Text>
              <View style={styles.dateRow}>
                <View style={[styles.dot, { backgroundColor: item.color }]} />
                <Text style={styles.date}>
                  {item.month} {item.year}
                </Text>
              </View>
            </View>

            {/* Vertical Divider between segments */}
            {idx < 2 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: p(12),
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: p(17),
    color: '#0F172A',
    marginBottom: p(12),
  },
  unifiedCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: p(16),
    paddingVertical: p(20),
    paddingHorizontal: p(4),
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    width: 1,
    height: '70%',
    backgroundColor: '#E2E8F0',
  },
  hours: {
    fontSize: p(22),
    fontFamily: 'Montserrat-Bold',
    color: '#1E293B',
    marginBottom: p(6),
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: p(8),
    height: p(8),
    borderRadius: p(4),
    marginRight: p(6),
  },
  date: {
    fontSize: p(12),
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
  },
});
