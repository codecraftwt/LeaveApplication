import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { p } from '../../utils/Responsive';
import { useSelector } from 'react-redux';

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec',
];

export default function MonthStats() {
  const dashboard = useSelector(state => state.auth.dashboard);
  const stats = dashboard|| {};
  const currentDate = new Date();
  const currentMonthIndex = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const lastThreeMonths = [
    {
      month: monthNames[(currentMonthIndex - 1 + 12) % 12],
      year: currentYear + Math.floor((currentMonthIndex - 1) / 12),
      hours: stats.last_month || 0,
    },
    {
      month: monthNames[(currentMonthIndex - 2 + 12) % 12],
      year: currentYear + Math.floor((currentMonthIndex - 2) / 12),
      hours: stats.preview_month || 0,
    },
    {
      month: monthNames[(currentMonthIndex - 3 + 12) % 12],
      year: currentYear + Math.floor((currentMonthIndex - 3) / 12),
      hours: stats.long_preview_month || 0,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Last Three Months Achieved Hours</Text>
      <View style={styles.mainContainer}>
        {lastThreeMonths.map((item, idx) => (
          <View
            key={idx}
            style={[
              styles.box,
              idx === 0 && {
                backgroundColor: '#E7F2FF',
                borderWidth: 1,
                borderColor: '#2F80E9',
                borderStyle: 'solid',
              },
              idx === 1 && {
                backgroundColor: '#FFF4EA',
                borderWidth: 1,
                borderColor: '#FFA620',
                borderStyle: 'solid',
              },
              idx === 2 && {
                backgroundColor: '#F3FFF5',
                borderWidth: 1,
                borderColor: '#9CFFAE',
                borderStyle: 'solid',
              },
            ]}
          >
            <Text style={styles.hours}>{item.hours}</Text>
            <Text style={styles.date}>
              {item.month} {item.year}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: p(16),
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: p(5),
  },
  box: {
    width: p(110),
    height: p(80),
    backgroundColor: '#F8F8F8',
    borderRadius: p(10),
    paddingHorizontal: p(5),
    justifyContent: 'center',
  },
  hours: {
    fontSize: p(26),
    fontFamily: 'Montserrat-SemiBold',
    color: '#000',
  },
  date: {
    fontSize: p(14),
    fontFamily: 'Poppins-Regular',
    color: '#000',
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(16),
    color: '#222',
  },
});
