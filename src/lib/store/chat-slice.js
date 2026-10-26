import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  activeChatUser: null, // { _id, username, avatar, online }
}

const chatSlice = createSlice({
  name: "chat",
  initialState,

  reducers: {
    // payload: { _id, username, avatar, online }
    setActiveChatUser: (state, action) => {
      state.activeChatUser = action.payload
    },
    clearActiveChatUser: (state) => {
      state.activeChatUser = null
    },
  },
})

// Export actions
export const { setActiveChatUser, clearActiveChatUser } = chatSlice.actions

// Selectors
export const selectActiveChatUser = (state) => state.chat.activeChatUser

export const chatReducer = chatSlice.reducer
