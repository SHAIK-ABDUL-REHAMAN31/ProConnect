import { clientServer } from "../../../index";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const loginUser = createAsyncThunk(
  "user/loginUser",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/login", {
        email: user.email,
        password: user.password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        if (response.data.refreshToken) {
          localStorage.setItem("refreshToken", response.data.refreshToken);
        }
        localStorage.setItem("user", JSON.stringify(response.data.user)); // store user
      }

      return thunkAPI.fulfillWithValue({
        token: response.data.token,
        user: response.data.user,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  },
);

export const googleLoginUser = createAsyncThunk(
  "user/googleLoginUser",
  async (googleData, thunkAPI) => {
    try {
      const response = await clientServer.post("/api/v1/auth/google", googleData);
      const data = response.data?.data || response.data;
      const token = data?.token || data?.accessToken;
      const refreshToken = data?.refreshToken;
      const user = data?.user;

      if (token) {
        localStorage.setItem("token", token);
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
        }
      }

      return thunkAPI.fulfillWithValue({
        token,
        user,
      });
    } catch (error) {
      const rawMsg =
        error.response?.data?.message ||
        (typeof error.response?.data === "string" &&
        !error.response.data.includes("<!DOCTYPE")
          ? error.response.data
          : null);
      return thunkAPI.rejectWithValue(
        rawMsg || "Google authentication failed. Please try again."
      );
    }
  },
);

export const registerUser = createAsyncThunk(
  "user/register",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/api/v1/auth/register", {
        name: user.name,
        username: user.username,
        email: user.email,
        password: user.password,
      });
      const data = response.data?.data || response.data;
      const token = data?.token || data?.accessToken;
      const refreshToken = data?.refreshToken;
      const userData = data?.user;

      if (token) {
        localStorage.setItem("token", token);
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }
        if (userData) {
          localStorage.setItem("user", JSON.stringify(userData));
        }
      }

      return thunkAPI.fulfillWithValue({
        token,
        user: userData,
        message: data?.message || "Account created and verified! Welcome to ProConnect.",
      });
    } catch (error) {
      const rawMsg =
        error.response?.data?.message ||
        (typeof error.response?.data === "string" &&
        !error.response.data.includes("<!DOCTYPE")
          ? error.response.data
          : null);
      return thunkAPI.rejectWithValue(
        rawMsg || "Registration failed. Please try again."
      );
    }
  },
);

export const sendConnectionRequest = createAsyncThunk(
  "user/sendConnectionRequest",
  async (userData, thunkAPI) => {
    try {
      const response = await clientServer.post(
        "/user/send_connection_request",
        {
          token: userData.token,
          connectionId: userData.connectionId,
        },
      );

      thunkAPI.dispatch(getConnectionsRequest({ token: userData.token }));
      thunkAPI.dispatch(getMyConnectionsRequest(userData.token));
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);

export const getConnectionsRequest = createAsyncThunk(
  "user/getConnectionsRequest",
  async (user, thunkAPI) => {
    try {
      const token = typeof user === "string" ? user : user?.token;
      const respone = await clientServer.get(
        "/user/get_my_connections_request",
        {
          params: {
            token,
          },
        },
      );
      return thunkAPI.fulfillWithValue(respone.data.connections || []);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);

export const getMyConnectionsRequest = createAsyncThunk(
  "user/getMyConnectionsRequest",
  async (token, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/what_are_my_connections", {
        params: { token },
      });

      return response.data.connections || [];
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);

export const acceptConnection = createAsyncThunk(
  "user/acceptConnection",
  async (user, thunkAPI) => {
    try {
      const respone = await clientServer.post(
        "/user/accept_connection_request",
        {
          token: user.token,
          requestId: user.connectionId || user.requestId,
          action_type: user.action_type || "accept",
        },
      );
      thunkAPI.dispatch(getConnectionsRequest({ token: user.token }));
      thunkAPI.dispatch(getMyConnectionsRequest(user.token));
      return thunkAPI.fulfillWithValue(respone.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);
