import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducre/userReducer";
import postReducer from "./reducre/postReducer";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    postReducer: postReducer,
  },
});
