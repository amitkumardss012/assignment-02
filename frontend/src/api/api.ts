import axios from "axios";
import { ENV } from "../lib/env";

const api = axios.create({
  baseURL: `${ENV.API_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

export default api;
