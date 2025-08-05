import React, { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import WebView from 'react-native-webview';
import { p } from '../../utils/Responsive';
import CustomLoadingIndicator from '../../components/CustomeLoadingIndicator';
import Header from '../../components/Header';

const AnnualSleep = () => {
  const route = useRoute();
  const { htmlContent } = route.params || {};

  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleBackButton = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackButton);

    // Simulate loading delay; you can replace this with your actual logic
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500); // Adjust the duration as needed

    return () => {
      backHandler.remove();
      clearTimeout(timeout);
    };
  }, [navigation]);

  return (
    <View style={styles.maincontainer}>
      <Header 
        title="Annual Salary Package" 
        onBack={() => navigation.goBack()}
      />
      <View style={styles.container}>
        {loading ? (
          <CustomLoadingIndicator/>
        ) : htmlContent ? (
          <WebView
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            style={styles.webview}
          />
        ) : (
          <Text>No data available</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    backgroundColor: '#3660f9',
    borderColor: '#3660f9',
    borderWidth: 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: p(20),
    paddingHorizontal: p(10),
    // borderTopEndRadius: p(30),
    // borderTopStartRadius: p(30),
  },
  title: {
    fontSize: p(18),
    fontWeight: 'bold',
    marginBottom: p(10),
  },
  webview: {
    flex: 1,
  },
});
export default AnnualSleep;
