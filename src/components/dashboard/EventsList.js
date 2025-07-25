import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { p } from '../../utils/Responsive';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useSelector } from 'react-redux';

const iconMap = {
  'birthday-cake': (
    <FontAwesome5 name="birthday-cake" size={p(20)} color="#3360f9" />
  ),
  gift: <Feather name="gift" size={p(20)} color="#3360f9" />,
  calendar: <Feather name="calendar" size={p(20)} color="#3360f9" />,
  home: <Feather name="home" size={p(20)} color="#3360f9" />,
};

const tempData = {
  "Today's Birthday":
    'Uday Mayanna, Bibikhadija Shaikh, Dhanashri Jadhav, Shubham Bhadarage',
  "Today's Work Anniversary": 'No work anniversaries today',
  "Upcoming Holiday's": '15 Aug 2025 - Independence Day',
};

export default function EventsList() {
  const dashboard = useSelector(state => state.auth.dashboard);
  const upcomingHolidays = dashboard?.upcoming_holidays || '';
  const todaysBirthdays = dashboard?.todays_birthdays || [];
  const todaysWorkAnniversary = dashboard?.todays_workanniversary || [];
  // Map event labels to data
  const eventData = {
    "Today's Birthday": todaysBirthdays.length > 0 ? todaysBirthdays.map(b => `${b.first_name} ${b.last_name}`).join(', ') : 'No birthdays today',
    "Today's Work Anniversary": todaysWorkAnniversary.length > 0 ? todaysWorkAnniversary.map(a => `${a.first_name} ${a.last_name}`).join(', ') : 'No work anniversaries today',
    "Upcoming Holiday's": upcomingHolidays || 'No upcoming holidays',
  };
  // Add Upcoming Holidays event
  const allEvents = [
    { icon: 'birthday-cake', label: "Today's Birthday" },
    { icon: 'gift', label: "Today's Work Anniversary" },
    { icon: 'home', label: "Upcoming Holiday's" },
  ];
  const [expanded, setExpanded] = useState(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Events</Text>
      {allEvents.map((event, idx) => {
        const isExpanded = expanded === idx;
        return (
          <View key={event.label}>
            <TouchableOpacity
              style={[styles.card, isExpanded && styles.cardActive]}
              onPress={() => setExpanded(isExpanded ? null : idx)}
              activeOpacity={0.8}
            >
              <View style={styles.iconWrap}>{iconMap[event.icon]}</View>
              <Text style={styles.label}>{event.label}</Text>
              <Feather
                name="chevron-right"
                size={p(22)}
                color={isExpanded ? '#3360f9' : '#3360f9'}
                style={[
                  styles.arrow,
                  isExpanded && { transform: [{ rotate: '90deg' }] },
                ]}
              />
            </TouchableOpacity>
            {isExpanded && (
              <View style={styles.expandedView}>
                <Text style={styles.expandedText}>{eventData[event.label]}</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: p(24),
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(16),
    color: '#222',
    marginBottom: p(10),
  },
  card: {
    backgroundColor: '#e3f0ff',
    borderRadius: p(14),
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(14),
    paddingHorizontal: p(18),
    marginBottom: p(10),
  },
  cardActive: {
    backgroundColor: '#f5f8ff',
    borderColor: '#3360f9',
    borderWidth: 1,
  },
  iconWrap: {
    marginRight: p(14),
  },
  label: {
    fontFamily: 'Poppins-Regular',
    fontSize: p(15),
    color: '#222',
    flex: 1,
  },
  arrow: {
    marginLeft: p(10),
  },
  expandedView: {
    backgroundColor: '#fff',
    borderRadius: p(14),
    marginTop: -p(8),
    marginBottom: p(10),
    marginHorizontal: p(2),
    padding: p(14),
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  expandedText: {
    fontFamily: 'Poppins-Regular',
    fontSize: p(14),
    color: '#222',
    lineHeight: p(20),
  },
});
