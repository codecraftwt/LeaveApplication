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
            color="#fff"
            style={{ marginRight: p(10) }}
          />
          <Text style={styles.title}>DAILY DINNER MANAGEMENT</Text>
          <Icon
            name="restaurant"
            size={p(22)}
            color="#fff"
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

  // Show fallback if no data is available
  if (!data && !error && !todaysSelectedDinnerError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="#3660f9" barStyle="light-content" />
        <View style={styles.header}>
          <Icon
            name="restaurant"
            size={p(22)}
            color="#fff"
            style={{ marginRight: p(10) }}
          />
          <Text style={styles.title}>DAILY DINNER MANAGEMENT</Text>
          <Icon
            name="restaurant"
            size={p(22)}
            color="#fff"
            style={{ marginLeft: p(10) }}
          />
        </View>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Today's Menu</Text>
            <View style={styles.noDataContainer}>
              <Icon name="restaurant-menu" size={p(40)} color="#ccc" />
              <Text style={styles.noDataText}>No menu available for today</Text>
              <Text style={styles.noDataSubtext}>
                Please check back later or contact the admin
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
          color="#fff"
          style={{ marginRight: p(10) }}
        />
        <Text style={styles.title}>DAILY DINNER MANAGEMENT</Text>
        <Icon
          name="restaurant"
          size={p(22)}
          color="#fff"
          style={{ marginLeft: p(10) }}
        />
      </View>
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

          {error && (
            <View style={styles.errorContainer}>
              <Icon name="error" size={p(20)} color="#f44336" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {storeError && (
            <View style={styles.errorContainer}>
              <Icon name="error" size={p(20)} color="#f44336" />
              <Text style={styles.errorText}>{storeError}</Text>
            </View>
          )}

          {todaysSelectedDinnerError && (
            <View style={styles.errorContainer}>
              <Icon name="error" size={p(20)} color="#f44336" />
              <Text style={styles.errorText}>{todaysSelectedDinnerError}</Text>
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
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#3660f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(24),
    borderBottomLeftRadius: p(30),
    borderBottomRightRadius: p(30),
    marginBottom: p(20),
  },
  title: {
    fontFamily: 'Montserrat-SemiBold',
    color: '#fff',
    fontSize: p(16),
    letterSpacing: 1,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: p(18),
    marginBottom: p(40),
    borderRadius: p(18),
    padding: p(22),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: p(16),
    color: '#3660f9',
    marginBottom: p(12),
    textAlign: 'left',
  },
  menuBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e3f2fd',
    borderRadius: p(12),
    padding: p(14),
    marginBottom: p(24),
    shadowColor: '#90caf9',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  menuText: {
    fontFamily: 'Rubik-Regular',
    fontSize: p(15),
    color: '#222',
    flex: 1,
    lineHeight: p(22),
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
    borderRadius: p(10),
    paddingVertical: p(14),
    marginHorizontal: p(6),
    backgroundColor: '#f5f5f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  activeVeg: {
    backgroundColor: '#43a047',
  },
  activeNonVeg: {
    backgroundColor: '#d84315',
  },
  inactive: {
    backgroundColor: '#f5f5f5',
  },
  toggleText: {
    fontFamily: 'Poppins-Bold',
    fontSize: p(15),
    marginLeft: p(8),
    color: '#666',
  },
  activeText: {
    color: '#fff',
  },
  loadingCard: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Poppins-Regular',
    fontSize: p(16),
    color: '#3660f9',
    marginTop: p(20),
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: p(12),
    borderWidth: 1,
    borderColor: '#f44336',
    borderRadius: p(10),
    marginTop: p(20),
  },
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: p(15),
    color: '#f44336',
    marginLeft: p(8),
  },
  timeContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: p(10),
    padding: p(12),
    marginBottom: p(16),
    flexDirection: 'column',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(4),
  },
  timeText: {
    fontFamily: 'Poppins-Regular',
    fontSize: p(14),
    color: '#666',
    marginLeft: p(8),
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadlineText: {
    fontFamily: 'Poppins-Regular',
    fontSize: p(14),
    color: '#666',
    marginLeft: p(8),
  },
  deadlineWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    padding: p(12),
    borderWidth: 1,
    borderColor: '#ff9800',
    borderRadius: p(10),
    marginTop: p(20),
  },
  deadlineWarningText: {
    fontFamily: 'Poppins-Regular',
    fontSize: p(14),
    color: '#ff9800',
    marginLeft: p(8),
    flex: 1,
  },
  disabledButton: {
    opacity: 0.6,
    backgroundColor: '#e0e0e0',
  },
  noSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: p(12),
    borderWidth: 1,
    borderColor: '#2196f3',
    borderRadius: p(10),
    marginTop: p(20),
  },
  noSelectionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: p(14),
    color: '#2196f3',
    marginLeft: p(8),
    flex: 1,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: p(30),
  },
  noDataText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: p(18),
    color: '#333',
    marginTop: p(15),
  },
  noDataSubtext: {
    fontFamily: 'Rubik-Regular',
    fontSize: p(14),
    color: '#666',
    marginTop: p(5),
    textAlign: 'center',
    paddingHorizontal: p(20),
  },
});
