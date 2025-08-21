import axios from "axios";

// Base URL for API calls
const BASE_URL = "http://localhost:8000";

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
