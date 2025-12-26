import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const getTasks = () => API.get("/tasks");
export const addTask = (task) => API.post("/tasks", task);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
export const toggleTask = (id) => API.put(`/tasks/${id}`);

