import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
    "x-auth-token": token,
  };
};

export const getChildByChildNo = (childNo) => {
  return apiClient.get(`/child/${childNo}`, { headers: getAuthHeaders() });
};

export const createSessionLog = (payload) =>
  apiClient.post("/sessions", payload, { headers: getAuthHeaders() });

export const updateSessionLog = (id, payload) =>
  apiClient.put(`/sessions/${id}`, payload, { headers: getAuthHeaders() });

export const listSessions = (params) =>
  apiClient.get("/sessions", { params, headers: getAuthHeaders() });

export const getTodaySessions = (params) =>
  apiClient.get("/sessions/today", { params, headers: getAuthHeaders() });

export const getAllChildren = () => {
  return apiClient.get("/child", { headers: getAuthHeaders() });
};
