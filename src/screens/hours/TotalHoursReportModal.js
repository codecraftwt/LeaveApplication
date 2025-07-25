import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {p} from '../../utils/Responsive';

export const TotalHoursReportModal = ({
  modalVisible,
  overallHoursData,
  closeModal,
  selectedTeam,
  selectedOfficeTeam,
}) => {
  if (!overallHoursData || overallHoursData.length === 0) return null;
  let totalMorning = 0;
  let totalEvening = 0;
  let totalOverall = 0;

  

  const daysOfWeek = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  const aggregatedData = daysOfWeek.map(day => {
    let morningTotal = 0;
    let eveningTotal = 0;

    if (selectedOfficeTeam) {
      selectedOfficeTeam.forEach(teamData => {
        morningTotal += parseFloat(teamData[`${day}_morning_hours`]) || 0;
        eveningTotal += parseFloat(teamData[`${day}_evening_hours`]) || 0;
      });
    } else {
      overallHoursData.forEach(teamData => {
        morningTotal += parseFloat(teamData[`${day}_morning_hours`]) || 0;
        eveningTotal += parseFloat(teamData[`${day}_evening_hours`]) || 0;
      });
    }
    totalMorning += morningTotal;
    totalEvening += eveningTotal;
    totalOverall += morningTotal + eveningTotal;

    return {
      day,
      morning: morningTotal.toFixed(2),
      evening: eveningTotal.toFixed(2),
      total: (morningTotal + eveningTotal).toFixed(2),
    };
  });

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
              {selectedOfficeTeam
                ? 'Branch Total Hours Report'
                : 'Grand Total Hours Report'}
            </Text>
            <View style={styles.table}>
              <View style={styles.tableRow1}>
                <Text style={[styles.tableHeader, {textAlign: 'left'}]}>
                  Day
                </Text>
                <Text style={styles.tableHeader}>Morning</Text>
                <Text style={styles.tableHeader}>Evening</Text>
                <Text style={styles.tableHeader}>Total</Text>
              </View>

              {aggregatedData.map((dayObj, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.tableRow,
                    {backgroundColor: idx % 2 === 0 ? '#f1f1f1' : '#fff'},
                  ]}>
                  <Text style={[styles.tableCell, {flex: 1}]}>
                    {dayObj.day.charAt(0).toUpperCase() + dayObj.day.slice(1)}
                  </Text>
                  <Text style={[styles.tableCell, {textAlign: 'center'}]}>
                    {dayObj.morning}
                  </Text>
                  <Text style={[styles.tableCell, {textAlign: 'center'}]}>
                    {dayObj.evening}
                  </Text>
                  <Text style={[styles.tableCell, {textAlign: 'center'}]}>
                    {dayObj.total}
                  </Text>
                </View>
              ))}

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
                    {textAlign: 'center', fontWeight: 'bold'},
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
