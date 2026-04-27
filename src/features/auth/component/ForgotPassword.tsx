"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForgotPassword } from "../hooks/useforgotpassword";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const { forgotPassword, loading, error } = useForgotPassword();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await forgotPassword(email);
      if (response.success) {
        // Store token temporarily for verification step
        if (response.data?.accessToken) {
          localStorage.setItem("temp_auth_token", response.data.accessToken);
        }
        // Redirect to OTP verify with a flag indicating it's for password reset
        router.push("/auth/otp-verify?type=reset");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 font-poppins relative">
      {/* Back Button */}
      <Link
        href="/auth/login"
        className="absolute top-6 left-6 sm:top-10 sm:left-10 flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50 transition-all group font-bold text-sm"
      >
        <ArrowLeft
          size={18}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Back to Login
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[580px] bg-white rounded-[24px] sm:rounded-[40px] p-6 sm:p-10 md:p-14 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] border border-gray-100"
      >
        {/* Header */}
        <div className="mb-4 sm:mb-6 text-left">
          <div className="w-16 h-16 bg-[#84CC16]/10 rounded-2xl flex items-center justify-center mb-6">
            <Mail className="text-[#84CC16]" size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0F172A] mb-2 sm:mb-4 tracking-tight">
            Forgot Password?
          </h1>
          <p className="text-[#64748B] text-sm sm:text-[15px] font-medium leading-relaxed">
            No worries! Enter your email address below and we&apos;ll send you a
            code to reset your password.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-semibold text-center">
              {error}
            </div>
          )}

          <div>
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 sm:px-8 sm:py-5 rounded-full border border-gray-200 focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/5 outline-none transition-all text-[#1E293B] placeholder:text-gray-400 font-semibold text-sm sm:text-base"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#84CC16] text-white font-black py-3 sm:py-3 rounded-full shadow-sm shadow-lime-500/20 text-base sm:text-lg mt-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={20} />}
            {loading ? "Sending Code..." : "Send Code"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center mt-6 text-sm sm:text-[15px] font-bold text-[#64748B]">
          Remember your password?{" "}
          <Link
            href="/auth/login"
            className="text-[#0F172A] hover:text-[#84CC16] transition border-b-2 border-transparent hover:border-[#84CC16] ml-1"
          >
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
