import api from "./axios";

export const loginUser = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const registerUser = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.patch("/auth/update-profile", data);
  return response.data;
};

export const changePassword = async (data) => {
  const response = await api.patch("/auth/change-password", data);
  return response.data;
};

export const searchUsers = async (query) => {
  const response = await api.get("/auth/search", {
    params: {
      q: query,
    },
  });

  return response.data;
};