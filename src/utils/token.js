import { jwtDecode } from "jwt-decode";

export const saveTokens = (accessToken, refreshToken) => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
};

export const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};

export const getRefreshToken = () => {
  return localStorage.getItem("refreshToken");
};

export const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

export const getUserFromToken = () => {
  const token = getAccessToken();

  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};