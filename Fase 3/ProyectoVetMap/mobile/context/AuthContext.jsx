import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getMe,
  loginUser,
  registerUser,
  updateMe,
} from "../services/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "vetmap_mobile_token";

/*
  WEB:
  sessionStorage = sesión independiente por pestaña.

  Resultado:
  - Pestaña 1 puede tener Dueño.
  - Pestaña 2 puede tener Veterinaria.
  - Pestaña 3 puede tener Tienda.
  - Pestaña 4 puede tener Admin.
  - Cerrar sesión en una NO cierra las demás.

  ANDROID / IOS:
  Se mantiene AsyncStorage para conservar la sesión
  de la aplicación móvil.
*/
const authStorage = {
  async getItem(key) {
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined"
    ) {
      return window.sessionStorage.getItem(key);
    }

    return AsyncStorage.getItem(key);
  },

  async setItem(key, value) {
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined"
    ) {
      window.sessionStorage.setItem(
        key,
        value
      );
      return;
    }

    await AsyncStorage.setItem(
      key,
      value
    );
  },

  async removeItem(key) {
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined"
    ) {
      window.sessionStorage.removeItem(
        key
      );
      return;
    }

    await AsyncStorage.removeItem(key);
  },
};

export function AuthProvider({
  children,
}) {
  const [token, setToken] =
    useState("");
  const [user, setUser] =
    useState(null);
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    restore();
  }, []);

  async function restore() {
    try {
      const saved =
        await authStorage.getItem(
          TOKEN_KEY
        );

      if (!saved) {
        return;
      }

      const profile =
        await getMe(saved);

      setToken(saved);
      setUser(profile);
    } catch {
      await authStorage.removeItem(
        TOKEN_KEY
      );

      setToken("");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(
    email,
    password
  ) {
    const auth =
      await loginUser({
        email,
        password,
      });

    const profile =
      await getMe(
        auth.access_token
      );

    await authStorage.setItem(
      TOKEN_KEY,
      auth.access_token
    );

    setToken(auth.access_token);
    setUser(profile);

    return profile;
  }

  async function signUp(data) {
    await registerUser(data);

    const auth = await loginUser({
      email: data.email,
      password: data.password,
    });

    const profile = await getMe(
      auth.access_token
    );

    await authStorage.setItem(
      TOKEN_KEY,
      auth.access_token
    );

    setToken(auth.access_token);
    setUser(profile);

    return profile;
  }

  async function signOut() {
    /*
      Solo borra la sesión de ESTA pestaña
      cuando se usa VetMap en navegador.
    */
    await authStorage.removeItem(
      TOKEN_KEY
    );

    setToken("");
    setUser(null);
  }

  async function refreshProfile() {
    if (!token) {
      return null;
    }

    const profile =
      await getMe(token);

    setUser(profile);

    return profile;
  }

  async function saveProfile(data) {
    const result =
      await updateMe(
        token,
        data
      );

    if (result?.access_token) {
      await authStorage.setItem(
        TOKEN_KEY,
        result.access_token
      );

      setToken(
        result.access_token
      );
    }

    if (result?.user) {
      setUser(result.user);
    }

    return result;
  }

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      saveProfile,
    }),
    [token, user, loading]
  );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx =
    useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth debe usarse dentro de AuthProvider"
    );
  }

  return ctx;
}
