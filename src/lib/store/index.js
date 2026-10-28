import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { userReducer } from "@/lib/store/user-slice";
import { sidebarReducer } from "@/lib/store/sidebar-slice";
import { socketReducer } from "@/lib/store/socket-slice";
import {  persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'


const rootPersistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'], //Chỉ lưu vào localstorage thì mới cho vào
}

//Thêm reducer vào đây qua hàm combine
const reducers = combineReducers({
  user: userReducer,
  sidebar: sidebarReducer,
  socket: socketReducer,
})

const persistedReducer = persistReducer(rootPersistConfig, reducers)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
});