import React, {useEffect, useState, useMemo} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {Dropdown} from 'react-native-element-dropdown';
import {p} from '../../utils/Responsive';
// import {HoursReportModal} from './HoursReportModal';
import {useFocusEffect} from '@react-navigation/native';
// import {TotalHoursReportModal} from './TotalHoursReportModal';
import {RefreshControl} from 'react-native';
import { getHoursReport, getOfficeList } from '../../redux/slices/officelistSlice';
import { HoursReportModal } from './HoursReportModal';
import { TotalHoursReportModal } from './TotalHoursReportModal';

const getCurrentWeek = () => {
  const date = new Date();
  const year = date.getFullYear();
  const startDate = new Date(year, 3, 1);
  if (date < startDate) {
    startDate.setFullYear(year - 1);
  }
  const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + 1) / 7);
};
const getWeekRange = (weekNumber, currentYear) => {
  let startYear = currentYear;

  // Start date should be March 31
  const startDate = new Date(currentYear, 2, 31); // March is 2 (0-based month index)

  // If today's date is before March 31 of currentYear, shift back to previous year
  if (new Date() < startDate) {
    startYear -= 1;
  }

  const daysToAdd = (weekNumber - 1) * 7;
  const weekStartDate = new Date(
    new Date(startYear, 2, 31).getTime() + daysToAdd * 24 * 60 * 60 * 1000,
  );
  const weekEndDate = new Date(
    weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000,
  );

  const startFormatted = `${weekStartDate
    .getDate()
    .toString()
    .padStart(2, '0')}-${(weekStartDate.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${weekStartDate.getFullYear()}`;
  const endFormatted = `${weekEndDate.getDate().toString().padStart(2, '0')}-${(
    weekEndDate.getMonth() + 1
  )
    .toString()
    .padStart(2, '0')}-${weekEndDate.getFullYear()}`;

  return `${startFormatted} to ${endFormatted}`;
};

