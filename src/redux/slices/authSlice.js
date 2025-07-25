import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Login Thunk
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post('/login', { email, password });

      console.log('Response from API call --->', res.data);

      if (res.data?.user && res.data?.token) {
        // ✅ Store token in AsyncStorage
        await AsyncStorage.setItem('token', res.data.token);

        return {
          user: res.data.user,
          token: res.data.token || null,
        };
      } else {
        return rejectWithValue(res.data?.message || 'Login failed');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  },
);
// Dashboard Thunk
export const getDashboard = createAsyncThunk(
  'auth/getDashboard',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/get-dashboard/${userId}`);
      return res.data;

    } catch (error) {
     
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch dashboard');
     
    }
  }
);

// User Details Thunk
export const getUser = createAsyncThunk(
  'auth/getUser',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/get-user/${userId}`);
      console.log('res---------------->', res.data);
      return res.data.data; // Only return the user object
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch user details');
    }
  }
);


// Initial State
const initialState = {
  user: null,
  token: null,
  isLoggedIn: false,
  dashboard: null,
  dashboardLoading: false,
  dashboardError: null,
  userDetails: null,
  userDetailsLoading: false,
  userDetailsError: null,
};

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
    },
  },
  extraReducers: builder => {
    builder
      // Login
      .addCase(login.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loading = false;
        state.isLoggedIn = true;
        })
      .addCase(login.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      // Dashboard
      .addCase(getDashboard.pending, state => {
        state.dashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(getDashboard.fulfilled, (state, action) => {
        state.dashboard = action.payload;
        state.dashboardLoading = false;
      })
      .addCase(getDashboard.rejected, (state, action) => {
        state.dashboardError = action.payload;
        state.dashboardLoading = false;
      })
      // User Details
      .addCase(getUser.pending, state => {
        state.userDetailsLoading = true;
        state.userDetailsError = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.userDetails = action.payload;
        state.userDetailsLoading = false;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.userDetailsError = action.payload;
        state.userDetailsLoading = false;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
