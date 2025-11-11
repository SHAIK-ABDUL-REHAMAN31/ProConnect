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
      } else {
        return thunkAPI.rejectWithValue({ message: "No token received" });
      }

      return thunkAPI.fulfillWithValue(response.data.token);
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
          connectionId: userData.user_id,
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
  async (user, thunkAPI) => {
    try {
      const respone = await clientServer.get("/user/what_are_my_connections", {
        params: {
          token: user.token,
        },
      });

      return thunkAPI.fulfillWithValue(respone.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.respone.data);
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
