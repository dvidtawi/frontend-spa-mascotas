import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api/axios";

import {
  saveTokens,
  clearTokens,
  getUserFromToken,
  getRefreshToken,
} from "../utils/token";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const existingUser =
      getUserFromToken();

    if (existingUser) {
      setUser(existingUser);
    }

    setLoading(false);

  }, []);

  const login = async (data) => {

    const res = await api.post(
      "/auth/login",
      data
    );

    if (res.data.requires2FA) {
      return {
        requires2FA: true,
        primer_inicio: res.data.primer_inicio,
        dos_fa: res.data.dos_fa,
      };
    }

    saveTokens(
      res.data.accessToken,
      res.data.refreshToken
    );

    const decoded = getUserFromToken();
    const userData = {
      ...decoded,
      primer_inicio: res.data.primer_inicio,
      dos_fa: res.data.dos_fa,
      rol: decoded?.rol,
    };

    setUser(userData);

    return {
      ...res.data,
      user: userData,
    };
  };

  const logout = async () => {

    try {

      const refreshToken =
        getRefreshToken();

      if (refreshToken) {

        await api.post(
          "/auth/logout",
          {
            refreshToken
          }
        );
      }

    } catch (err) {
      console.log(err);
    }

    clearTokens();

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);