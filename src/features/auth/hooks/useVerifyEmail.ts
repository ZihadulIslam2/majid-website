"use client";

import { useState } from "react";
import { verifyEmailApi, resendOtpApi } from "../api/auth.api";

export function useVerifyEmail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyEmail = async (otp: string, token?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await verifyEmailApi(otp, token);
      if (!response.success) {
        setError(response.message || "Verification failed");
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

  const resendOtp = async (token?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await resendOtpApi(token);
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

  return { verifyEmail, resendOtp, loading, error };
}
