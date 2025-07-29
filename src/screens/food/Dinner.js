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
// import { getTodayMenu, storeDinnerCount, getTodaysSelectedDinner } from '../actions/DinnerActions'; // Import the new action
import { useToast } from 'react-native-toast-notifications';
import { useIsFocused } from '@react-navigation/native';
import {
  getTodayMenu,
  getTodaysSelectedDinner,
  storeDinnerCount,
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
    todaysSelectedDinnerError
  } = useSelector(state => state.dinner);

  // State for user selection (veg/non-veg)
  const [veg, setVeg] = useState(false);
  const [nonVeg, setNonVeg] = useState(false);
  const [isPastDeadline, setIsPastDeadline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isFocused) {
      console.log('Dinner screen focused, fetching fresh data...');
      dispatch(getTodayMenu());
      dispatch(getTodaysSelectedDinner()); // Fetch today's selected dinner
    }
  }, [dispatch, isFocused]);

  // Check if it's past 4 PM
  useEffect(() => {
    const checkDeadline = () => {
      const now = new Date();
      const utcHours = now.getUTCHours();
      const utcMinutes = now.getUTCMinutes();
      
      // Adjust for IST (UTC+5:30)
      const istHours = (utcHours + 5) % 24;
      const istMinutes = (utcMinutes + 30) % 60;
      
      setIsPastDeadline(istHours > 16 || (istHours === 16 && istMinutes > 0));
    };

    // Check immediately
    checkDeadline();

    // Check every minute
    const interval = setInterval(checkDeadline, 60000);

    return () => clearInterval(interval);
  }, []);

  // Update selection based on API responses
  useEffect(() => {
    // Prioritize todaysSelectedDinner if available
    if (todaysSelectedDinner?.status && todaysSelectedDinner?.data) {
      const mealType = todaysSelectedDinner.data.meal_type;

      console.log('Setting selection from todaysSelectedDinner:', mealType);

      if (mealType === 'veg') {
        setVeg(true);
        setNonVeg(false);
      } else if (mealType === 'non_veg') {
        setVeg(false);
        setNonVeg(true);
      } else if (mealType.includes('veg') && mealType.includes('non_veg')) {
        setVeg(true);
        setNonVeg(true);
      } else {
        setVeg(false);
        setNonVeg(false);
      }
    }
    // Fallback to getTodayMenu data if todaysSelectedDinner is not available
    else if (data?.mealType) {
      console.log('Falling back to getTodayMenu data');

      // Always use the API response values if they are explicitly provided
      if (data.veg !== undefined && data.non_veg !== undefined) {
        setVeg(Boolean(data.veg));
        setNonVeg(Boolean(data.non_veg));
        console.log('Setting selection from API response:', {
          veg: data.veg,
          non_veg: data.non_veg,
        });
      } else if (
        data.user_selection ||
        data.selected_meal_type ||
        data.meal_preference
      ) {
        const userSelection =
          data.user_selection ||
          data.selected_meal_type ||
          data.meal_preference;

        if (typeof userSelection === 'string') {
          if (
            !userSelection ||
            userSelection.trim() === '' ||
            userSelection.trim() === ' '
          ) {
            setVeg(false);
            setNonVeg(false);
          } else if (
            userSelection.includes('veg') &&
            userSelection.includes('non_veg')
          ) {
            setVeg(true);
            setNonVeg(true);
          } else if (userSelection.includes('veg')) {
            setVeg(true);
            setNonVeg(false);
          } else if (userSelection.includes('non_veg')) {
            setVeg(false);
            setNonVeg(true);
          } else {
            setVeg(false);
            setNonVeg(false);
          }
        } else if (typeof userSelection === 'object') {
          setVeg(Boolean(userSelection.veg));
          setNonVeg(Boolean(userSelection.non_veg));
        }
      } else {
        setVeg(false);
        setNonVeg(false);
      }
    }
  }, [data, todaysSelectedDinner]);

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
    // Don't allow changes if past deadline
    if (isPastDeadline) {
      toast.show('Dinner selection deadline has passed (4 PM)', {
        type: 'warning',
        placement: 'bottom',
      });
      return;
    }

    let newVeg = veg;
    let newNonVeg = nonVeg;

    if (data?.mealType === 'both') {
      if (veg) {
        newVeg = false;
        newNonVeg = false;
      } else {
        newVeg = true;
        newNonVeg = false;
      }
    } else if (data?.mealType === 'veg') {
      newVeg = !veg;
      newNonVeg = false;
    } else {
      newVeg = true;
      newNonVeg = false;
    }

    setVeg(newVeg);
    setNonVeg(newNonVeg);

    // Store the selection
    try {
      await dispatch(storeDinnerCount({
          selection: { veg: newVeg, non_veg: newNonVeg },
          food_id: data?.id,
        }),
      );
      const message = newVeg
        ? 'Dinner data updated successfully!'
        : 'Dinner data updated successfully!';
      toast.show(message, {
        type: 'success',
        placement: 'bottom',
      });

      // Refresh selected dinner data
      dispatch(getTodaysSelectedDinner());
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update dinner preference';
      toast.show(errorMessage, {
        type: 'danger',
        placement: 'bottom',
      });
      console.log('Veg selection error:', error);
    }
  };

  const handleNonVegSelection = async () => {
    // Don't allow changes if past deadline
    if (isPastDeadline) {
      toast.show('Dinner selection deadline has passed (4 PM)', {
        type: 'warning',
        placement: 'bottom',
      });
      return;
    }

    let newVeg = veg;
    let newNonVeg = nonVeg;

    if (data?.mealType === 'both') {
      if (nonVeg) {
        newVeg = false;
        newNonVeg = false;
      } else {
        newVeg = false;
        newNonVeg = true;
      }
    } else if (data?.mealType === 'non_veg') {
      newVeg = false;
      newNonVeg = !nonVeg;
    } else {
      newVeg = false;
      newNonVeg = true;
    }

    setVeg(newVeg);
    setNonVeg(newNonVeg);

    // Store the selection
    try {
      await dispatch(
        storeDinnerCount({ veg: newVeg, non_veg: newNonVeg }, data?.id),
      );
      const message = newNonVeg
        ? 'Dinner data updated successfully!'
        : 'Dinner data updated successfully!';
      toast.show(message, {
        type: 'success',
        placement: 'bottom',
      });

      // Refresh selected dinner data
      dispatch(getTodaysSelectedDinner());
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update dinner preference';
      toast.show(errorMessage, {
        type: 'danger',
        placement: 'bottom',
      });
      console.log('Non Veg selection error:', error);
    }
  };

  // Determine which buttons to show based on mealType
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
});
