import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Get today's menu
export const getTodayMenu = createAsyncThunk(
  'dinner/getTodayMenu',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('get-today-menu');
      const data = res.data;
      // Map meal_type to veg/non-veg/both
      let mealType;
      if (data.meal_type === '1') {
        mealType = 'veg';
      } else if (data.meal_type === '2') {
        mealType = 'both';
      } else if (data.meal_type === '1,2') {
        mealType = 'both';
      } else {
        mealType = 'veg';
      }
      return {
        ...data,
        mealType,
        veg: data.veg !== undefined ? Boolean(data.veg) : false,
        non_veg: data.non_veg !== undefined ? Boolean(data.non_veg) : false,
        user_selection: data.user_selection || data.selected_meal_type || data.meal_preference || '',
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch today\'s menu');
    }
  }
);

// Store dinner count
export const storeDinnerCount = createAsyncThunk(
  'dinner/storeDinnerCount',
  async ({ selection, food_id }, { rejectWithValue }) => {
    try {
      let mealType = '';
      
      if (selection.veg && selection.non_veg) {
        mealType = 'veg,non_veg';
      } else if (selection.veg) {
        mealType = 'veg';
      } else if (selection.non_veg) {
        mealType = 'non_veg';
      }
      
      const res = await api.post('store-dinner-count', { 
        meal_type: mealType, 
        food_id 
      });

      return {
        ...res.data,
        user_selection: mealType,
        veg: selection.veg,
        non_veg: selection.non_veg
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get today's selected dinner
export const getTodaysSelectedDinner = createAsyncThunk(
  'dinner/getTodaysSelectedDinner',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('get-todays-selected-dinner');
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch selected dinner');
    }
  }
);

const dinnerSlice = createSlice({
  name: 'dinner',
  initialState: {
    todayMenu: null,       // Previously called 'data'
    todayMenuLoading: false,
    todayMenuError: null,
    storeDinnerResult: null,
    storeDinnerLoading: false,
    storeDinnerError: null,
    todaysSelectedDinner: null,
    todaysSelectedDinnerLoading: false,
    todaysSelectedDinnerError: null,
  },
  reducers: {},
  extraReducers: builder => {
    // getTodayMenu
    builder
      .addCase(getTodayMenu.pending, state => {
        state.todayMenuLoading = true;
        state.todayMenuError = null;
      })
      .addCase(getTodayMenu.fulfilled, (state, action) => {
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
        state.storeDinnerResult = action.payload;
        state.storeDinnerLoading = false;
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

export default dinnerSlice.reducer;
// export { getTodayMenu, storeDinnerCount, getTodaysSelectedDinner };
