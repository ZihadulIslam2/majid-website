"use client";

import { useState } from "react";
import { forgotPasswordApi, resendForgotOtpApi } from "../api/auth.api";
import { ForgotPasswordResponse } from "../types/auth.types";

export function useForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ForgotPasswordResponse | null>(null);

  const forgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await forgotPasswordApi(email);
      if (response.success) {
        setData(response.data || null);
        return response;
      } else {
        setError(response.message || "Request failed");
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

  const resendForgotOtp = async (token?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await resendForgotOtpApi(token);
      return response;
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

  return { forgotPassword, resendForgotOtp, loading, error, data };
}
