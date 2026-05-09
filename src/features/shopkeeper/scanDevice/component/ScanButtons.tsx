"use client";

import { Loader2, Upload } from "lucide-react";

interface ScanButtonsProps {
  onScan: () => void;
  onBulkClick: () => void;
  isScanning: boolean;
  isDisabled: boolean;
  imeiCount?: number;
}

export const ScanButtons = ({
  onScan,
  onBulkClick,
  isScanning,
  isDisabled,
  imeiCount = 0,
}: ScanButtonsProps) => {
  const isBulk = imeiCount > 1;
  const buttonText = isScanning
    ? "Scanning..."
    : isBulk
      ? `Check ${imeiCount} Devices`
      : "Scan Device";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button
        onClick={onScan}
        disabled={isDisabled}
        className="w-full bg-[#84CC16] hover:bg-[#76b813] text-white font-black py-4 rounded-full shadow-lg shadow-lime-500/20 transition-all text-xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
      >
        {isScanning ? (
          <>
            <Loader2 size={24} className="animate-spin" />
            {buttonText}
          </>
        ) : (
          buttonText
        )}
      </button>
      <button
        onClick={onBulkClick}
        disabled={isScanning}
        className="w-full bg-white border-2 border-gray-100 text-[#0F172A] hover:border-[#84CC16]/30 hover:bg-gray-50 font-black py-4 rounded-full transition-all text-xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer"
      >
        <Upload size={24} />
        Upload CSV/Excel
      </button>
    </div>
  );
};
