import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Thunk to get salary slip
export const getSalarySlip = createAsyncThunk(
  'salary/getSalarySlip',
  async ({ empid, month, year }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/get-salary-slip/${empid}/${month}/${year}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch salary slip',
      );
    }
  },
);

// Thunk to get annual package
export const getAnnualPackage = createAsyncThunk(
  'salary/getAnnualPackage',
  async ({ empid, year }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/get-annual-package/${empid}/${year}`);
      return res.data;
    } catch (error) {
      console.log('Annual package API error:', error.response?.status, error.message);
      
      // Don't reject for 404 errors (no data found)
      if (error.response && error.response.status === 404) {
        console.log('No annual package data found for year:', year);
        return rejectWithValue({ error: 'No data found', status: 404 });
      }
      
      // Check if it's an authentication error (401) or server error (500)
      if (error.response && (error.response.status === 401 || error.response.status === 500)) {
        console.log('Authentication or server error:', error.response.status);
        return rejectWithValue({ error: 'Authentication failed', status: error.response.status });
      } else {
        // For other errors, return the error message
        console.log('API call failed but not logging out:', error.response?.status, error.message);
        return rejectWithValue(
          error.response?.data?.message || error.message || 'Failed to fetch annual package'
        );
      }
    }
  },
);

// Thunk to get salary list
export const getSalaryList = createAsyncThunk(
  'salary/getSalaryList',
  async ({ empid, year }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/get-salary-list/${empid}/${year}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch salary list',
      );
    }
  },
);

const salarySlice = createSlice({
  name: 'salary',
  initialState: {
    salarySlip: null,
    salarySlipLoading: false,
    salarySlipError: null,
    salarySlipSuccess: false,
    annualPackage: null,
    annualPackageLoading: false,
    annualPackageError: null,
    annualPackageSuccess: false,
    salaryList: null,
    salaryListLoading: false,
    salaryListError: null,
    salaryListSuccess: false,
  },
  reducers: {
    resetSalaryState(state) {
      state.salarySlipSuccess = false;
      state.salarySlipError = null;
      state.salarySlipLoading = false;
      state.salarySlip = null;
    },
    resetAnnualPackageState(state) {
      state.annualPackageSuccess = false;
      state.annualPackageError = null;
      state.annualPackageLoading = false;
      state.annualPackage = null;
    },
    resetSalaryListState(state) {
      state.salaryListSuccess = false;
      state.salaryListError = null;
      state.salaryListLoading = false;
      state.salaryList = null;
    },
  },
  extraReducers: builder => {
    builder
      // Salary Slip cases
      .addCase(getSalarySlip.pending, state => {
        state.salarySlipLoading = true;
        state.salarySlipError = null;
        state.salarySlipSuccess = false;
      })
      .addCase(getSalarySlip.fulfilled, (state, action) => {
        state.salarySlipLoading = false;
        state.salarySlip = action.payload.data;
        state.salarySlipSuccess = true;
      })
      .addCase(getSalarySlip.rejected, (state, action) => {
        state.salarySlipLoading = false;
        state.salarySlipError = action.payload;
        state.salarySlipSuccess = false;
      })
      // Annual Package cases
      .addCase(getAnnualPackage.pending, state => {
        state.annualPackageLoading = true;
        state.annualPackageError = null;
        state.annualPackageSuccess = false;
      })
      .addCase(getAnnualPackage.fulfilled, (state, action) => {
        state.annualPackageLoading = false;
        state.annualPackage = action.payload.data;
        state.annualPackageSuccess = true;
      })
      .addCase(getAnnualPackage.rejected, (state, action) => {
        state.annualPackageLoading = false;
        state.annualPackageError = action.payload;
        state.annualPackageSuccess = false;
      })
      // Salary List cases
      .addCase(getSalaryList.pending, state => {
        state.salaryListLoading = true;
        state.salaryListError = null;
        state.salaryListSuccess = false;
      })
      .addCase(getSalaryList.fulfilled, (state, action) => {
        state.salaryListLoading = false;
        state.salaryList = action.payload.data;
        state.salaryListSuccess = true;
      })
      .addCase(getSalaryList.rejected, (state, action) => {
        state.salaryListLoading = false;
        state.salaryListError = action.payload;
        state.salaryListSuccess = false;
      });
  },
});

// export const { resetSalaryState, resetAnnualPackageState, resetSalaryListState } = salarySlice.actions;
export default salarySlice.reducer;
