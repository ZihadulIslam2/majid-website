"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, LogIn, Info } from "lucide-react";
import { useRouter } from "next/navigation";

interface GuestLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  badge?: string;
}

export function GuestLoginModal({
  isOpen,
  onClose,
  title = "Login Required",
  message = "To check device IMEI details and access advanced reports, please login to your account first.",
  badge = "Only registered shopkeepers can verify devices.",
}: GuestLoginModalProps) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-card rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-2xl overflow-hidden border border-border mx-2 z-10"
          >
            {/* Close Button */}
            <div className="absolute top-0 right-0 p-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col items-center text-center space-y-5 md:space-y-6 pt-4">
              {/* Graphic/Icon with modern styling */}
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#84CC16]/10 dark:bg-[#84CC16]/20 rounded-2xl md:rounded-3xl flex items-center justify-center text-[#84CC16] shadow-inner">
                <LogIn
                  size={32}
                  className="md:w-[40px] md:h-[40px] animate-pulse"
                  strokeWidth={2.5}
                />
              </div>

              {/* Title & message */}
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
                  {title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground font-semibold leading-relaxed px-2">
                  {message}
                </p>
              </div>

              {/* Buttons */}
              <div className="w-full flex flex-col gap-3">
                <button
                  onClick={() => {
                    onClose();
                    router.push("/auth/login");
                  }}
                  className="w-full py-3.5 bg-[#84CC16] hover:bg-[#84CC16]/90 text-white font-extrabold rounded-xl md:rounded-2xl transition shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs md:text-sm cursor-pointer"
                >
                  Go to Login
                </button>
                <button
                  onClick={() => {
                    onClose();
                    router.push("/auth/sign-up");
                  }}
                  className="w-full py-3.5 bg-foreground text-background font-extrabold rounded-xl md:rounded-2xl hover:opacity-90 transition active:scale-95 text-xs md:text-sm uppercase tracking-widest cursor-pointer"
                >
                  Create An Account
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3.5 bg-muted text-muted-foreground font-black rounded-xl md:rounded-2xl hover:bg-muted/80 transition active:scale-95 text-xs md:text-sm uppercase tracking-widest cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {/* Info Badge */}
              {badge && (
                <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold text-sky-600 bg-sky-50 dark:bg-sky-950/30 px-4 py-2 rounded-full border border-sky-100 dark:border-sky-900/50">
                  <Info size={14} className="shrink-0" />
                  <span className="truncate">{badge}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
