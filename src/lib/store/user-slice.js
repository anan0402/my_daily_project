
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { login, loginWithGoogle, logout } from "@/lib/auth";

const initialState = {
  currentUser: null,
}

export const loginUserAPI = createAsyncThunk(
  'user/loginUserAPI',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await login({ email, password })
      return response;
    } catch (error) {
      // Pass the full error object to the component
      
      return rejectWithValue(error);
    }
  }
);

export const logoutUserAPI = createAsyncThunk(
  'user/logoutUserAPI',
  async (_, { rejectWithValue }) => {
    try {
      const response = await logout()
      return response;
    } catch (error) {
      // Pass the full error object to the component
      return rejectWithValue(error);
    }
  }
);

export const loginWithGoogleAPI = createAsyncThunk(
  'user/loginWithGoogleAPI',
  async ({ credential }, { rejectWithValue }) => {
    try {
      const response = await loginWithGoogle({ credential })
      return response;
    } catch (error) {
      // Pass the full error object to the component
      return rejectWithValue(error);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,

  reducers: {},

  //Nới xử lý bất đồng bộ
  extraReducers: (builder) => {
    builder.addCase(loginUserAPI.fulfilled, (state, action) => {
      state.currentUser = action.payload;
    });
    builder.addCase(logoutUserAPI.fulfilled, (state) => { 
      state.currentUser = null;
    });
    builder.addCase(loginWithGoogleAPI.fulfilled, (state, action) => {
      state.currentUser = action.payload;
    });
  },

});


//Export actions
//export const {} = userSlice.actions

//Selectors
export const selectCurrentUser = (state) => state.user.currentUser;


export const userReducer = userSlice.reducer;