import React, {useEffect, useState, useMemo} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {getOfficeList, getHoursReport} from '../../redux/slices/officelistSlice';
import {Dropdown} from 'react-native-element-dropdown';
import {
  p
} from '../../utils/Responsive';
import {HoursReportModal} from './HoursReportModal';
import {useFocusEffect} from '@react-navigation/native';
import {TotalHoursReportModal} from './TotalHoursReportModal';
import {RefreshControl} from 'react-native';

const getFinancialYearStartDate = (date) => {
  const year = date.getFullYear();
  return date.getMonth() < 3 ? year - 1 : year;
};

const getWeek1StartDate = (financialYear) => {
  // Financial year starts April 1st
  const april1 = new Date(financialYear, 3, 1);
  const day = april1.getDay(); // 0 = Sunday, 1 = Monday
  const diff = day === 0 ? -6 : 1 - day; // Go back to Monday
  return new Date(april1.getFullYear(), april1.getMonth(), april1.getDate() + diff);
};

const getCurrentWeek = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const financialYear = getFinancialYearStartDate(today);
  const week1Start = getWeek1StartDate(financialYear);
  
  // Use Math.round to safely avoid DST issues off-by-1-hour leading to off-by-1-day
  let diffDays = Math.round((today - week1Start) / (24 * 60 * 60 * 1000));
  
  if (diffDays < 0) {
    const prevWeek1 = getWeek1StartDate(financialYear - 1);
    diffDays = Math.round((today - prevWeek1) / (24 * 60 * 60 * 1000));
  }
  
  return Math.floor(diffDays / 7) + 1;
};