export default function HoursReport() {
  const currentWeek = getCurrentWeek();
  const dispatch = useDispatch();
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [totalHoursModalVisible, SetTotalHoursModalVisible] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(`${currentWeek}`);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [selectedOfficeTeam, setSelectedOfficeTeam] = useState(null);
  const isBeforeCurrentWeek = selectedWeek < currentWeek;
  const [refreshing, setRefreshing] = useState(false);

  // const token = useSelector(state => state?.user?.data?.data?.token);
  const overallHoursData = useSelector(
    state => state?.hoursReport?.data?.data,
  );
  const officeData2 = useSelector(state => state?.officeList?.data?.data);

  const officeDataa = useMemo(() => {
    return (
      officeData2?.map(item => ({
        label: item.name,
        value: item.id,
      })) || []
    );
  }, [officeData2]);

  const year = new Date().getFullYear();
  const financialYearStart = new Date(year, 3, 1);
  const financialYear = new Date() < financialYearStart ? year - 1 : year;
  const financialYearString = `${financialYear}-${financialYear + 1}`;

  const WeekData = useMemo(() => {
    return Array.from({length: 52}, (_, i) => {
      const weekNumber = i + 1;
      const weekRange = getWeekRange(weekNumber, 2025); // financial year 2025–2026
      return {
        label: `Week ${weekNumber} (${weekRange})`,
        value: `${weekNumber}`,
      };
    });
  }, []);

  const DayData = useMemo(() => {
    const daysOfWeek = [
      {label: 'Monday', value: 'monday'},
      {label: 'Tuesday', value: 'tuesday'},
      {label: 'Wednesday', value: 'wednesday'},
      {label: 'Thursday', value: 'thursday'},
      {label: 'Friday', value: 'friday'},
      {label: 'Saturday', value: 'saturday'},
      {label: 'Sunday', value: 'sunday'},
    ];

    return daysOfWeek;
  }, []);

  useEffect(() => {
            dispatch(getOfficeList());
    
  }, [dispatch]);

  useEffect(() => {
    if ( selectedWeek !== null) {
      dispatch(
        getHoursReport(
          selectedWeek,
          selectedOffice,
          financialYearString,
       
        ),
      );
    }
  }, [dispatch, selectedWeek, selectedOffice, financialYearString]);
  const stableCurrentWeek = useMemo(() => currentWeek, [currentWeek]);

  useFocusEffect(
    React.useCallback(() => {
      setSelectedWeek(`${stableCurrentWeek}`);
      dispatch(
        getHoursReport(stableCurrentWeek, null, financialYearString),
      );
    }, [stableCurrentWeek, dispatch, financialYearString]),
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setSelectedWeek(`${stableCurrentWeek}`);
    dispatch(
      getHoursReport(stableCurrentWeek, null, financialYearString),
    );

    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [stableCurrentWeek, dispatch, financialYearString]);

  const groupByOffice = () => {
    if (!overallHoursData) return {};

    return overallHoursData.reduce((acc, team) => {
      const officeName = team.office_name;
      if (!acc[officeName]) {
        acc[officeName] = [];
      }
      acc[officeName].push(team);
      return acc;
    }, {});
  };

  const groupedTeams = useMemo(() => groupByOffice(), [overallHoursData]);
  const calculateGrandTotal = () => {
    let grandTotal = 0;
    Object.keys(groupedTeams).forEach(officeName => {
      const officeTotal = groupedTeams[officeName]
        .filter(team => team?.name !== 'Branch Total')
        .reduce((sum, team) => sum + parseFloat(team?.total_hours || 0), 0);
      grandTotal += officeTotal;
    });
    return grandTotal.toFixed(2);
  };

  const calculateTodaysGrandTotal = () => {
    let grandTotal = 0;
    Object.keys(groupedTeams).forEach(officeName => {
      const officeTotal = groupedTeams[officeName]
        .filter(team => team?.name !== 'Branch Total')
        .reduce(
          (sum, team) => sum + parseFloat(team?.total_todays_hours || 0),
          0,
        );
      grandTotal += officeTotal;
    });
    return grandTotal.toFixed(2);
  };

  const grandTotal = useMemo(() => calculateGrandTotal(), [groupedTeams]);
  const TodaysGrandTotal = useMemo(
    () => calculateTodaysGrandTotal(),
    [groupedTeams],
  );

  const handleRowPress = team => {
    setSelectedTeam(team);
    setModalVisible(true);
  };

  const handleTotalRowPress = officeName => {
    console.log('Selected Office:', officeName);
    const officeTeams = groupedTeams[officeName];

    if (!officeTeams) {
      console.warn(`No data found for office: ${officeName}`);
      return;
    }

    setSelectedOfficeTeam(officeTeams);
    SetTotalHoursModalVisible(true);
  };

  const handleGrandTotalRowPress = () => {
    setSelectedOfficeTeam(null);
    SetTotalHoursModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    SetTotalHoursModalVisible(false);
    setSelectedTeam(null);
    setSelectedOfficeTeam(null);
  };
  return (
    <View style={styles.main}>
      <View style={styles.sub}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <Text style={styles.title}>Offices Hours Report</Text>

          <View style={styles.dropdownContainer}>
            <View style={styles.dropdownRow}>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View>
                  <Text style={styles.dropdownLabel}>Office</Text>
                </View>
                {(selectedOffice !== null ||
                  selectedWeek !== `${currentWeek}`) && (
                  <View style={styles.ClearFilter}>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedOffice(null);
                        setSelectedWeek(`${currentWeek}`); // Set current week
                      }}
                      style={styles.clearFilterButton}>
                      <Text style={styles.clearFilterText}>Clear</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <Dropdown
                style={styles.inputDrop}
                data={officeDataa}
                labelField="label"
                valueField="value"
                placeholder="Select office"
                value={selectedOffice}
                onChange={item => setSelectedOffice(item.value)}
                selectedTextStyle={styles.selectedTextStyle}
                containerStyle={styles.dropContainerStyle}
                itemTextStyle={styles.itemTextStyle}
                placeholderStyle={styles.placeholderStyle}
                search
                searchPlaceholder="Search office"
                searchStyle={styles.searchStyle}
              />
            </View>
            <View style={styles.dropdownRow}>
              <Text style={styles.dropdownLabel}>Week</Text>
              <Dropdown
                style={styles.inputDrop}
                data={WeekData}
                labelField="label"
                valueField="value"
                placeholder="Select Week"
                value={selectedWeek}
                onChange={item => setSelectedWeek(item.value)}
                selectedTextStyle={styles.selectedTextStyle}
                containerStyle={styles.dropContainerStyle}
                itemTextStyle={styles.itemTextStyle}
                placeholderStyle={styles.placeholderStyle}
                search
                searchPlaceholder="Search Week"
                searchStyle={styles.searchStyle}
                renderItem={(item, selected) => (
                  <View
                    style={[
                      styles.itemContainer,
                      selected && styles.selectedItemContainer,
                    ]}>
                    <Text
                      style={
                        selected ? styles.selectedItemText : styles.itemText
                      }>
                      {item.label}
                    </Text>
                  </View>
                )}
              />
            </View>
          </View>
          {Object.keys(groupedTeams).map((officeName, index) => (
            <View key={index} style={{marginBottom: 20}}>
              <View style={styles.reportContainer}>
                <View style={styles.officeView}>
                  <Text style={styles.officeTitle}>{officeName}</Text>
                </View>

                <View style={[styles.reportHeader, {flexDirection: 'row'}]}>
                  <Text
                    style={[
                      styles.reportHeaderText,
                      {
                        flex: 1,
                        textAlign: 'center',
                        borderRightWidth: 1,
                        borderRightColor: '#fff',
                      },
                    ]}>
                    Team
                  </Text>
                  {!isBeforeCurrentWeek && (
                    <Text
                      style={[
                        styles.reportHeaderText,
                        {
                          flex: 1,
                          textAlign: 'center',
                          borderRightWidth: 1,
                          borderRightColor: '#fff',
                        },
                      ]}>
                      Today's Hours
                    </Text>
                  )}
                  <Text
                    style={[
                      styles.reportHeaderText,
                      {
                        flex: 1,
                        textAlign: 'center',
                      },
                    ]}>
                    Weekly Hours
                  </Text>
                </View>

                {groupedTeams[officeName]?.map((team, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.teamReportRow,
                      {
                        flexDirection: 'row',
                        borderBottomWidth: p(1),
                        borderBottomColor: '#fff',
                        backgroundColor: idx % 2 === 0 ? '#F1F1F1' : '#FFFFFF',
                      },
                      team.name === 'Branch Total' && styles.branchTotalRow,
                      team.name === 'Global Total' && styles.globalTotalRow,
                    ]}
                    onPress={() => handleRowPress(team)}>
                    <View
                      style={[
                        styles.reportColumn,
                        {
                          flex: 1,
                          borderRightWidth: p(1),
                          borderRightColor: '#fff',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.teamReportNameText,
                          {
                            textAlign: 'center',
                          },
                        ]}>
                        {team?.team_name}
                      </Text>
                    </View>

                    {/* Conditionally render Today's Hours column */}
                    {!isBeforeCurrentWeek && (
                      <View
                        style={[
                          styles.reportColumn,
                          {
                            flex: 1,
                            borderRightWidth: p(1),
                            borderRightColor: '#fff',
                          },
                        ]}>
                        <Text
                          style={[
                            styles.teamReportTotalText,
                            {
                              textAlign: 'center',
                            },
                          ]}>
                          {team?.total_todays_hours || 0}
                        </Text>
                      </View>
                    )}

                    <View
                      style={[
                        styles.reportColumn,
                        {
                          flex: 1,
                          borderRightWidth: p(1),
                          borderRightColor: '#fff',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.teamReportTotalText,
                          {
                            textAlign: 'center',
                          },
                        ]}>
                        {team?.total_hours}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={[
                    styles.reportRow,
                    {
                      flexDirection: 'row',
                      backgroundColor: '#F5F5DB',
                    },
                  ]}
                  onPress={() => handleTotalRowPress(officeName)}>
                  <View
                    style={[
                      {
                        flex: 1,
                        borderRightWidth: p(1),
                        borderRightColor: '#fff',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.branchReportText,
                        {
                          textAlign: 'center',
                        },
                      ]}>
                      Branch Total
                    </Text>
                  </View>

                  {/* Conditionally remove Today's Hours total */}
                  {!isBeforeCurrentWeek && (
                    <View
                      style={[
                        styles.reportColumn,
                        {
                          flex: 1,
                          borderRightWidth: p(1),
                          borderRightColor: '#fff',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.branchReporttotalText,
                          {
                            textAlign: 'center',
                          },
                        ]}>
                        {groupedTeams[officeName]
                          ?.filter(team => team?.name !== 'Branch Total')
                          .reduce(
                            (sum, team) =>
                              sum + parseFloat(team?.total_todays_hours || 0),
                            0,
                          )
                          .toFixed(2)}
                      </Text>
                    </View>
                  )}

                  <View
                    style={[
                      styles.reportColumn,
                      {
                        flex: 1,
                        borderRightWidth: p(1),
                        borderRightColor: '#fff',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.branchReporttotalText,
                        {
                          textAlign: 'center',
                        },
                      ]}>
                      {groupedTeams[officeName]
                        ?.filter(team => team?.name !== 'Branch Total')
                        .reduce(
                          (sum, team) =>
                            sum + parseFloat(team?.total_hours || 0),
                          0,
                        )
                        .toFixed(2)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity onPress={() => handleGrandTotalRowPress()}>
            <View style={styles.grandContainer}>
              <Text
                style={[
                  styles.reportHeaderText,
                  {
                    flex: 1,
                    textAlign: 'center',
                    borderRightWidth: p(1),
                    borderRightColor: '#fff',
                  },
                ]}>
                Grand Total
              </Text>
              {!isBeforeCurrentWeek && (
                <Text
                  style={[
                    styles.reportHeaderText,
                    {
                      flex: 1,
                      textAlign: 'center',
                      borderRightWidth: p(1),
                      borderRightColor: '#fff',
                    },
                  ]}>
                  {TodaysGrandTotal}
                </Text>
              )}
              <Text
                style={[
                  styles.reportHeaderText,
                  {
                    flex: 1,
                    textAlign: 'center',
                  },
                ]}>
                {grandTotal}
              </Text>
            </View>
          </TouchableOpacity>

            <HoursReportModal
            selectedTeam={selectedTeam}
            modalVisible={modalVisible}
            selectedWeek={selectedWeek}
            overallHoursData={overallHoursData}
            closeModal={closeModal}
          /> 

          <TotalHoursReportModal
            selectedOfficeTeam={selectedOfficeTeam}
            groupedTeams={groupedTeams}
            modalVisible={totalHoursModalVisible}
            overallHoursData={overallHoursData}
            closeModal={closeModal}
          /> 
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#3660f9',
  },
  sub: {
    flex: 1,
    padding: p(20),
    backgroundColor: '#ffffff',
    borderTopLeftRadius: p(30),
    borderTopRightRadius: p(30),
  },
  title: {
    fontSize: p(16),
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: p(24),
    color: '#000',
  },
  dropdownContainer: {
    marginBottom: p(20),
  },
  dropdownRow: {
    marginBottom: p(15),
  },
  dropdownLabel: {
    fontSize: p(16),
    fontFamily: 'Rubik-Regular',
    marginBottom: p(10),
    color: '#000',
    fontWeight: 600,
  },
  dropdownButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: p(8),
    borderWidth: 1,
    borderColor: '#DDDDDD',
    paddingHorizontal: p(15),
    paddingVertical: p(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButtonText: {
    color: '#333',
    fontSize: p(16),
  },
  dropdownArrow: {
    fontSize: p(18),
    color: '#333',
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: p(1),
    borderBottomColor: '#DDDDDD',
  },
  dropdownItemSelected: {
    backgroundColor: '#E0E0E0',
  },
  dropdownItemText: {
    fontSize: p(16),
    color: '#333',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: p(8),
    borderWidth: p(1),
    borderColor: '#DDDDDD',
    marginTop: p(5),
  },
  reportContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: p(15),
  },
  grandContainer: {
    backgroundColor: '#3660F9',
    borderRadius: p(8),
    padding: 15,
    borderWidth: p(1),
    borderColor: '#DDDDDD',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: p(10),
    borderBottomWidth: 1,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: '#DDDDDD',
    paddingVertical: p(10),
    marginBottom: p(5),
    backgroundColor: '#E97C1F',
    borderRadius: p(5),
  },
  reportHeaderText: {
    fontSize: p(14),
    fontFamily: 'Rubik-Regular',
    color: '#fff',
  },
  teamReportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: p(10),
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: p(10),
  },

  branchTotalRow: {},
  globalTotalRow: {},
  inputDrop: {
    paddingVertical: p(15),
    paddingHorizontal: p(10),
    backgroundColor: '#f7f7f7',
    borderRadius: p(10),
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
  },
  selectedTextStyle: {
    color: '#4D4D4D',
    // backgroundColor:"#FFFFE0",
  },
  dropContainerStyle: {
    borderColor: '#4D4D4D',

    borderRadius: p(15),
    borderWidth: p(2),
  },
  itemTextStyle: {
    color: '#4D4D4D',
    fontWeight: '400',
  },
  placeholderStyle: {
    color: '#999',
  },
  searchStyle: {
    color: '#4D4D4D',
    fontWeight: '600',
    fontFamily: 'Montserrat-Bold',
  },
  officeTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: p(18),
    fontWeight: 600,
    color: '#333333',
  },
  teamReportTotalText: {
    fontSize: p(14),
    color: '#000',
  },
  teamReportNameText: {
    fontSize: p(13),
    color: '#000',
    fontFamily: 'Rubik-Regular',
  },
  branchReporttotalText: {
    color: '#000000',
    fontSize: p(14),
    fontFamily: 'Rubik-Regular',
  },
  branchReportText: {
    color: '#000',
    fontSize: p(14),
    fontFamily: 'Rubik-Regular',
  },
  grandReportText: {
    fontWeight: 'bold',
    color: '#000000',
    fontSize: p(16),
  },
  officeView: {
    marginBottom: p(10),
    backgroundColor: '#D3D3D3',
    alignItems: 'center',
    paddingVertical: p(7),
    borderRadius: p(8),
  },
  officeTitle: {
    fontSize: p(16),
    color: '#333',
    fontFamily: 'Rubik-Regular',
  },
  itemContainer: {
    padding: 10,
    backgroundColor: 'white',
  },
  selectedItemContainer: {
    backgroundColor: '#3660f9',
    color: '#fff',
  },
  itemText: {
    color: '#3f3f3f',
    fontSize: 16,
    fontFamily: 'Rubik-Regular',
  },
  selectedItemText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  ClearFilter: {
    marginBottom: p(10),
    backgroundColor: '#e74c3c',
    borderRadius: p(5),
    paddingVertical: 3,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearFilterText: {
    color: '#fff',
    fontSize: p(14),
    fontFamily: 'Rubik-Regular',
  },
});
