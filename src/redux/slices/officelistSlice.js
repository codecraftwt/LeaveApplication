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
      return rejectWithValue(e.message || 'Failed to fetch office list');
    }
  },
);

// Thunk to fetch hours report
export const getHoursReport = createAsyncThunk(
  'officeList/getHoursReport',
  async (
    { selectedWeek, selectedOffice, financialYear },
    { rejectWithValue },
  ) => {
    try {
      let url = `get-hours-reports?filter_week=${selectedWeek}`;
      if (financialYear) {
        url += `&financial_filter=${financialYear}`;
      }
      if (selectedOffice) {
        url += `&filter_office=${selectedOffice}`;
      }

      const res = await api.get(url);
      return res.data;
    } catch (e) {
      return rejectWithValue(e.message || 'Failed to fetch hours report');
    }
  },
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
  reducers: {
    clearOfficeListError: (state) => {
      state.officeListError = null;
    },
    clearHoursReportError: (state) => {
      state.hoursReportError = null;
    },
    clearHoursReport: (state) => {
      state.hoursReport = null;
      state.hoursReportLoading = false;
      state.hoursReportError = null;
    },
  },
  extraReducers: builder => {
    builder
      // getOfficeList cases
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
      // getHoursReport cases
      .addCase(getHoursReport.pending, state => {
        state.hoursReportLoading = true;
        state.hoursReportError = null;
      })
      .addCase(getHoursReport.fulfilled, (state, action) => {
        state.hoursReport = action.payload.data;
       
        state.hoursReportLoading = false;
      })
      .addCase(getHoursReport.rejected, (state, action) => {
        state.hoursReportError = action.payload;
        state.hoursReportLoading = false;
      });
  },
});

export const { clearOfficeListError, clearHoursReportError, clearHoursReport } = officeListSlice.actions;
export default officeListSlice.reducer;
