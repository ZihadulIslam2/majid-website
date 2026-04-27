"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useVerifyEmail } from "../hooks/useVerifyEmail";
import { useResetPassword } from "../hooks/useResetPassword";
import { useRouter, useSearchParams } from "next/navigation";

export default function OtpVerify() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type"); // 'reset' or null (for signup)

  const {
    verifyEmail,
    resendOtp,
    loading: verifyLoading,
    error: verifyError,
  } = useVerifyEmail();
  const {
    verifyOtp,
    loading: resetLoading,
    error: resetError,
  } = useResetPassword();

  const loading = verifyLoading || resetLoading;
  const error = verifyError || resetError;

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length < 6) return;

    const token = localStorage.getItem("temp_auth_token") || undefined;

    try {
      if (type === "reset") {
        const response = await verifyOtp(otpString, token);
        if (response.success) {
          if (response.data?.accessToken) {
            localStorage.setItem("temp_auth_token", response.data.accessToken);
          }
          router.push("/auth/new-password");
        }
      } else {
        const response = await verifyEmail(otpString, token);
        if (response.success) {
          localStorage.removeItem("temp_auth_token");
          router.push("/auth/login?verified=true");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResend = async () => {
    const token = localStorage.getItem("temp_auth_token") || undefined;
    try {
      await resendOtp(token);
      alert("OTP resent successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 font-poppins relative">
      {/* Back Button */}
      <Link
        href={type === "reset" ? "/auth/forgot-password" : "/auth/sign-up"}
        className="absolute top-6 left-6 sm:top-10 sm:left-10 flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50 transition-all group font-bold text-sm"
      >
        <ArrowLeft
          size={18}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Back
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[580px] bg-white rounded-[24px] sm:rounded-[40px] p-6 sm:p-10 md:p-14 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] border border-gray-100"
      >
        {/* Header */}
        <div className="mb-8 text-left">
          <div className="w-16 h-16 bg-[#84CC16]/10 rounded-2xl flex items-center justify-center mb-6">
            <ShieldCheck className="text-[#84CC16]" size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0F172A] mb-2 sm:mb-4 tracking-tight">
            Verify OTP
          </h1>
          <p className="text-[#64748B] text-sm sm:text-[15px] font-medium leading-relaxed">
            We&apos;ve sent a 6-digit verification code to your email address.
            Please enter it below.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-8" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-semibold text-center">
              {error}
            </div>
          )}

          <div className="flex justify-between gap-2 sm:gap-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-full h-12 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl sm:rounded-2xl border border-gray-200 focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/5 outline-none transition-all text-[#0F172A]"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.join("").length < 6}
            className="w-full bg-[#84CC16] text-white font-black py-3 sm:py-4 rounded-full shadow-sm shadow-lime-500/20 text-base sm:text-lg cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={20} />}
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm sm:text-[15px] font-bold text-[#64748B]">
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="text-[#84CC16] hover:underline transition ml-1 font-black"
            >
              Resend Code
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
