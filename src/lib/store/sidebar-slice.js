import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpen: false,
}

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,

  reducers: {
    toggleSidebar: (state) => {
      state.isOpen = !state.isOpen;
    },
    openSidebar: (state) => {
      state.isOpen = true;
    },
    closeSidebar: (state) => {
      state.isOpen = false;
    },
  },
});

// Export actions
export const { toggleSidebar, openSidebar, closeSidebar } = sidebarSlice.actions;

// Selectors
export const selectSidebarIsOpen = (state) => state.sidebar.isOpen;

export const sidebarReducer = sidebarSlice.reducer;
