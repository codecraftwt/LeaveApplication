import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Thunk to fetch employee analytics
export const getEmpAnalytics = createAsyncThunk(
  'employeeAnalytics/getEmpAnalytics',
  async ({ empid, fromdate, todate }, { rejectWithValue }) => {
    try {
      const res = await api.get(
        `/get-emp-analytics/${empid}/${fromdate}/${todate}`,
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch analytics',
      );
    }
  },
);

// Thunk to fetch employee status
export const getEmployeeStatus = createAsyncThunk(
  'employeeAnalytics/getEmployeeStatus',
  async ({ empId, fromDate, toDate }, { rejectWithValue }) => {
    try {
      const url = `/get-emp-status/${empId}/${fromDate}/${toDate}`;

      const res = await api.get(url);

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch employee status',
      );
    }
  },
);

// Thunk to fetch team status (getEmpStatus)
export const getEmpStatus = createAsyncThunk(
  'employeeAnalytics/getEmpStatus',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('get-team-status');
    
      console.log(res.data);
      return res.data;
    } catch (error) {
      await handleApiFailure?.(error); // Optional: if you have this util
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch team status',
      );
    }
  }
);

// Thunk to approve/reject employee status (approveRejectEmpStatus)
export const approveRejectEmpStatus = createAsyncThunk(
  'employeeAnalytics/approveRejectEmpStatus',
  async ({ id, empId, workstatus, comment }, { rejectWithValue }) => {
    try {
      const res = await api.post(
        'approve-reject-emp-status',
        { id, empId, workstatus, comment }
      );
      return res.data;
    } catch (error) {
      await handleApiFailure?.(error); // Optional: if you have this util
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to approve/reject status',
      );
    }
  }
);

const employeeAnalyticsSlice = createSlice({
  name: 'employeeAnalytics',
  initialState: {
    analytics: null,
    loading: false,
    error: null,
    employeeStatus: null,
    employeeStatusLoading: false,
    employeeStatusError: null,
    // Add new state for team status and approve/reject
    teamStatus: null,
    teamStatusLoading: false,
    teamStatusError: null,
    approveRejectResult: null,
    approveRejectLoading: false,
    approveRejectError: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getEmpAnalytics.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEmpAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
        state.loading = false;
      })
      .addCase(getEmpAnalytics.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      // getEmployeeStatus
      .addCase(getEmployeeStatus.pending, state => {
        state.employeeStatusLoading = true;
        state.employeeStatusError = null;
      })
      .addCase(getEmployeeStatus.fulfilled, (state, action) => {
        state.employeeStatus = action.payload.data;
        state.employeeStatusLoading = false;
      })
      .addCase(getEmployeeStatus.rejected, (state, action) => {
        state.employeeStatusError = action.payload;
        state.employeeStatusLoading = false;
      })
      // getEmpStatus
      .addCase(getEmpStatus.pending, state => {
        state.teamStatusLoading = true;
        state.teamStatusError = null;
      })
      .addCase(getEmpStatus.fulfilled, (state, action) => {
        state.teamStatus = action.payload.data;
        state.teamStatusLoading = false;
      })
      .addCase(getEmpStatus.rejected, (state, action) => {
        state.teamStatusError = action.payload;
        state.teamStatusLoading = false;
      })
      // approveRejectEmpStatus
      .addCase(approveRejectEmpStatus.pending, state => {
        state.approveRejectLoading = true;
        state.approveRejectError = null;
      })
      .addCase(approveRejectEmpStatus.fulfilled, (state, action) => {
        state.approveRejectResult = action.payload;
        state.approveRejectLoading = false;
      })
      .addCase(approveRejectEmpStatus.rejected, (state, action) => {
        state.approveRejectError = action.payload;
        state.approveRejectLoading = false;
      });
  },
});

export default employeeAnalyticsSlice.reducer;
// export { getEmpAnalytics, getEmployeeStatus };
// export { getEmpStatus, approveRejectEmpStatus };
