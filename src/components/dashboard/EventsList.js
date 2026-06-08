import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { p } from '../../utils/Responsive';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useSelector } from 'react-redux';

const iconMap = {
  'birthday-cake': (
    <FontAwesome5 name="birthday-cake" size={p(16)} color="#8B5CF6" /> // Purple
  ),
  gift: <Feather name="gift" size={p(16)} color="#F59E0B" />, // Amber
  calendar: <Feather name="calendar" size={p(16)} color="#10B981" />, // Emerald
  home: <Feather name="home" size={p(16)} color="#3B82F6" />, // Blue
};

const iconBgMap = {
  'birthday-cake': '#EDE9FE',
  gift: '#FEF3C7',
  calendar: '#D1FAE5',
  home: '#F8FAFC',
};

export default function EventsList() {
  const dashboard = useSelector(state => state.auth.dashboard);
  const upcomingHolidays = dashboard?.upcoming_holidays || [];
  const todaysBirthdays = dashboard?.todays_birthdays || [];
  const todaysWorkAnniversary = dashboard?.todays_workanniversary || [];

  // Render specific content based on the event label
  const renderExpandedContent = (label) => {
    if (label === "Upcoming Holidays") {
      if (!upcomingHolidays || upcomingHolidays.length === 0) {
        return <Text style={styles.expandedText}>No upcoming holidays</Text>;
      }
      return (
        <View style={styles.listWrapper}>
          {upcomingHolidays.map((holiday, index) => (
            <View key={index} style={[styles.listItem, index !== upcomingHolidays.length - 1 && styles.borderBottom]}>
              <View style={[styles.listIconWrap, { backgroundColor: '#EEF2FF' }]}>
                <Feather name="calendar" size={p(14)} color="#3660f9" />
              </View>
              <View style={styles.listContent}>
                <Text style={styles.listTitle}>{holiday.event_name}</Text>
                <Text style={styles.listDate}>{holiday.formatted_event_date}</Text>
              </View>
            </View>
          ))}
        </View>
      );
    }

    if (label === "Today's Birthday") {
      if (!todaysBirthdays || todaysBirthdays.length === 0) {
        return <Text style={styles.expandedText}>No birthdays today</Text>;
      }
      return (
        <View style={styles.listWrapper}>
          {todaysBirthdays.map((b, index) => (
            <View key={index} style={[styles.listItem, index !== todaysBirthdays.length - 1 && styles.borderBottom]}>
              <View style={[styles.listIconWrap, { backgroundColor: '#EDE9FE' }]}>
                <Feather name="user" size={p(14)} color="#8B5CF6" />
              </View>
              <Text style={styles.listTitle}>{b.first_name} {b.last_name}</Text>
            </View>
          ))}
        </View>
      );
    }

    if (label === "Today's Work Anniversary") {
      if (!todaysWorkAnniversary || todaysWorkAnniversary.length === 0) {
        return <Text style={styles.expandedText}>No work anniversaries today</Text>;
      }
      return (
        <View style={styles.listWrapper}>
          {todaysWorkAnniversary.map((a, index) => (
            <View key={index} style={[styles.listItem, index !== todaysWorkAnniversary.length - 1 && styles.borderBottom]}>
              <View style={[styles.listIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Feather name="award" size={p(14)} color="#F59E0B" />
              </View>
              <Text style={styles.listTitle}>{a.first_name} {a.last_name}</Text>
            </View>
          ))}
        </View>
      );
    }

    return null;
  };

  const allEvents = [
    { icon: 'birthday-cake', label: "Today's Birthday" },
    { icon: 'gift', label: "Today's Work Anniversary" },
    { icon: 'home', label: "Upcoming Holidays" },
  ];
  const [expanded, setExpanded] = useState(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Events</Text>
      {allEvents.map((event, idx) => {
        const isExpanded = expanded === idx;
        return (
          <View key={event.label} style={styles.cardContainer}>
            <TouchableOpacity
              style={[styles.card, isExpanded && styles.cardActive]}
              onPress={() => setExpanded(isExpanded ? null : idx)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconWrap, { backgroundColor: iconBgMap[event.icon] || '#EEF2FF' }]}>
                {iconMap[event.icon]}
              </View>
              <Text style={styles.label}>{event.label}</Text>
              <Feather
                name="chevron-right"
                size={p(20)}
                color="#94A3B8"
                style={[
                  styles.arrow,
                  isExpanded && { transform: [{ rotate: '90deg' }], color: '#3B82F6' },
                ]}
              />
            </TouchableOpacity>
            {isExpanded && (
              <View style={[styles.expandedView, { backgroundColor: iconBgMap[event.icon] || '#F8FAFC' }]}>
                {renderExpandedContent(event.label)}
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
    color: '#0F172A',
    marginBottom: p(10),
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: p(16),
    marginBottom: p(10),
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(14),
    paddingHorizontal: p(16),
    borderRadius: p(16),
  },
  cardActive: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  iconWrap: {
    width: p(36),
    height: p(36),
    borderRadius: p(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(12),
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: p(14),
    color: '#1E293B',
    flex: 1,
  },
  arrow: {
    marginLeft: p(10),
  },
  expandedView: {
    paddingHorizontal: p(16),
    paddingBottom: p(16),
    paddingTop: p(8),
    borderBottomLeftRadius: p(16),
    borderBottomRightRadius: p(16),
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)',
  },
  expandedText: {
    fontFamily: 'Poppins-Regular',
    fontSize: p(13),
    color: '#64748B',
    lineHeight: p(20),
    textAlign: 'center',
    paddingVertical: p(8),
  },
  listWrapper: {
    marginTop: p(4),
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(10),
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  listIconWrap: {
    width: p(32),
    height: p(32),
    borderRadius: p(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(12),
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: p(14),
    color: '#334155',
  },
  listDate: {
    fontFamily: 'Poppins-Regular',
    fontSize: p(12),
    color: '#94A3B8',
    marginTop: p(2),
  },
});
