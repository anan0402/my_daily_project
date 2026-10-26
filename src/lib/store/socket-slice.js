import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isConnected: false,
  socketId: null,
};

const socketSlice = createSlice({
  name: "socket",
  initialState,

  reducers: {
    setSocketConnected: (state, action) => {
      state.isConnected = true;
      state.socketId = action.payload;
    },
    setSocketDisconnected: (state) => {
      state.isConnected = false;
      state.socketId = null;
    },
  },
});

// Export actions
export const { setSocketConnected, setSocketDisconnected } = socketSlice.actions;

// Selectors
export const selectSocketStatus = (state) => state.socket.isConnected;
export const selectSocketId = (state) => state.socket.socketId;

export const socketReducer = socketSlice.reducer;