const getWeekRange = (weekNumber, financialYear) => {
  const week1Start = getWeek1StartDate(financialYear);
  
  const weekStartDate = new Date(week1Start.getFullYear(), week1Start.getMonth(), week1Start.getDate() + (weekNumber - 1) * 7);
  const weekEndDate = new Date(weekStartDate.getFullYear(), weekStartDate.getMonth(), weekStartDate.getDate() + 6);
  
  const format = (d) => {
    const dd = d.getDate().toString().padStart(2, '0');
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };
  
  return `${format(weekStartDate)} to ${format(weekEndDate)}`;
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

  // Redux selectors
  const {officeList, officeListLoading, officeListError} = useSelector(
    state => state.officeList,
  );
  const {hoursReport, hoursReportLoading, hoursReportError} = useSelector(
    state => state.officeList,
  );

  // Use Redux data instead of static data
  // Fix: API returns data directly, not nested under .data
  const overallHoursData = hoursReport || [];
  const officeData2 = officeList || [];

  // Debug logs


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
      const weekRange = getWeekRange(weekNumber, financialYear); // dynamically use current financial year
      return {
        label: `Week ${weekNumber} (${weekRange})`,
        value: `${weekNumber}`,
      };
    });
  }, [financialYear]);

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

  // Load office list on component mount
  useEffect(() => {
    dispatch(getOfficeList());
  }, [dispatch]);

  // Load hours report when week or office changes
  useEffect(() => {
    if (selectedWeek) {
      dispatch(
        getHoursReport({
          selectedWeek,
          selectedOffice,
          financialYear: financialYearString,
        }),
      );
    }
  }, [dispatch, selectedWeek, selectedOffice, financialYearString]);

  const stableCurrentWeek = useMemo(() => currentWeek, [currentWeek]);

  useFocusEffect(
    React.useCallback(() => {
      setSelectedWeek(`${stableCurrentWeek}`);
      dispatch(
        getHoursReport({
          selectedWeek: stableCurrentWeek,
          selectedOffice: null,
          financialYear: financialYearString,
        }),
      );
    }, [stableCurrentWeek, dispatch, financialYearString]),
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setSelectedWeek(`${stableCurrentWeek}`);
    dispatch(
      getHoursReport({
        selectedWeek: stableCurrentWeek,
        selectedOffice: null,
        financialYear: financialYearString,
      }),
    );

    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [stableCurrentWeek, dispatch, financialYearString]);

  const groupByOffice = () => {
    if (!overallHoursData) return {};


    const grouped = overallHoursData.reduce((acc, team) => {
      const officeName = team.office_name;
      if (!acc[officeName]) {
        acc[officeName] = [];
      }
      acc[officeName].push(team);
      return acc;
    }, {});

    return grouped;
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

  
  if (officeListLoading || hoursReportLoading) {
    return (
      <View style={styles.main}>
        <View style={styles.sub}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3660f9" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </View>
      </View>
    );
  }

  // Show error state
  if (officeListError || hoursReportError) {
    return (
      <View style={styles.main}>
        <View style={styles.sub}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {officeListError || hoursReportError}
            </Text>
          </View>
        </View>
      </View>
    );
  }

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
          {Object.keys(groupedTeams).map((officeName, index) => {
            return (
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
                          borderRightColor: '#4F75FF',
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
                            borderRightColor: '#4F75FF',
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
                          backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                          borderBottomWidth: 1,
                          borderBottomColor: '#F1F5F9',
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
                            borderRightWidth: 1,
                            borderRightColor: '#F1F5F9',
                            justifyContent: 'center',
                            paddingHorizontal: p(4),
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
                              borderRightWidth: 1,
                              borderRightColor: '#F1F5F9',
                              justifyContent: 'center',
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
                            justifyContent: 'center',
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
                        backgroundColor: '#FFF5EC',
                      },
                    ]}
                    onPress={() => handleTotalRowPress(officeName)}>
                    <View
                      style={[
                        {
                          flex: 1,
                          borderRightWidth: 1,
                          borderRightColor: '#FFE4CC',
                          justifyContent: 'center',
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
                            borderRightWidth: 1,
                            borderRightColor: '#FFE4CC',
                            justifyContent: 'center',
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
                          justifyContent: 'center',
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
            );
          })}

          <TouchableOpacity onPress={() => handleGrandTotalRowPress()}>
            <View style={styles.grandContainer}>
              <Text
                style={[
                  styles.grandTotalText,
                  {
                    flex: 1,
                    textAlign: 'center',
                    borderRightWidth: 1,
                    borderRightColor: '#334155',
                  },
                ]}>
                Grand Total
              </Text>
              {!isBeforeCurrentWeek && (
                <Text
                  style={[
                    styles.grandTotalValue,
                    {
                      flex: 1,
                      textAlign: 'center',
                      borderRightWidth: 1,
                      borderRightColor: '#334155',
                    },
                  ]}>
                  {TodaysGrandTotal}
                </Text>
              )}
              <Text
                style={[
                  styles.grandTotalValue,
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
    backgroundColor: '#F8FAFC',
  },
  sub: {
    flex: 1,
    paddingHorizontal: p(16),
    paddingTop: p(10),
  },
  title: {
    fontSize: p(20),
    fontFamily: 'Poppins-Bold',
    marginBottom: p(20),
    color: '#1E293B',
  },
  dropdownContainer: {
    marginBottom: p(20),
  },
  dropdownRow: {
    marginBottom: p(16),
  },
  dropdownLabel: {
    fontSize: p(14),
    fontFamily: 'Poppins-SemiBold',
    marginBottom: p(8),
    color: '#1E293B',
  },
  reportContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: p(16),
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  grandContainer: {
    backgroundColor: '#1E293B',
    borderRadius: p(16),
    padding: p(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: p(40),
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#3660f9',
    paddingVertical: p(12),
  },
  reportHeaderText: {
    fontSize: p(12),
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  grandTotalText: {
    fontSize: p(15),
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  grandTotalValue: {
    fontSize: p(15),
    fontFamily: 'Poppins-Bold',
    color: '#38BDF8',
  },
  teamReportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: p(14),
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: p(14),
  },
  branchTotalRow: {},
  globalTotalRow: {},
  inputDrop: {
    paddingVertical: p(12),
    paddingHorizontal: p(16),
    backgroundColor: '#FFFFFF',
    borderRadius: p(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  selectedTextStyle: {
    color: '#1E293B',
    fontFamily: 'Poppins-Medium',
    fontSize: p(15),
  },
  dropContainerStyle: {
    borderColor: '#E2E8F0',
    borderRadius: p(12),
    borderWidth: 1,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  itemTextStyle: {
    color: '#334155',
    fontFamily: 'Poppins-Medium',
    fontSize: p(15),
  },
  placeholderStyle: {
    color: '#94A3B8',
    fontFamily: 'Poppins-Medium',
    fontSize: p(15),
  },
  searchStyle: {
    color: '#1E293B',
    fontFamily: 'Poppins-Medium',
    fontSize: p(15),
  },
  officeView: {
    paddingHorizontal: p(16),
    paddingVertical: p(14),
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  officeTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: p(15),
    color: '#1E293B',
    textTransform: 'uppercase',
  },
  teamReportTotalText: {
    fontSize: p(14),
    fontFamily: 'Poppins-Medium',
    color: '#1E293B',
  },
  teamReportNameText: {
    fontSize: p(13),
    fontFamily: 'Poppins-Medium',
    color: '#475569',
  },
  branchReportText: {
    fontSize: p(14),
    fontFamily: 'Poppins-Bold',
    color: '#E97C1F',
  },
  branchReporttotalText: {
    fontSize: p(14),
    fontFamily: 'Poppins-Bold',
    color: '#E97C1F',
  },
  ClearFilter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearFilterButton: {
    backgroundColor: '#FFF5EC',
    paddingHorizontal: p(12),
    paddingVertical: p(6),
    borderRadius: p(8),
  },
  clearFilterText: {
    color: '#E97C1F',
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(13),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: p(10),
    fontSize: p(16),
    fontFamily: 'Poppins-Medium',
    color: '#334155',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  errorText: {
    fontSize: p(16),
    fontFamily: 'Poppins-Medium',
    color: '#e74c3c',
    textAlign: 'center',
  },
  itemContainer: {
    padding: 10,
    backgroundColor: 'white',
  },
  selectedItemContainer: {
    backgroundColor: '#3660f9',
  },
  itemText: {
    color: '#3f3f3f',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  selectedItemText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  debugContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: p(10),
    padding: p(15),
    marginBottom: p(20),
    borderWidth: 1,
    borderColor: '#ccc',
  },
  debugText: {
    fontSize: p(14),
    color: '#333',
    marginBottom: p(5),
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: p(20),
    backgroundColor: '#f0f0f0',
    borderRadius: p(10),
    marginTop: p(20),
  },
  noDataText: {
    fontSize: p(16),
    color: '#555',
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
  },
});
