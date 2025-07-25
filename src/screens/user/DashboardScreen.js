import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import ContributionCard from '../../components/dashboard/ContributionCard';
import MonthStats from '../../components/dashboard/MonthStats';
import EventsList from '../../components/dashboard/EventsList';
import { p } from '../../utils/Responsive';
import { useSelector, useDispatch } from 'react-redux';
import { getDashboard } from '../../redux/slices/authSlice';
import LeaveInfo from '../../components/dashboard/LeaveInfo';

const DashboardScreen = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  useEffect(() => {
    if (user?.id) {
      dispatch(getDashboard(user.id));
    }
  }, [dispatch, user?.id]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headContainer}>
        <Text style={styles.headtitle}>
          Welcome : {user?.first_name || ''} {user?.middle_name || ''}{' '}
          {user?.last_name || ''}
        </Text>
      </View>

      <View style={styles.mainContainer}>
        <ContributionCard />
        <MonthStats />
        <LeaveInfo showViewButton={true} />
        <EventsList />
      </View>
    </ScrollView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: p(10),
    borderTopRightRadius: p(30),
    borderTopLeftRadius: p(30),
    marginHorizontal: p(13),
  },
  headtitle: {
    fontSize: p(14),
    // marginBottom: p(10),
    fontFamily: 'Montserrat-SemiBold',
    color: '#fff',
    textAlign: 'center',
  },
  headContainer: {
    backgroundColor: '#ff9900',
    paddingVertical: p(6),
    borderRadius: p(10),
    marginTop: p(10),
    marginHorizontal: p(13),
  },
});
