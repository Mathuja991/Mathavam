import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getChildByChildNo = (childNo) => {
  return apiClient.get(`/child/${childNo}`);
};

export const createSessionLog = (payload) =>
  axios.post("/api/sessions", payload);

export const updateSessionLog = (id, payload) =>
  axios.put(`/api/sessions/${id}`, payload);

export const listSessions = (params) =>
  axios.get("/api/sessions", { params });

export const getTodaySessions = (params) =>
  axios.get("/api/sessions/today", { params });

export const getAllChildren = () => {
  return apiClient.get("/child");


};
