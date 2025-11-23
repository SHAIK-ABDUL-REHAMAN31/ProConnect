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
        localStorage.setItem("user", JSON.stringify(response.data.user)); // store user
      }

      return thunkAPI.fulfillWithValue({
        token: response.data.token,
        user: response.data.user,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const registerUser = createAsyncThunk(
  "user/register",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/register", {
        name: user.name,
        username: user.username,
        email: user.email,
        password: user.password,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
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
        }
      );

      thunkAPI.dispatch(getConnectionsRequest({ token: userData.token }));
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.reponse.data);
    }
  }
);

export const getConnectionsRequest = createAsyncThunk(
  "user/getConnectionsRequest",
  async (user, thunkAPI) => {
    try {
      const respone = await clientServer.get(
        "/user/get_my_connections_request",
        {
          params: {
            token: user.token,
          },
        }
      );
      return thunkAPI.fulfillWithValue(respone.data.connections);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const getMyConnectionsRequest = createAsyncThunk(
  "user/getMyConnectionsRequest",
  async (token, thunkAPI) => {
    try {
      console.log("Token sent →", token);

      const response = await clientServer.get("/user/what_are_my_connections", {
        params: { token },
      });

      console.log("Response from getMyConnections →", response.data);

      return response.data.connections; // array
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const acceptConnection = createAsyncThunk(
  "user/acceptConnection",
  async (user, thunkAPI) => {
    try {
      const respone = await clientServer.post(
        "/user/accept_connection_request",
        {
          token: user.token,
          requestId: user.connectionId,
          action_type: user.action,
        }
      );
      thunkAPI.dispatch(getConnectionsRequest({ token: user.token }));
      thunkAPI.dispatch(getMyConnectionsRequest({ token: user.token }));
      return thunkAPI.fulfillWithValue(respone.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.respone.data);
    }
  }
);
