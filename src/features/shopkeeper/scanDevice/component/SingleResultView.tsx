"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Loader2,
  Smartphone,
  Sparkles,
  FileText,
} from "lucide-react";
import { IMEIResult } from "../../scanDevice/types/scanDevice.types";
import { CertificatePDF } from "./CertificatePDF";

interface SingleResultViewProps {
  scanResult: IMEIResult;
  singleReportMeta: { provider?: string; serviceId?: number } | null;
  selectedService?: { name?: string; serviceId?: number | null } | null;
  onBack: () => void;
  onDownload: () => void;
  isDownloading: boolean;
}

// Helper function to clean and render HTML content
const cleanHTMLContent = (html: string) => {
  if (!html) return "";
  // Remove extra spaces and clean up
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(font|span|b|strong|i|em)[^>]*>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .trim();
};

// Helper function to parse provider data rows
const parseProviderRows = (
  html: string,
): { label: string; value: string }[] => {
  if (!html) return [];

  const cleanText = cleanHTMLContent(html);
  const rows: { label: string; value: string }[] = [];

  const lines = cleanText.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const colonIndex = trimmed.indexOf(":");
    if (colonIndex > 0) {
      const label = trimmed.substring(0, colonIndex).trim();
      const value = trimmed.substring(colonIndex + 1).trim();
      rows.push({ label, value });
    } else {
      rows.push({ label: "Info", value: trimmed });
    }
  }

  return rows;
};

export const SingleResultView = ({
  scanResult,
  singleReportMeta,
  selectedService,
  onBack,
  onDownload,
  isDownloading,
}: SingleResultViewProps) => {
  // Get provider data from API response
  const providerData = scanResult.providerData as
    | {
        result?: string;
        imei?: string;
        balance?: number;
        price?: string;
        id?: number;
        status?: string;
        ip?: string;
      }
    | undefined;

  const providerHTML = providerData?.result || "";
  const providerRows = parseProviderRows(providerHTML);

  // Get device image from provider HTML if exists
  const getDeviceImage = (html: string): string | null => {
    const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/);
    return imgMatch ? imgMatch[1] : null;
  };

  const deviceImage = getDeviceImage(providerHTML);

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto space-y-8 font-poppins">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] font-bold transition group cursor-pointer"
      >
        <ArrowLeft
          size={18}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Scan another device
      </button>

      {/* Hero Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[32px] overflow-hidden shadow-xl"
      >
        <div className="relative px-6 py-8 md:px-8 md:py-10">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-[#84CC16]/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            {/* Left: Title block */}
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#84CC16]/20">
                  <Sparkles size={11} className="text-[#84CC16]" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#84CC16]">
                  DEVICE REPORT
                </p>
              </div>

              <div className="mt-5 flex items-center gap-4">
                {deviceImage ? (
                  <img
                    src={deviceImage}
                    alt="Device"
                    className="h-14 w-14 object-contain rounded-2xl bg-white/10 p-2"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#84CC16]/15 border border-[#84CC16]/30">
                    <Smartphone size={22} className="text-[#84CC16]" />
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="text-2xl font-black text-white md:text-3xl">
                    {providerRows.find((r) => r.label === "Device")?.value ||
                      "Device Details"}
                  </h2>
                  <p className="mt-1 font-mono text-xs font-semibold text-white/40 tracking-widest">
                    IMEI: {providerData?.imei || scanResult.imei}
                  </p>
                </div>
              </div>

              {/* Status badge */}
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {providerData?.status === "success" ? "Success" : "Completed"}
                </span>
                {singleReportMeta?.provider && (
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/50">
                    {singleReportMeta.provider}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Price & Balance Info */}
            <div className="flex flex-col gap-3 bg-white/5 rounded-2xl p-4 backdrop-blur-sm">
              {providerData?.price && (
                <div className="text-right">
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-wider">
                    Service Price
                  </p>
                  <p className="text-xl font-black text-[#84CC16]">
                    ${parseFloat(providerData.price).toFixed(2)}
                  </p>
                </div>
              )}
              {providerData?.balance !== undefined && (
                <div className="text-right">
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-wider">
                    Balance
                  </p>
                  <p className="text-lg font-black text-white">
                    ${providerData.balance.toFixed(3)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Provider Data Card - Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm"
      >
        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#84CC16]/10 rounded-xl">
              <Smartphone size={18} className="text-[#84CC16]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#0F172A]">
                Device Information
              </h3>
              <p className="text-[10px] text-gray-400">
                Provider:{" "}
                {singleReportMeta?.provider ||
                  selectedService?.name ||
                  "IMEI Service"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {/* Device Image if exists */}
          {deviceImage && (
            <div className="flex justify-center mb-6">
              <img
                src={deviceImage}
                alt="Device"
                className="max-w-[120px] h-auto object-contain"
              />
            </div>
          )}

          {/* Provider Data Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providerRows.map((row, idx) => {
              // Special styling for warranty and coverage
              const isWarranty = row.label.toLowerCase().includes("warranty");
              const isCoverage = row.label.toLowerCase().includes("coverage");
              const isNotice = row.label.toLowerCase().includes("notice");

              let bgColor = "bg-gray-50";
              let borderColor = "border-gray-100";

              if (isWarranty) {
                bgColor = "bg-emerald-50";
                borderColor = "border-emerald-200";
              } else if (isCoverage) {
                bgColor = "bg-blue-50";
                borderColor = "border-blue-200";
              } else if (isNotice) {
                bgColor = "bg-amber-50";
                borderColor = "border-amber-200";
              }

              return (
                <div
                  key={idx}
                  className={`rounded-xl p-4 ${bgColor} border ${borderColor} hover:shadow-md transition-all`}
                >
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                    {row.label}
                  </p>
                  <p className="text-sm font-semibold text-gray-800 break-words">
                    {row.value}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {providerData?.id && (
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                    Reference ID
                  </p>
                  <p className="font-bold text-gray-700">{providerData.id}</p>
                </div>
              )}
              {providerData?.ip && (
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                    IP Address
                  </p>
                  <p className="font-bold text-gray-700 font-mono">
                    {providerData.ip}
                  </p>
                </div>
              )}
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                  Service ID
                </p>
                <p className="font-bold text-gray-700">
                  {singleReportMeta?.serviceId ??
                    selectedService?.serviceId ??
                    "N/A"}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                  Scan Date
                </p>
                <p className="font-bold text-gray-700">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Report Actions */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#84CC16]/10 rounded-xl">
              <FileText size={18} className="text-[#84CC16]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#0F172A]">
                Report Actions
              </h3>
              <p className="text-[10px] text-gray-400">
                Download or share this report
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onDownload}
              disabled={isDownloading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#84CC16] px-6 py-3 text-sm font-black text-white transition hover:bg-[#76b813] shadow-lg shadow-lime-500/20 disabled:opacity-70 disabled:cursor-wait"
            >
              {isDownloading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              {isDownloading ? "Generating..." : "Download PDF Certificate"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Hidden Certificate Container */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: "-10000px",
          width: "1100px",
          minHeight: "800px",
          backgroundColor: "white",
          pointerEvents: "none",
          zIndex: -1,
          overflow: "hidden",
        }}
      >
        <CertificatePDF
          data={scanResult}
          id="certificate-pdf-single"
          providerName={singleReportMeta?.provider || selectedService?.name}
          serviceId={
            singleReportMeta?.serviceId ??
            selectedService?.serviceId ??
            undefined
          }
        />
      </div>
    </div>
  );
};
