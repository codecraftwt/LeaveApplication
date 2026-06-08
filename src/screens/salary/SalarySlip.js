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
    <View style={{flex: 1, backgroundColor: '#eff6ff'}}>
      <View
        style={{
          flex: 1,
          paddingTop: p(16),
          backgroundColor: '#eff6ff',
        }}>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#FFFFFF',
            tabBarInactiveTintColor: '#94a3b8',
            tabBarLabelStyle: {
              fontSize: p(13),
              textTransform: 'none',
              fontFamily: 'Poppins-SemiBold',
            },
            tabBarStyle: {
              backgroundColor: '#FFFFFF',
              borderRadius: p(16),
              marginHorizontal: p(16),
              marginBottom: p(10),
              padding: p(4),
              shadowColor: '#0f172a',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 3,
              borderWidth: 1,
              borderColor: '#f1f5f9',
            },
            tabBarItemStyle: {
              borderRadius: p(12),
              paddingVertical: p(4),
            },
            tabBarIndicatorStyle: {
              backgroundColor: '#3360f9', // Brand Blue
              borderRadius: p(12),
              height: '100%',
            },
            tabBarPressColor: 'transparent',
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
