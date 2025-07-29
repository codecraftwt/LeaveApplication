import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Get today's menu
export const getTodayMenu = createAsyncThunk(
  'dinner/getTodayMenu',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('get-today-menu');
      const data = res.data;
      
      console.log('Raw API response:', data);
      
      let mealType;
      if (data.meal_type === '1') {
        mealType = 'veg';
      } else if (data.meal_type === '2') {
        mealType = 'non_veg';
      } else if (data.meal_type === '1,2' || data.meal_type === '2,1') {
        mealType = 'both';
      } else {
        mealType = 'veg'; // Default fallback
      }
      
      const processedData = {
        ...data,
        mealType,
      };
      
      console.log('Processed dinner data:', processedData);
      return processedData;
    } catch (error) {
      console.error('getTodayMenu error:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch today\'s menu'
      );
    }
  }
);

// Store dinner count
export const storeDinnerCount = createAsyncThunk(
  'dinner/storeDinnerCount',
  async ({ selection, food_id }, { rejectWithValue }) => {
    try {
      console.log('Storing dinner count with:', { selection, food_id });
      
      let mealType = '';

      if (selection.veg && selection.non_veg) {
        mealType = 'veg,non_veg';
      } else if (selection.veg) {
        mealType = 'veg';
      } else if (selection.non_veg) {
        mealType = 'non_veg';
      }

      console.log('Sending meal_type:', mealType);

      const res = await api.post('store-dinner-count', {
        meal_type: mealType,
        food_id,
      });

      console.log('Store dinner response:', res.data);

      return {
        ...res.data,
        user_selection: mealType,
        veg: selection.veg,
        non_veg: selection.non_veg,
      };
    } catch (error) {
      console.error('storeDinnerCount error:', error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// Get today's selected dinner
export const getTodaysSelectedDinner = createAsyncThunk(
  'dinner/getTodaysSelectedDinner',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('get-todays-selected-dinner');
      console.log('Today\'s selected dinner response:', res.data);
      return res.data;
    } catch (error) {
      console.error('getTodaysSelectedDinner error:', error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch selected dinner',
      );
    }
  },
);

const dinnerSlice = createSlice({
  name: 'dinner',
  initialState: {
    todayMenu: null,
    todayMenuLoading: false,
    todayMenuError: null,
    storeDinnerResult: null,
    storeDinnerLoading: false,
    storeDinnerError: null,
    todaysSelectedDinner: null,
    todaysSelectedDinnerLoading: false,
    todaysSelectedDinnerError: null,
  },
  reducers: {
    // Add a reducer to clear errors
    clearErrors: (state) => {
      state.todayMenuError = null;
      state.storeDinnerError = null;
      state.todaysSelectedDinnerError = null;
    },
    // Add a reducer to reset the store result
    clearStoreResult: (state) => {
      state.storeDinnerResult = null;
    },
  },
  extraReducers: builder => {
    // getTodayMenu
    builder
      .addCase(getTodayMenu.pending, state => {
        state.todayMenuLoading = true;
        state.todayMenuError = null;
      })
      .addCase(getTodayMenu.fulfilled, (state, action) => {
        console.log('getTodayMenu payload:', action.payload);
        state.todayMenu = action.payload;
        state.todayMenuLoading = false;
      })
      .addCase(getTodayMenu.rejected, (state, action) => {
        state.todayMenuError = action.payload;
        state.todayMenuLoading = false;
      })
      // storeDinnerCount
      .addCase(storeDinnerCount.pending, state => {
        state.storeDinnerLoading = true;
        state.storeDinnerError = null;
      })
      .addCase(storeDinnerCount.fulfilled, (state, action) => {
        console.log('storeDinnerCount payload:', action.payload);
        state.storeDinnerResult = action.payload;
        state.storeDinnerLoading = false;
        
        // Update todayMenu with the new selection if available
        if (state.todayMenu && action.payload) {
          state.todayMenu = {
            ...state.todayMenu,
            veg: action.payload.veg,
            non_veg: action.payload.non_veg,
            user_selection: action.payload.user_selection
          };
        }
      })
      .addCase(storeDinnerCount.rejected, (state, action) => {
        state.storeDinnerError = action.payload;
        state.storeDinnerLoading = false;
      })
      // getTodaysSelectedDinner
      .addCase(getTodaysSelectedDinner.pending, state => {
        state.todaysSelectedDinnerLoading = true;
        state.todaysSelectedDinnerError = null;
      })
      .addCase(getTodaysSelectedDinner.fulfilled, (state, action) => {
        state.todaysSelectedDinner = action.payload;
        state.todaysSelectedDinnerLoading = false;
      })
      .addCase(getTodaysSelectedDinner.rejected, (state, action) => {
        state.todaysSelectedDinnerError = action.payload;
        state.todaysSelectedDinnerLoading = false;
      });
  },
});

export const { clearErrors, clearStoreResult } = dinnerSlice.actions;
export default dinnerSlice.reducer;
