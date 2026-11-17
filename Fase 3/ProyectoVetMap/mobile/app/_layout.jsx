import { useEffect } from "react";
import {
  Stack,
  useRouter,
  useSegments,
} from "expo-router";

import {
  AuthProvider,
  useAuth,
} from "../context/AuthContext";

const ROLE_ROUTES = new Set([
  "owner",
  "vet",
  "store",
  "admin",
  "driver",
]);

const PUBLIC_ROUTES = new Set([
  "login",
  "register",
  "reset-password",
  "public",
]);

function roleHome(role) {
  if (role === "owner") return "/owner";
  if (role === "vet") return "/vet";
  if (role === "store") return "/store";
  if (role === "admin") return "/admin";
  if (role === "driver") return "/driver";
  return "/login";
}

function RootNavigator() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const firstSegment =
      segments[0] || "";

    if (!user) {
      if (
        ROLE_ROUTES.has(firstSegment) ||
        firstSegment === "common"
      ) {
        router.replace("/login");
      }

      return;
    }

    if (
      firstSegment === "" ||
      PUBLIC_ROUTES.has(firstSegment)
    ) {
      router.replace(
        roleHome(user.role)
      );
      return;
    }

    if (
      ROLE_ROUTES.has(firstSegment) &&
      firstSegment !== user.role
    ) {
      router.replace(
        roleHome(user.role)
      );
    }
  }, [
    loading,
    user?.id,
    user?.role,
    segments.join("/"),
    router,
  ]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#F4F8F7",
        },
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
