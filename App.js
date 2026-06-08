import React, { useEffect } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Redux
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './src/redux/store';
import { StatusBar, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLogoutHandler } from './src/utils/logoutHandler';
import { logout } from './src/redux/slices/authSlice';
import NoInternet from './src/components/NoInternet';

const LoadingComponent = () => <View style={styles.loadingContainer}></View>;
const navigationRef = createNavigationContainerRef();

const App = () => {
  useEffect(() => {
    // Register global logout handler invoked by axios interceptor
    setLogoutHandler(async () => {
      try {
        await AsyncStorage.removeItem('token');
      } catch (_) {}
      store.dispatch(logout());
      // Optionally purge persisted state for auth
      try {
        await persistor.flush();
      } catch (_) {}
      if (navigationRef.isReady()) {
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    });
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingComponent />} persistor={persistor}>
        <SafeAreaProvider>
          <StatusBar backgroundColor="#3660f9" barStyle="light-content" />
          <NoInternet>
            <NavigationContainer ref={navigationRef}>
              <AppNavigator />
            </NavigationContainer>
          </NoInternet>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3660f9',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
  },
});
