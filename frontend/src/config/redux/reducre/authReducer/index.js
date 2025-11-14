import { createSlice } from "@reduxjs/toolkit";
import {
  getConnectionsRequest,
  getMyConnectionsRequest,
  loginUser,
  registerUser,
  sendConnectionRequest,
} from "../../action/authAction";
import { getAboutUser } from "../../action/postAction";
import { getAllUsers } from "../../action/postAction";

const initialState = {
  user: undefined,
  isError: false,
  isSuccess: false,
  isLoading: false,
  loggedIn: false,
  isTokenThere: false,
  message: "",
  profileFetched: false,
  connections: [],
  connectionRequests: [],
  all_profiles_fetched: false,
  all_users: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: () => initialState,
    handleLoginUser: (state) => {
      state.message = "hello";
    },

    emptyMessage: (state) => {
      state.message = "";
    },
    setIsTokenThere: (state) => {
      state.isTokenThere = true;
    },
    setIsTokenNotThere: (state) => {
      state.isTokenThere = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Knocking the door...";
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.loggedIn = true;
        state.message = "Login successful.";
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.loggedIn = false;
        state.message = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Registering user...";
      })

      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.loggedIn = false;
        state.message = "Registration successful Please Log in...";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getAboutUser.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.profileFetched = true;
        state.user = action.payload.profile;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.all_profiles_fetched = true;
        state.all_users = action.payload.profiles;
      })
      .addCase(getConnectionsRequest.fulfilled, (state, action) => {
        state.connections = action.payload;
      })
      .addCase(getConnectionsRequest.rejected, (state, action) => {
        state.message = action.payload;
      })
      .addCase(getMyConnectionsRequest.fulfilled, (state, action) => {
        state.connectionRequests = action.payload; // array from backend
        console.log("Stored connection requests:", state.connectionRequests);
      })
      .addCase(getMyConnectionsRequest.rejected, (state, action) => {
        state.message = action.payload;
      })

      .addCase(sendConnectionRequest.fulfilled, (state, action) => {
        state.message = action.payload;
      })
      .addCase(sendConnectionRequest.rejected, (state, action) => {
        state.message = action.payload;
      });
  },
});

export default authSlice.reducer;
export const { reset, emptyMessage, setIsTokenNotThere, setIsTokenThere } =
  authSlice.actions;
