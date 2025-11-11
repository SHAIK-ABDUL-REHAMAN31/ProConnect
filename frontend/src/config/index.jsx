import axios from "axios";

export const BASE_URL = "https://proconnect-hm0q.onrender.com";

export const clientServer = axios.create({
  baseURL: BASE_URL,
});
