import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {p} from '../../utils/Responsive';

export const HoursReportModal = ({
  selectedTeam,
  modalVisible,
  overallHoursData,
  closeModal,
}) => {
  if (!selectedTeam) return null;
  const teamDetails = overallHoursData?.find(
    team => team?.team_id === selectedTeam?.team_id,
  );

  if (!teamDetails) return null;

  const daysOfWeek = [
    {
      day: 'Mon',
      morning: teamDetails?.monday_morning_hours,
      evening: teamDetails?.monday_evening_hours,
    },
    {
      day: 'Tue',
      morning: teamDetails?.tuesday_morning_hours,
      evening: teamDetails?.tuesday_evening_hours,
    },
    {
      day: 'Wed',
      morning: teamDetails?.wednesday_morning_hours,
      evening: teamDetails?.wednesday_evening_hours,
    },
    {
      day: 'Thu',
      morning: teamDetails?.thursday_morning_hours,
      evening: teamDetails?.thursday_evening_hours,
    },
    {
      day: 'Fri',
      morning: teamDetails?.friday_morning_hours,
      evening: teamDetails?.friday_evening_hours,
    },
    {
      day: 'Sat',
      morning: teamDetails?.saturday_morning_hours,
      evening: teamDetails?.saturday_evening_hours,
    },
    {
      day: 'Sun',
      morning: teamDetails?.sunday_morning_hours,
      evening: teamDetails?.sunday_evening_hours,
    },
  ];

  let totalMorning = 0;
  let totalEvening = 0;
  let totalOverall = 0;

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={modalVisible}
      onRequestClose={closeModal}>
      <Pressable style={styles.modalOverlay} onPress={closeModal}>
        <View style={styles.modalContentContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {teamDetails?.team_name} Details
            </Text>
            <View style={styles.table}>
              <View style={styles.tableRow1}>
                <Text style={[styles.tableHeader, {textAlign: 'left'}]}>
                  Day
                </Text>
                <Text style={styles.tableHeader}>Morning</Text>
                <Text style={styles.tableHeader}>Evening</Text>
                <Text style={[styles.tableHeader]}>Total</Text>
              </View>

              {daysOfWeek.map((dayObj, index) => {
                const morningHours = parseFloat(dayObj.morning) || 0;
                const eveningHours = parseFloat(dayObj.evening) || 0;
                const totalHours = morningHours + eveningHours;

                totalMorning += morningHours;
                totalEvening += eveningHours;
                totalOverall += totalHours;

                return (
                  <View
                    key={index}
                    style={[
                      styles.tableRow,
                      {backgroundColor: index % 2 === 0 ? '#f1f1f1' : '#fff'},
                    ]}>
                    <Text style={[styles.tableCell, {flex: 1}]}>
                      {dayObj.day}
                    </Text>
                    <Text style={[styles.tableCell, {textAlign: 'center'}]}>
                      {morningHours.toFixed(2)}
                    </Text>
                    <Text style={[styles.tableCell, {textAlign: 'center'}]}>
                      {eveningHours.toFixed(2)}
                    </Text>
                    <Text style={[styles.tableCell, {textAlign: 'center'}]}>
                      {totalHours.toFixed(2)}
                    </Text>
                  </View>
                );
              })}

              <View style={styles.tableRow3}>
                <Text style={[styles.tableCell, {flex: 1, fontWeight: 'bold'}]}>
                  Total
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    {textAlign: 'center', fontWeight: 'bold'},
                  ]}>
                  {totalMorning.toFixed(2)}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    {textAlign: 'center', fontWeight: 'bold'},
                  ]}>
                  {totalEvening.toFixed(2)}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    {
                      textAlign: 'center',
                      fontWeight: 'bold',
                    },
                  ]}>
                  {totalOverall.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContentContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: p(8),
    padding: p(20),
    width: '90%',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalTitle: {
    fontSize: p(15),
    marginBottom: p(8),
    fontFamily: 'Rubik-Bold',
  },
  table: {
    width: '100%',
    borderBottomWidth: p(1),
    borderBottomColor: '#DDDDDD',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: p(9),
  },
  tableRow1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: p(9),

    backgroundColor: '#E97C1F',
    borderRadius: p(5),
    marginBottom: p(9),
  },
  tableRow3: {
    marginTop: p(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: p(9),
    backgroundColor: '#F5F5DB',
    borderRadius: p(9),
  },
  tableHeader: {
    fontSize: p(14),
    fontFamily: 'Rubik-regular',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginLeft: p(10),
  },
  tableCell: {
    fontSize: p(14),
    color: '#000',
    flex: 1,
    fontFamily: 'Rubik-regular',
  },
});
