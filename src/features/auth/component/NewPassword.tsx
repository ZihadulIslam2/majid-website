"use client";

import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useResetPassword } from "../hooks/useResetPassword";
import { useRouter } from "next/navigation";

export default function NewPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { resetPassword, loading, error } = useResetPassword();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const token = localStorage.getItem("temp_auth_token") || undefined;

    try {
      const response = await resetPassword(newPassword, token);
      if (response.success) {
        localStorage.removeItem("temp_auth_token");
        alert(
          "Password updated successfully! Please login with your new password.",
        );
        router.push("/auth/login");
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
            <KeyRound className="text-[#84CC16]" size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0F172A] mb-2 sm:mb-4 tracking-tight">
            Set New Password
          </h1>
          <p className="text-[#64748B] text-sm sm:text-[15px] font-medium leading-relaxed">
            Please create a new password that you haven&apos;t used before.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-semibold text-center">
              {error}
            </div>
          )}

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-6 py-4 sm:px-8 sm:py-5 rounded-full border border-gray-200 focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/5 outline-none transition-all text-[#1E293B] placeholder:text-gray-400 font-semibold text-sm sm:text-base"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0F172A] transition"
            >
              {showPassword ? (
                <EyeOff size={20} className="sm:w-[22px] sm:h-[22px]" />
              ) : (
                <Eye size={20} className="sm:w-[22px] sm:h-[22px]" />
              )}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-6 py-4 sm:px-8 sm:py-5 rounded-full border border-gray-200 focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/5 outline-none transition-all text-[#1E293B] placeholder:text-gray-400 font-semibold text-sm sm:text-base"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0F172A] transition"
            >
              {showConfirmPassword ? (
                <EyeOff size={20} className="sm:w-[22px] sm:h-[22px]" />
              ) : (
                <Eye size={20} className="sm:w-[22px] sm:h-[22px]" />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#84CC16] text-white font-black py-3 sm:py-3 rounded-full shadow-sm shadow-lime-500/20 text-base sm:text-lg mt-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={20} />}
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
