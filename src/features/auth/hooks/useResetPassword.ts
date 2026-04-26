"use client";

import { useState } from "react";
import { verifyOtpApi, resetPasswordApi } from "../api/auth.api";
import { VerifyOtpResponse } from "../types/auth.types";

export function useResetPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<VerifyOtpResponse | null>(null);

  const verifyOtp = async (otp: string, token?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await verifyOtpApi(otp, token);
      if (response.success) {
        setData(response.data || null);
        return response;
      } else {
        setError(response.message || "Verification failed");
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

  const resetPassword = async (newPassword: string, token?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await resetPasswordApi(newPassword, token);
      if (!response.success) {
        setError(response.message || "Password reset failed");
      }
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

  return { verifyOtp, resetPassword, loading, error, data };
}
