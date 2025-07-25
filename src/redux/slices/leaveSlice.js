import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Thunk to fetch all leaves
export const getLeaves = createAsyncThunk(
  'leaves/getLeaves',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/get-leaves');
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch leaves',
      );
    }
  },
);

// Thunk to add a leave
export const addLeave = createAsyncThunk(
  'leaves/addLeave',
  async ({ userId, leaveData }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/add-leave/${userId}`, leaveData);
      console.log('API response:', res.data); // Log full API response
      return res.data;
    } catch (error) {
      console.log('API error (catch):', error.response?.data || error.message); // Log error
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to add leave',
      );
    }
  },
);

// Thunk to fetch employee leaves
export const getEmpLeaves = createAsyncThunk(
  'leaves/getEmpLeaves',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/get-emp-leaves');
      return { success: true, data: res.data };
    } catch (error) {
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 500)
      ) {
        return rejectWithValue('Authentication failed');
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch employee leaves';
        return rejectWithValue(errorMessage);
      }
    }
  },
);

// Thunk to approve a leave
export const approveLeave = createAsyncThunk(
  'leaves/approveLeave',
  async ({ id }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/approve-leave/${id}`, {
        status: 'approved',
      });
      if (res.data.status === 'success') {
        return res.data;
      } else {
        return rejectWithValue(res.data.message || 'Approval failed');
      }
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || e.message || 'Approval failed',
      );
    }
  },
);

// Thunk to reject a leave
export const rejectLeave = createAsyncThunk(
  'leaves/rejectLeave',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/reject-leave/${id}`, {
        status: 'rejected',
        reason,
      });
      if (res.data.status === 'success') {
        return res.data;
      } else {
        return rejectWithValue(res.data.message || 'Rejection failed');
      }
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || e.message || 'Rejection failed',
      );
    }
  },
);

const leaveSlice = createSlice({
  name: 'leaves',
  initialState: {
    leaves: [],
    loading: false,
    error: null,
    addLeaveLoading: false,
    addLeaveError: null,
    addLeaveSuccess: false,
    empLeaves: [],
    empLeavesLoading: false,
    empLeavesError: null,
    approveLeaveLoading: false,
    approveLeaveError: null,
    approveLeaveSuccess: false,
    rejectLeaveLoading: false,
    rejectLeaveError: null,
    rejectLeaveSuccess: false,
  },
  reducers: {
    resetAddLeaveState(state) {
      state.addLeaveSuccess = false;
      state.addLeaveError = null;
      state.addLeaveLoading = false;
    },
    resetApproveRejectState(state) {
      state.approveLeaveLoading = false;
      state.approveLeaveError = null;
      state.approveLeaveSuccess = false;
      state.rejectLeaveLoading = false;
      state.rejectLeaveError = null;
      state.rejectLeaveSuccess = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getLeaves.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLeaves.fulfilled, (state, action) => {
        state.leaves = action.payload;
        state.loading = false;
      })
      .addCase(getLeaves.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      // Add Leave
      .addCase(addLeave.pending, state => {
        state.addLeaveLoading = true;
        state.addLeaveError = null;
        state.addLeaveSuccess = false;
      })
      .addCase(addLeave.fulfilled, (state, action) => {
        state.addLeaveLoading = false;
        state.addLeaveSuccess = true;
      })
      .addCase(addLeave.rejected, (state, action) => {
        state.addLeaveLoading = false;
        state.addLeaveError = action.payload;
        state.addLeaveSuccess = false;
      })
      // Get Emp Leaves
      .addCase(getEmpLeaves.pending, state => {
        state.empLeavesLoading = true;
        state.empLeavesError = null;
      })
      .addCase(getEmpLeaves.fulfilled, (state, action) => {
        state.empLeavesLoading = false;
        state.empLeaves = action.payload.data.leaves;
      })
      .addCase(getEmpLeaves.rejected, (state, action) => {
        state.empLeavesLoading = false;
        state.empLeavesError = action.payload;
      })
      // Approve Leave
      .addCase(approveLeave.pending, state => {
        state.approveLeaveLoading = true;
        state.approveLeaveError = null;
        state.approveLeaveSuccess = false;
      })
      .addCase(approveLeave.fulfilled, (state, action) => {
        state.approveLeaveLoading = false;
        state.approveLeaveSuccess = true;
      })
      .addCase(approveLeave.rejected, (state, action) => {
        state.approveLeaveLoading = false;
        state.approveLeaveError = action.payload;
        state.approveLeaveSuccess = false;
      })
      // Reject Leave
      .addCase(rejectLeave.pending, state => {
        state.rejectLeaveLoading = true;
        state.rejectLeaveError = null;
        state.rejectLeaveSuccess = false;
      })
      .addCase(rejectLeave.fulfilled, (state, action) => {
        state.rejectLeaveLoading = false;
        state.rejectLeaveSuccess = true;
      })
      .addCase(rejectLeave.rejected, (state, action) => {
        state.rejectLeaveLoading = false;
        state.rejectLeaveError = action.payload;
        state.rejectLeaveSuccess = false;
      });
  },
});

export const { resetAddLeaveState, resetApproveRejectState } =
  leaveSlice.actions;
export default leaveSlice.reducer;
