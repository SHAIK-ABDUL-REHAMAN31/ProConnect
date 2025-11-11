import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducre/authReducer";
import postReducer from "./reducre/postReducer";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    postReducer: postReducer,
  },
});
