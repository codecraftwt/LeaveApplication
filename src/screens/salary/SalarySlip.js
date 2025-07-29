import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import ExampleFive from './SalarySlipDownload';
import AnnualSalaryPackage from './AnnualSalaryPackage';
import { p } from '../../utils/Responsive';
// import {p} from '../utils/Responsive';

const Tab = createMaterialTopTabNavigator();

export default function SalarySlip() {
  return (
    <View style={{flex: 1, backgroundColor: '#3660f9'}}>
      <View
        style={{
          flex: 1,
          paddingTop: p(20),
          backgroundColor: '#fff',
        }}>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#fff',
            tabBarInactiveTintColor: '#000',
            tabBarLabelStyle: {
              fontSize: p(15),
              textTransform: 'none',
              fontFamily: 'Rubik-Regular',
            },
            tabBarStyle: {
              backgroundColor: '#f0f0f0',
              borderRadius: p(10),
              margin: p(10),
              justifyContent: 'center',
              paddingVertical: 0,
            },
            tabBarItemStyle: {
              borderRadius: p(10),
              margin: p(2),
            },
            tabBarIndicatorStyle: {
              backgroundColor: '#3660f9',
              borderRadius: p(10),
              height: '100%',
            },
            tabBarPressColor: '#e0e0e0',
          }}>
          <Tab.Screen
            name="Annual Package"
            component={AnnualSalaryPackage}
            options={{title: 'Annual Package'}}
          />
          <Tab.Screen
            name="Monthly Salary Slip"
            component={ExampleFive}
            options={{title: 'Monthly Salary Slip'}}
          />
        </Tab.Navigator>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({});
