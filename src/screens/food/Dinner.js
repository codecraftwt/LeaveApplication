import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { p } from '../../utils/Responsive';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from 'react-native-toast-notifications';
import { useIsFocused } from '@react-navigation/native';
import {
  getTodayMenu,
  getTodaysSelectedDinner,
  storeDinnerCount,
  clearErrors,
  clearStoreResult,
} from '../../redux/slices/dinnerSlice';

export default function Dinner() {
  const dispatch = useDispatch();
  const toast = useToast();
  const isFocused = useIsFocused();
  const {
    todayMenuLoading: loading,
    storeDinnerLoading: storeLoading,
    todayMenu: data,
    todayMenuError: error,
    storeDinnerError: storeError,
    todaysSelectedDinner,
    todaysSelectedDinnerLoading,
    todaysSelectedDinnerError,
    storeDinnerResult
  } = useSelector(state => state.dinner);

  // Local UI state for immediate feedback
  const [localSelection, setLocalSelection] = useState({
    veg: false,
    nonVeg: false
  });
  const [isPastDeadline, setIsPastDeadline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearErrors());
    dispatch(clearStoreResult());
  }, [dispatch]);

  // Initialize local state from Redux store
  useEffect(() => {
    if (!loading && !todaysSelectedDinnerLoading) {
      let vegState = false;
      let nonVegState = false;
      
      console.log('Updating local state from Redux data:', {
        todaysSelectedDinner,
        data
      });
      
      // Prioritize todaysSelectedDinner if available
      if (todaysSelectedDinner?.status && todaysSelectedDinner?.data) {
        const mealType = todaysSelectedDinner.data.meal_type;
        console.log('Using todaysSelectedDinner meal_type:', mealType);
        
        if (mealType === 'veg') {
          vegState = true;
        } else if (mealType === 'non_veg') {
          nonVegState = true;
        } else if (mealType.includes('veg') && mealType.includes('non_veg')) {
          vegState = true;
          nonVegState = true;
        }
      } 
      // Fallback to getTodayMenu data
      else if (data) {
        console.log('Using getTodayMenu data for state update');
        
        if (data.veg !== undefined && data.non_veg !== undefined) {
          vegState = Boolean(data.veg);
          nonVegState = Boolean(data.non_veg);
        } else if (data.user_selection || data.selected_meal_type || data.meal_preference) {
          const userSelection = data.user_selection || data.selected_meal_type || data.meal_preference;
          
          if (typeof userSelection === 'string') {
            if (userSelection.includes('veg') && userSelection.includes('non_veg')) {
              vegState = true;
              nonVegState = true;
            } else if (userSelection.includes('veg')) {
              vegState = true;
            } else if (userSelection.includes('non_veg')) {
              nonVegState = true;
            }
          } else if (typeof userSelection === 'object') {
            vegState = Boolean(userSelection.veg);
            nonVegState = Boolean(userSelection.non_veg);
          }
        }
      }
      
      console.log('Setting local state to:', { veg: vegState, nonVeg: nonVegState });
      
      setLocalSelection({
        veg: vegState,
        nonVeg: nonVegState
      });
    }
  }, [loading, todaysSelectedDinnerLoading, data, todaysSelectedDinner]);

  const { veg, nonVeg } = localSelection;

  useEffect(() => {
    if (isFocused) {
      console.log('Dinner screen focused, fetching fresh data...');
      dispatch(getTodayMenu());
      dispatch(getTodaysSelectedDinner());
    }
  }, [dispatch, isFocused]);

  // Add debugging for data changes
  useEffect(() => {
    console.log('Dinner data updated:', {
      todayMenu: data,
      todaysSelectedDinner,
      loading,
      todaysSelectedDinnerLoading,
      error,
      todaysSelectedDinnerError
    });
  }, [data, todaysSelectedDinner, loading, todaysSelectedDinnerLoading, error, todaysSelectedDinnerError]);

  // Watch for store result changes and refresh data
  useEffect(() => {
    if (storeDinnerResult && !storeLoading) {
      console.log('Store result changed, refreshing data...');
      // Refresh data after successful store operation
      dispatch(getTodaysSelectedDinner());
      dispatch(getTodayMenu());
    }
  }, [storeDinnerResult, storeLoading, dispatch]);

  // Check if it's past 4 PM
  useEffect(() => {
    const checkDeadline = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Check if it's past 4 PM (16:00)
      const isPast = currentHour > 16 || (currentHour === 16 && currentMinute > 0);
      setIsPastDeadline(isPast);
    };

    checkDeadline();
    const interval = setInterval(checkDeadline, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(getTodayMenu()),
        dispatch(getTodaysSelectedDinner())
      ]);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleVegSelection = async () => {
    if (isPastDeadline) {
      toast.show('Dinner selection deadline has passed (4 PM)', {
        type: 'warning',
        placement: 'bottom',
      });
      return;
    }

    // Calculate new state based on meal type
    let newVeg, newNonVeg;

    if (data?.mealType === 'both') {
      // For both options, toggle veg and clear non-veg if veg was selected
      newVeg = !veg;
      newNonVeg = veg ? false : nonVeg;
    } else if (data?.mealType === 'veg') {
      // For veg only, toggle veg and ensure non-veg is false
      newVeg = !veg;
      newNonVeg = false;
    } else {
      // Default behavior: select veg, clear non-veg
      newVeg = true;
      newNonVeg = false;
    }

    try {
      const result = await dispatch(
        storeDinnerCount({
          selection: { veg: newVeg, non_veg: newNonVeg },
          food_id: data?.id,
        })
      ).unwrap();
      
      if (result) {
        toast.show('Dinner preference updated successfully!', {
          type: 'success',
          placement: 'bottom',
        });
      }
    } catch (error) {
      const errorMessage = error || 'Failed to update dinner preference';
      toast.show(errorMessage, {
        type: 'danger',
        placement: 'bottom',
      });
    }
  };

  const handleNonVegSelection = async () => {
    if (isPastDeadline) {
      toast.show('Dinner selection deadline has passed (4 PM)', {
        type: 'warning',
        placement: 'bottom',
      });
      return;
    }

    // Calculate new state based on meal type
    let newVeg, newNonVeg;

    if (data?.mealType === 'both') {
      // For both options, toggle non-veg and clear veg if non-veg was selected
      newNonVeg = !nonVeg;
      newVeg = nonVeg ? false : veg;
    } else if (data?.mealType === 'non_veg') {
      // For non-veg only, toggle non-veg and ensure veg is false
      newNonVeg = !nonVeg;
      newVeg = false;
    } else {
      // Default behavior: select non-veg, clear veg
      newNonVeg = true;
      newVeg = false;
    }

    try {
      const result = await dispatch(
        storeDinnerCount({
          selection: { veg: newVeg, non_veg: newNonVeg },
          food_id: data?.id,
        })
      ).unwrap();
      
      if (result) {
        toast.show('Dinner preference updated successfully!', {
          type: 'success',
          placement: 'bottom',
        });
      }
    } catch (error) {
      const errorMessage = error || 'Failed to update dinner preference';
      toast.show(errorMessage, {
        type: 'danger',
        placement: 'bottom',
      });
    }
  };

  // Determine which buttons to show based on meal type
  const showVegButton = 
    data?.mealType === 'veg' || 
    data?.mealType === 'both' || 
    data?.mealType === undefined;
  
  const showNonVegButton = 
    data?.mealType === 'non_veg' || 
    data?.mealType === 'both' || 
    data?.mealType === undefined;

  // Check if no selection is made
  const noSelection = !veg && !nonVeg;

  if (loading || todaysSelectedDinnerLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="#3660f9" barStyle="light-content" />
        <View style={styles.header}>
          <Icon
            name="restaurant"
            size={p(22)}
            color="#3660f9"
            style={{ marginRight: p(10) }}
          />
          <Text style={styles.title}>Daily Dinner Management</Text>
          <Icon
            name="restaurant"
            size={p(22)}
            color="#3660f9"
            style={{ marginLeft: p(10) }}
          />
        </View>
        <View style={[styles.card, styles.loadingCard]}>
          <ActivityIndicator size="large" color="#3660f9" />
          <Text style={styles.loadingText}>Loading today's menu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const errorMessage = typeof error === 'string' ? error : (error?.message || '');
  const isNoMenuError = errorMessage && (errorMessage.toLowerCase().includes('no menu') || errorMessage.includes('404'));

  // Show fallback if no data is available or if it's the "No menu found" error
  if (!data || isNoMenuError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="#3660f9" barStyle="light-content" />
        <View style={styles.header}>
          <Icon
            name="restaurant"
            size={p(22)}
            color="#3660f9"
            style={{ marginRight: p(10) }}
          />
          <Text style={styles.title}>Daily Dinner Management</Text>
          <Icon
            name="restaurant"
            size={p(22)}
            color="#3660f9"
            style={{ marginLeft: p(10) }}
          />
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={[styles.card, { flex: 1, justifyContent: 'center' }]}>
            <View style={styles.noDataContainer}>
              <View style={styles.iconCircle}>
                <Icon name="restaurant-menu" size={p(48)} color="#94A3B8" />
              </View>
              <Text style={styles.noDataText}>No Menu Available</Text>
              <Text style={styles.noDataSubtext}>
                {isNoMenuError ? error : 'Please check back later or contact HR'}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#3660f9" barStyle="light-content" />
      <View style={styles.header}>
        <Icon
          name="restaurant"
          size={p(22)}
          color="#3660f9"
          style={{ marginRight: p(10) }}
        />
        <Text style={styles.title}>Daily Dinner Management</Text>
        <Icon
          name="restaurant"
          size={p(22)}
          color="#3660f9"
          style={{ marginLeft: p(10) }}
        />
      </View>

      {/* Show store/selection errors below header but keep UI intact */}
      {(storeError || todaysSelectedDinnerError || (error && !isNoMenuError)) && (
        <View style={styles.inlineErrorContainer}>
          <Icon name="error-outline" size={p(18)} color="#E11D48" />
          <Text style={styles.inlineErrorText}>
            {storeError || todaysSelectedDinnerError || error}
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Today's Menu</Text>

              {/* Time and Deadline Status */}
              <View style={styles.timeContainer}>
                <View style={styles.deadlineRow}>
                  <Icon
                    name={isPastDeadline ? 'schedule' : 'check-circle'}
                    size={p(16)}
                    color={isPastDeadline ? '#f44336' : '#4caf50'}
                  />
                  <Text
                    style={[
                      styles.deadlineText,
                      { color: isPastDeadline ? '#f44336' : '#4caf50' },
                    ]}
                  >
                    {isPastDeadline
                      ? 'Deadline Passed (4 PM)'
                      : 'Deadline: 4:00 PM'}
                  </Text>
                </View>
              </View>

              <View style={styles.menuBox}>
                <Icon
                  name="format-quote"
                  size={p(24)}
                  color="#3660f9"
                  style={{ marginRight: p(8) }}
                />
                <Text style={styles.menuText}>
                  {data?.food_name ||
                    'GOOD FOOD IS THE FOUNDATION OF GENUINE HAPPINESS.'}
                </Text>
              </View>

              <View style={styles.optionsRow}>
                {showVegButton && (
                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      veg ? styles.activeVeg : styles.inactive,
                      isPastDeadline && styles.disabledButton,
                    ]}
                    onPress={handleVegSelection}
                    activeOpacity={0.8}
                    disabled={storeLoading || isPastDeadline}
                  >
                    {storeLoading ? (
                      <ActivityIndicator
                        size="small"
                        color={veg ? '#fff' : '#43a047'}
                      />
                    ) : (
                      <>
                        <Icon
                          name="eco"
                          size={p(22)}
                          color={veg ? '#fff' : '#43a047'}
                        />
                        <Text style={[styles.toggleText, veg && styles.activeText]}>
                          Veg
                        </Text>
                        <Icon
                          name={veg ? 'check-box' : 'check-box-outline-blank'}
                          size={p(20)}
                          color={veg ? '#fff' : '#43a047'}
                          style={{ marginLeft: p(8) }}
                        />
                      </>
                    )}
                  </TouchableOpacity>
                )}
                {showNonVegButton && (
                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      nonVeg ? styles.activeNonVeg : styles.inactive,
                      isPastDeadline && styles.disabledButton,
                    ]}
                    onPress={handleNonVegSelection}
                    activeOpacity={0.8}
                    disabled={storeLoading || isPastDeadline}
                  >
                    {storeLoading ? (
                      <ActivityIndicator
                        size="small"
                        color={nonVeg ? '#fff' : '#d84315'}
                      />
                    ) : (
                      <>
                        <Icon
                          name="set-meal"
                          size={p(22)}
                          color={nonVeg ? '#fff' : '#d84315'}
                        />
                        <Text
                          style={[styles.toggleText, nonVeg && styles.activeText]}
                        >
                          Non Veg
                        </Text>
                        <Icon
                          name={nonVeg ? 'check-box' : 'check-box-outline-blank'}
                          size={p(20)}
                          color={nonVeg ? '#fff' : '#d84315'}
                          style={{ marginLeft: p(8) }}
                        />
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {noSelection && !isPastDeadline && (
                <View style={styles.noSelectionContainer}>
                  <Icon name="info" size={p(20)} color="#2196f3" />
                  <Text style={styles.noSelectionText}>
                    No dinner preference selected. Please choose your preference.
                  </Text>
                </View>
              )}

              {isPastDeadline && (
                <View style={styles.deadlineWarning}>
                  <Icon name="warning" size={p(20)} color="#ff9800" />
                  <Text style={styles.deadlineWarningText}>
                    Dinner selection is now closed. Your final selection has been
                    recorded.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eff6ff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(20),
    borderBottomLeftRadius: p(24),
    borderBottomRightRadius: p(24),
    marginBottom: p(20),
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    color: '#1E293B',
    fontSize: p(16),
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: p(16),
    marginBottom: p(40),
    borderRadius: p(20),
    padding: p(24),
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: p(18),
    color: '#1E293B',
    marginBottom: p(16),
    textAlign: 'left',
  },
  menuBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F4FF',
    borderRadius: p(16),
    padding: p(16),
    marginBottom: p(24),
    borderWidth: 1,
    borderColor: '#Dbeafe',
  },
  menuText: {
    fontFamily: 'Poppins-Medium',
    fontSize: p(15),
    color: '#334155',
    flex: 1,
    lineHeight: p(24),
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: p(10),
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: p(14),
    paddingVertical: p(16),
    marginHorizontal: p(6),
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeVeg: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  activeNonVeg: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inactive: {
    backgroundColor: '#F8FAFC',
  },
  toggleText: {
    fontFamily: 'Poppins-Bold',
    fontSize: p(15),
    marginLeft: p(8),
    color: '#64748B',
  },
  activeText: {
    color: '#FFFFFF',
  },
  loadingCard: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Poppins-Medium',
    fontSize: p(16),
    color: '#3660f9',
    marginTop: p(20),
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: p(20),
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: p(16),
    backgroundColor: '#FFF1F2',
    maxWidth: '90%',
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: p(14),
    color: '#E11D48',
    marginHorizontal: p(10),
  },
  timeContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: p(12),
    padding: p(12),
    marginBottom: p(16),
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(4),
  },
  timeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: p(14),
    color: '#475569',
    marginLeft: p(8),
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadlineText: {
    fontFamily: 'Poppins-Medium',
    fontSize: p(14),
    color: '#475569',
    marginLeft: p(8),
  },
  deadlineWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    padding: p(16),
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: p(16),
    marginTop: p(20),
  },
  deadlineWarningText: {
    fontFamily: 'Poppins-Medium',
    fontSize: p(14),
    color: '#C2410C',
    marginLeft: p(10),
    flex: 1,
    lineHeight: p(20),
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  noSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: p(16),
    borderWidth: 1,
    borderColor: '#E0F2FE',
    borderRadius: p(16),
    marginTop: p(20),
  },
  noSelectionText: {
    fontFamily: 'Poppins-Medium',
    fontSize: p(14),
    color: '#0369A1',
    marginLeft: p(10),
    flex: 1,
    lineHeight: p(20),
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: p(40),
  },
  noDataText: {
    fontFamily: 'Poppins-Bold',
    fontSize: p(18),
    color: '#1E293B',
    marginTop: p(16),
  },
  noDataSubtext: {
    fontFamily: 'Poppins-Medium',
    fontSize: p(14),
    color: '#64748B',
    marginTop: p(8),
    textAlign: 'center',
    paddingHorizontal: p(20),
  },
  iconCircle: {
    width: p(96),
    height: p(96),
    borderRadius: p(48),
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: p(16),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inlineErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    marginHorizontal: p(16),
    marginBottom: p(16),
    padding: p(12),
    borderRadius: p(12),
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  inlineErrorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: p(13),
    color: '#E11D48',
    marginLeft: p(8),
    flex: 1,
  },
  errorOnlyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: p(20),
    backgroundColor: '#eff6ff',
  },
});
