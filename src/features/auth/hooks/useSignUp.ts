"use client";

import { useState } from "react";
import { registerUserApi } from "../api/auth.api";
import { AuthResponseData, RegisterPayload } from "../types/auth.types";

export function useSignUp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AuthResponseData | null>(null);

  const signUp = async (payload: RegisterPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await registerUserApi(payload);
      if (response.success) {
        setData(response.data || null);
        return response;
      } else {
        setError(response.message || "Registration failed");
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

  return { signUp, loading, error, data };
}
