import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistStore } from 'redux-persist';

import authReducer from './slices/authSlice';
import leaveReducer from './slices/leaveSlice';   
import { getPersistedReducer } from './persistConfig';
import employeeAnalyticsReducer from './slices/employeeanalyticsSlice';
import dinnerReducer from './slices/dinnerSlice';
import officeListReducer from './slices/officelistSlice';
import salaryReducer from './slices/salarySlice';

const rootReducer = combineReducers({
  auth: getPersistedReducer('auth', authReducer),
  leaves: getPersistedReducer('leaves', leaveReducer),
  employeeAnalytics: getPersistedReducer('employeeAnalytics', employeeAnalyticsReducer),
  dinner: getPersistedReducer('dinner', dinnerReducer),
  officeList: getPersistedReducer('officeList', officeListReducer),
  salary: getPersistedReducer('salary', salaryReducer), 

  });

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
