"use client";

import { useState } from "react";
import { loginUserApi } from "../api/auth.api";
import { AuthResponseData, LoginPayload } from "../types/auth.types";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AuthResponseData | null>(null);

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginUserApi(payload);
      if (response.success) {
        setData(response.data || null);
        return response;
      } else {
        setError(response.message || "Login failed");
        return response;
      }
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error, data };
}
