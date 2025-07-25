import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Thunk to fetch office list
export const getOfficeList = createAsyncThunk(
  'officeList/getOfficeList',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('get-office-accessList');
      return res.data;
    } catch (e) {
      await handleApiFailure?.(e);
      return rejectWithValue(e.message || 'Failed to fetch office list');
    }
  }
);

// Thunk to fetch hours report
export const getHoursReport = createAsyncThunk(
  'officeList/getHoursReport',
  async ({ selectedWeek, selectedOffice, financialYear }, { rejectWithValue }) => {
    try {
      let url = `get-hours-reports?filter_week=${selectedWeek}`;
      if (financialYear) url += `&financial_filter=${financialYear}`;
      if (selectedOffice) url += `&filter_office=${selectedOffice}`;
      
  
      
      return res.data;
    } catch (e) {
      if (e.name !== 'AbortError') {
        await handleApiFailure?.(e);
        return rejectWithValue(e.message || 'Failed to fetch hours report');
      }
      return rejectWithValue('Request cancelled');
    }
  }
);

const officeListSlice = createSlice({
  name: 'officeList',
  initialState: {
    officeList: null,
    officeListLoading: false,
    officeListError: null,
    hoursReport: null,
    hoursReportLoading: false,
    hoursReportError: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getOfficeList.pending, state => {
        state.officeListLoading = true;
        state.officeListError = null;
      })
      .addCase(getOfficeList.fulfilled, (state, action) => {
        state.officeList = action.payload.data;
        state.officeListLoading = false;
      })
      .addCase(getOfficeList.rejected, (state, action) => {
        state.officeListError = action.payload;
        state.officeListLoading = false;
      })
      // getHoursReport
      .addCase(getHoursReport.pending, state => {
        state.hoursReportLoading = true;
        state.hoursReportError = null;
      })
      .addCase(getHoursReport.fulfilled, (state, action) => {
        state.hoursReport = action.payload.data;
        state.hoursReportLoading = false;
      })
      .addCase(getHoursReport.rejected, (state, action) => {
        // Only update state if not a cancellation
        if (action.payload !== 'Request cancelled') {
          state.hoursReportError = action.payload;
          state.hoursReportLoading = false;
        }
      });
  },
});

export default officeListSlice.reducer;
