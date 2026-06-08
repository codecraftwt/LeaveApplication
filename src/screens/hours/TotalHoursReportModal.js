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
  if (!modalVisible || (!overallHoursData || overallHoursData.length === 0)) {
    return (
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={closeModal}
        statusBarTranslucent={true}>
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <View style={styles.modalContentContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Total Hours Report</Text>
              <Text style={styles.errorText}>No data available</Text>
            </View>
          </View>
        </Pressable>
      </Modal>
    );
  }

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
        // Handle both API data structure and static data structure
        const morningHours = teamData[`${day}_morning_hours`] || teamData[day] || 0;
        const eveningHours = teamData[`${day}_evening_hours`] || 0;
        
        morningTotal += parseFloat(morningHours) || 0;
        eveningTotal += parseFloat(eveningHours) || 0;
      });
    } else {
      overallHoursData.forEach(teamData => {
        // Handle both API data structure and static data structure
        const morningHours = teamData[`${day}_morning_hours`] || teamData[day] || 0;
        const eveningHours = teamData[`${day}_evening_hours`] || 0;
        
        morningTotal += parseFloat(morningHours) || 0;
        eveningTotal += parseFloat(eveningHours) || 0;
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
      onRequestClose={closeModal}
      statusBarTranslucent={true}>
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
                <Text style={[styles.tableHeader, {flex: 1.4, textAlign: 'left', paddingLeft: p(10)}]}>
                  Day
                </Text>
                <Text style={styles.tableHeader}>Morning</Text>
                <Text style={styles.tableHeader}>Evening</Text>
                <Text style={styles.tableHeader}>Total</Text>
              </View>

              {aggregatedData.map((dayObj, idx) => (
                <View
                  key={`day-${idx}`}
                  style={[
                    styles.tableRow,
                    {backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'},
                  ]}>
                  <Text style={[styles.tableCell, {flex: 1.4, paddingLeft: p(10)}]}>
                    {dayObj.day.charAt(0).toUpperCase() + dayObj.day.slice(1)}
                  </Text>
                  <Text style={[styles.tableCell, {textAlign: 'center'}]}>
                    {dayObj.morning}
                  </Text>
                  <Text style={[styles.tableCell, {textAlign: 'center'}]}>
                    {dayObj.evening}
                  </Text>
                  <Text style={[styles.tableCell, {textAlign: 'center', color: '#1E293B', fontFamily: 'Poppins-Bold'}]}>
                    {dayObj.total}
                  </Text>
                </View>
              ))}

              <View style={styles.tableRow3}>
                <Text style={[styles.tableCell, {flex: 1.4, paddingLeft: p(10), fontFamily: 'Poppins-Bold', color: '#1E293B'}]}>
                  Total
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    {textAlign: 'center', fontFamily: 'Poppins-Bold', color: '#1E293B'},
                  ]}>
                  {totalMorning.toFixed(2)}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    {textAlign: 'center', fontFamily: 'Poppins-Bold', color: '#1E293B'},
                  ]}>
                  {totalEvening.toFixed(2)}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    {textAlign: 'center', fontFamily: 'Poppins-Bold', color: '#1E293B'},
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
    borderRadius: p(16),
    padding: p(24),
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  modalContent: {
    width: '100%',
  },
  modalTitle: {
    fontSize: p(18),
    marginBottom: p(16),
    fontFamily: 'Poppins-Bold',
    color: '#1E293B',
  },
  table: {
    width: '100%',
    borderRadius: p(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: p(14),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tableRow1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: p(14),
    backgroundColor: '#3660f9',
  },
  tableRow3: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: p(14),
    backgroundColor: '#F8FAFC',
  },
  tableHeader: {
    fontSize: p(13),
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  tableCell: {
    fontSize: p(14),
    color: '#334155',
    flex: 1,
    fontFamily: 'Poppins-Medium',
  },
  errorText: {
    fontSize: p(14),
    fontFamily: 'Poppins-Medium',
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: p(10),
  },
});
