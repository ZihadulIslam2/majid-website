/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ArrowLeft,
  Smartphone,
  Sparkles,
  ShieldCheck,
  Wallet,
  Lock,
  Cpu,
  Check,
  AlertTriangle,
  Gauge,
  Database,
  Tag,
  Shield,
  Info,
  Zap,
} from "lucide-react";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { CertificatePDF } from "./CertificatePDF";
import {
  BatchImeiResponse,
  BatchImeiItemResult,
} from "../../scanDevice/types/scanDevice.types";

interface BulkResultViewProps {
  batchResult: BatchImeiResponse | null;
  onClear: () => void;
  onBack: () => void;
  onDownloadCertificate: (
    elementIds: string[],
    filename: string,
  ) => Promise<void>;
  isDownloading: boolean;
}

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "clean":
      return "bg-[#84CC16] shadow-lime-500/20";
    case "warning":
      return "bg-orange-500 shadow-orange-500/20";
    default:
      return "bg-[#3B82F6] shadow-blue-500/20";
  }
};

// Helper function to get risk color
const getRiskColor = (score: number) => {
  if (score <= 25)
    return {
      stroke: "#22c55e",
      text: "text-emerald-400",
      bg: "bg-emerald-500/10",
    };
  if (score <= 60)
    return { stroke: "#f59e0b", text: "text-amber-400", bg: "bg-amber-500/10" };
  return { stroke: "#ef4444", text: "text-red-400", bg: "bg-red-500/10" };
};

// Risk Arc Component
function RiskArc({ score }: { score: number }) {
  const r = 42;
  const cx = 56;
  const cy = 56;
  const circumference = 2 * Math.PI * r;
  const progress = Math.max(0, Math.min(score, 100));
  const arcLength = (270 / 360) * circumference;
  const filledLength = (progress / 100) * arcLength;
  const { stroke, text } = getRiskColor(score);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 112, height: 112 }}
    >
      <svg width={112} height={112} style={{ transform: "rotate(135deg)" }}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth={8}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth={8}
          strokeDasharray={`${filledLength} ${circumference}`}
          strokeLinecap="round"
          style={{
            transition: "stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className={`text-2xl font-black tabular-nums ${text}`}>{score}</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mt-0.5">
          /100
        </p>
      </div>
    </div>
  );
}

// Helper function to get check icon
const getCheckIcon = (title?: string) => {
  switch (title) {
    case "Global Blacklist":
      return ShieldCheck;
    case "Carrier Financing":
      return Wallet;
    case "Hardware Lock":
      return Lock;
    case "Part Authenticity":
      return Cpu;
    default:
      return ShieldCheck;
  }
};

// Helper function to get checks array
const getChecksArray = (result: any) => {
  if (!result?.checks) return [];
  if (typeof result.checks === "object" && !Array.isArray(result.checks)) {
    return Object.values(result.checks);
  }
  return Array.isArray(result.checks) ? result.checks : [];
};

// Helper function to parse provider data rows from HTML
const parseProviderRows = (
  html: string,
): { label: string; value: string }[] => {
  if (!html) return [];

  const cleanText = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(font|span|b|strong|i|em)[^>]*>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .trim();

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

// Helper function to get device image from HTML
const getDeviceImage = (html: string): string | null => {
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/);
  return imgMatch ? imgMatch[1] : null;
};

// Helper function to get icon for provider row
const getProviderRowIcon = (label: string) => {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes("device")) return <Smartphone size={18} />;
  if (lowerLabel.includes("imei")) return <Tag size={18} />;
  if (lowerLabel.includes("serial")) return <Database size={18} />;
  if (lowerLabel.includes("warranty")) return <Shield size={18} />;
  if (lowerLabel.includes("coverage")) return <Check size={18} />;
  if (lowerLabel.includes("notice")) return <AlertTriangle size={18} />;
  if (lowerLabel.includes("activation")) return <Zap size={18} />;
  return <Info size={18} />;
};

// Helper function to get color scheme for provider row
const getProviderRowColor = (label: string) => {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes("device"))
    return {
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      iconBg: "bg-indigo-100",
      text: "text-indigo-600",
    };
  if (lowerLabel.includes("imei"))
    return {
      bg: "bg-purple-50",
      border: "border-purple-200",
      iconBg: "bg-purple-100",
      text: "text-purple-600",
    };
  if (lowerLabel.includes("serial"))
    return {
      bg: "bg-cyan-50",
      border: "border-cyan-200",
      iconBg: "bg-cyan-100",
      text: "text-cyan-600",
    };
  if (lowerLabel.includes("warranty"))
    return {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      iconBg: "bg-emerald-100",
      text: "text-emerald-600",
    };
  if (lowerLabel.includes("coverage"))
    return {
      bg: "bg-blue-50",
      border: "border-blue-200",
      iconBg: "bg-blue-100",
      text: "text-blue-600",
    };
  if (lowerLabel.includes("notice"))
    return {
      bg: "bg-amber-50",
      border: "border-amber-200",
      iconBg: "bg-amber-100",
      text: "text-amber-600",
    };
  if (lowerLabel.includes("activation"))
    return {
      bg: "bg-green-50",
      border: "border-green-200",
      iconBg: "bg-green-100",
      text: "text-green-600",
    };
  return {
    bg: "bg-gray-50",
    border: "border-gray-100",
    iconBg: "bg-gray-100",
    text: "text-gray-500",
  };
};

export const BulkResultView = ({
  batchResult,
  onClear,
  onDownloadCertificate,
  isDownloading,
  onBack,
}: BulkResultViewProps) => {
  const [selectedBatchIndex, setSelectedBatchIndex] = useState(0);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const batchRows = useMemo(() => batchResult?.data ?? [], [batchResult]);
  const successfulBatchRows = useMemo(
    () =>
      batchRows.filter(
        (
          row,
        ): row is BatchImeiItemResult & {
          data: NonNullable<typeof row.data>;
        } => Boolean(row.ok && row.data),
      ),
    [batchRows],
  );
  const selectedBatchRow = useMemo(
    () => batchRows[selectedBatchIndex] ?? null,
    [batchRows, selectedBatchIndex],
  );

  // Get provider data from selected row
  const currentProviderData = selectedBatchRow?.data?.providerData as
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

  const providerHTML = currentProviderData?.result || "";
  const providerRows = parseProviderRows(providerHTML);
  const deviceImage = getDeviceImage(providerHTML);
  const deviceNameFromProvider = providerRows.find(
    (r) => r.label === "Device",
  )?.value;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsSelectOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectedBatchIndexChange = useCallback((value: number) => {
    setSelectedBatchIndex(value);
    setIsSelectOpen(false);
  }, []);

  const handlePrevClick = useCallback(() => {
    setSelectedBatchIndex((current) => Math.max(current - 1, 0));
  }, []);

  const handleNextClick = useCallback(() => {
    setSelectedBatchIndex((current) =>
      Math.min(current + 1, batchRows.length - 1),
    );
  }, [batchRows.length]);

  const handleDownloadSelectedBulkCertificate = useCallback(() => {
    if (!selectedBatchRow?.ok || !selectedBatchRow.data) return;
    onDownloadCertificate(
      [`certificate-pdf-bulk-${selectedBatchIndex}`],
      `Certificate_${selectedBatchRow.imei}.pdf`,
    );
  }, [onDownloadCertificate, selectedBatchIndex, selectedBatchRow]);

  const handleDownloadAllBulkCertificates = useCallback(() => {
    if (successfulBatchRows.length === 0) return;
    onDownloadCertificate(
      successfulBatchRows.map(
        (_, index) => `certificate-pdf-bulk-success-${index}`,
      ),
      `Bulk_IMEI_Certificates_${new Date().toISOString().slice(0, 10)}.pdf`,
    );
  }, [onDownloadCertificate, successfulBatchRows]);

  if (!batchResult) return null;

  const currentData = selectedBatchRow?.data;
  const checksArray = currentData ? getChecksArray(currentData) : [];
  const riskScore = currentData?.riskMeter?.score || 0;
  const riskColor = getRiskColor(riskScore);
  const statusTone = getStatusColor(currentData?.deviceStatus || "");

  return (
    <div className="w-full space-y-6 pb-10 font-poppins">
      {/* Back Button */}
      <button
        onClick={() => {
          console.log("Back button clicked");
          onBack();
        }}
        className="flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] font-bold transition group cursor-pointer"
      >
        <ArrowLeft
          size={18}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Scan another device
      </button>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] border border-gray-100 bg-white p-6 md:p-8 shadow-sm"
      >
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#84CC16]">
              Reports
            </p>
            <h2 className="mt-2 text-2xl md:text-3xl font-black text-[#0F172A]">
              Bulk IMEI Scan Results
            </h2>
            <p className="mt-2 text-sm font-medium text-[#64748B] max-w-2xl">
              Results are rendered directly on this page and organized one at a
              time for easier review.
            </p>
          </div>

          <button
            onClick={() => {
              console.log("Clear button clicked");
              onClear();
            }}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-black text-[#64748B] transition hover:bg-gray-50 hover:text-[#0F172A]"
          >
            Clear Results
          </button>
        </div>

        {/* Summary Cards */}
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-5 w-5 text-slate-500" />
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                Total
              </span>
            </div>
            <p className="mt-3 text-2xl font-black text-slate-900">
              {batchResult.summary.total}
            </p>
          </div>
          <div className="rounded-2xl border border-lime-100 bg-lime-50 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-lime-600" />
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-lime-700">
                Success
              </span>
            </div>
            <p className="mt-3 text-2xl font-black text-lime-700">
              {batchResult.summary.successCount}
            </p>
          </div>
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-red-600">
                Failed
              </span>
            </div>
            <p className="mt-3 text-2xl font-black text-red-600">
              {batchResult.summary.failedCount}
            </p>
          </div>
        </div>

        {/* Download All Button */}
        {successfulBatchRows.length > 0 && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleDownloadAllBulkCertificates}
              disabled={isDownloading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#84CC16] px-5 py-3 text-sm font-black text-white transition hover:bg-[#76b813] disabled:cursor-wait disabled:opacity-70"
            >
              {isDownloading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              Download All Certificates ({successfulBatchRows.length})
            </button>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="mt-6 rounded-[28px] border border-gray-100 bg-[#F8FAFC] p-4 md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-[#94A3B8]">
                Navigate Results
              </h3>
              <p className="mt-2 text-sm font-semibold text-[#64748B]">
                Use the selector or next and previous controls to inspect each
                IMEI report.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
              {/* Custom Dropdown */}
              <div className="relative" ref={selectRef}>
                <button
                  onClick={() => setIsSelectOpen(!isSelectOpen)}
                  className="w-full min-w-[260px] flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:border-slate-300 transition-all"
                >
                  <span className="truncate">
                    {selectedBatchRow
                      ? `Row ${selectedBatchRow.rowNumber} - ${selectedBatchRow.imei} ${!selectedBatchRow.ok ? "(Failed)" : ""}`
                      : "Select a result"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${isSelectOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isSelectOpen && (
                  <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                    {batchRows.map((row, index) => (
                      <button
                        key={`${row.rowNumber}-${row.imei}-${index}`}
                        onClick={() => handleSelectedBatchIndexChange(index)}
                        className={`w-full px-4 py-2 text-left text-sm font-medium transition-colors hover:bg-slate-50 ${
                          selectedBatchIndex === index
                            ? "bg-[#84CC16]/10 text-[#84CC16]"
                            : "text-slate-700"
                        }`}
                      >
                        {`Row ${row.rowNumber} - ${row.imei} ${!row.ok ? "(Failed)" : ""}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handlePrevClick}
                disabled={selectedBatchIndex === 0}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>

              <button
                onClick={handleNextClick}
                disabled={selectedBatchIndex === batchRows.length - 1}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Selected Result Details - Like SingleResultView */}
      {selectedBatchRow?.ok && selectedBatchRow.data ? (
        <motion.div
          key={selectedBatchIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] overflow-hidden"
        >
          {/* Hero Header Section */}
          <div>
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[32px] overflow-hidden shadow-xl">
              <div className="relative px-6 py-8 md:px-8 md:py-10">
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
                          {deviceNameFromProvider ||
                            currentData?.deviceName ||
                            "Unknown Device"}
                        </h2>
                        <p className="mt-1 font-mono text-xs font-semibold text-white/40 tracking-widest">
                          IMEI: {currentProviderData?.imei || currentData?.imei}
                        </p>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-white ${statusTone}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        {currentData?.deviceStatus || "Unknown"}
                      </span>
                      {selectedBatchRow.provider && (
                        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/50">
                          {selectedBatchRow.provider}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Risk Arc + AI Insight */}
                  <div className="flex items-center gap-6 bg-white/5 rounded-2xl p-4 backdrop-blur-sm">
                    <RiskArc score={riskScore} />
                    <div className="max-w-[200px]">
                      <div className="flex items-center gap-1 mb-1">
                        <Sparkles size={12} className="text-[#84CC16]" />
                        <span className="text-[9px] font-black text-[#84CC16] uppercase tracking-wider">
                          {currentData?.aiInsight?.title || "AI INSIGHT"}
                        </span>
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed">
                        {currentData?.aiInsight?.message ||
                          "No insight available"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metrics Strip */}
                <div className="relative mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    {
                      label: "Device Status",
                      value: currentData?.deviceStatus || "Unknown",
                      icon: Shield,
                    },
                    {
                      label: "Risk Level",
                      value: currentData?.riskMeter?.label || "Unknown",
                      icon: Gauge,
                      accent: riskColor.text,
                    },
                    {
                      label: "Market Value",
                      value: `$${currentData?.marketValue?.amount?.toFixed(2) || "0.00"} ${currentData?.marketValue?.currency || "USD"}`,
                      icon: Tag,
                    },
                    {
                      label: "Provider",
                      value: selectedBatchRow.provider || "IMEI Service",
                      icon: Database,
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="rounded-2xl px-4 py-3 bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center gap-2 text-white/35">
                          <Icon size={14} />
                          <p className="text-[10px] font-black uppercase tracking-[0.18em]">
                            {item.label}
                          </p>
                        </div>
                        <p
                          className={`mt-2 text-sm font-black break-words ${item.accent || "text-white"}`}
                        >
                          {item.value}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Provider Data Section - Device Specifications */}
          {providerRows.length > 0 && (
            <div className="py-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#84CC16]/10 rounded-xl">
                  <Smartphone size={20} className="text-[#84CC16]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-tight">
                    Device Specifications
                  </h3>
                  <p className="text-[11px] font-medium text-gray-400">
                    Detailed breakdown from{" "}
                    {selectedBatchRow.provider || "Network Provider"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providerRows.map((row, idx) => {
                  const labelLower = row.label.toLowerCase();

                  // Logical color & icon mapping
                  const isPositive =
                    labelLower.includes("warranty") ||
                    labelLower.includes("coverage") ||
                    labelLower.includes("valid");
                  const isNeutral =
                    labelLower.includes("model") ||
                    labelLower.includes("color") ||
                    labelLower.includes("capacity");

                  let statusClass = "bg-slate-50 text-slate-500";
                  let Icon = Tag;

                  if (isPositive) {
                    statusClass = "bg-emerald-50 text-emerald-500";
                    Icon = ShieldCheck;
                  } else if (
                    labelLower.includes("carrier") ||
                    labelLower.includes("sim") ||
                    labelLower.includes("activation")
                  ) {
                    statusClass = "bg-blue-50 text-blue-500";
                    Icon = Zap;
                  } else if (isNeutral) {
                    statusClass = "bg-slate-50 text-slate-600";
                    Icon = Smartphone;
                  } else if (labelLower.includes("imei")) {
                    statusClass = "bg-purple-50 text-purple-500";
                    Icon = Tag;
                  } else if (labelLower.includes("serial")) {
                    statusClass = "bg-cyan-50 text-cyan-500";
                    Icon = Database;
                  }

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#84CC16]/30 hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          {/* Icon Box like Security Checks */}
                          <div
                            className={`p-3 rounded-xl ${statusClass} shrink-0`}
                          >
                            <Icon size={22} strokeWidth={2.5} />
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              {row.label}
                            </h4>
                            <p className="text-[15px] font-bold text-[#0F172A] leading-snug break-words">
                              {row.value}
                            </p>
                          </div>
                        </div>

                        {/* Status Indicator */}
                        <div className="hidden sm:flex h-6 w-6 rounded-full bg-gray-50 items-center justify-center border border-gray-100">
                          <div
                            className={`h-1.5 w-1.5 rounded-full ${isPositive ? "bg-emerald-500" : "bg-slate-300"}`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Security Checks */}
          <div className="px-6 pb-6">
            <h3 className="text-sm font-black text-[#0F172A] mb-4 flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#84CC16]" />
              Security Checks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {checksArray.map((check: any, idx: number) => {
                const Icon = getCheckIcon(check?.title);
                const statusClass =
                  check.status === "passed"
                    ? "bg-emerald-50 text-emerald-500"
                    : check.status === "warning"
                      ? "bg-amber-50 text-amber-500"
                      : "bg-red-50 text-red-500";
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${statusClass}`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-700">
                          {check?.title || "Check"}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5 max-w-[200px]">
                          {check?.description || "No description"}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        check.status === "passed"
                          ? "bg-emerald-500 text-white"
                          : check.status === "warning"
                            ? "bg-amber-500 text-white"
                            : "bg-red-500 text-white"
                      }`}
                    >
                      {check.status === "passed" ? (
                        <Check size={14} strokeWidth={3} />
                      ) : (
                        <AlertTriangle size={14} strokeWidth={3} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metadata Footer */}
          {/* Metadata Footer */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-50 rounded-3xl p-6 border border-gray-100 mx-6 mb-6"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">
                  Provider
                </p>
                <p className="text-sm font-bold text-gray-700">
                  {selectedBatchRow.provider || "API"}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">
                  Service ID
                </p>
                <p className="text-sm font-bold text-gray-700">
                  {selectedBatchRow.serviceId ?? "N/A"}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">
                  Row Number
                </p>
                <p className="text-sm font-bold text-gray-700">
                  {selectedBatchRow.rowNumber} / {batchRows.length}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">
                  Balance
                </p>
                <p className="text-sm font-bold text-gray-700">
                  {currentProviderData?.balance !== undefined
                    ? `$${currentProviderData.balance.toFixed(3)}`
                    : "N/A"}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : selectedBatchRow ? (
        <motion.div
          key={selectedBatchIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-red-100 bg-red-50 p-8 shadow-sm"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-red-500">
            Failed Result
          </p>
          <h3 className="mt-2 text-2xl font-black text-red-700">
            Row {selectedBatchRow.rowNumber} could not be processed
          </h3>
          <p className="mt-3 text-sm font-semibold text-red-600">
            {selectedBatchRow.message}
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-red-100 bg-white px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-400">
                Row
              </p>
              <p className="mt-2 text-sm font-bold text-slate-900">
                {selectedBatchRow.rowNumber}
              </p>
            </div>
            <div className="rounded-2xl border border-red-100 bg-white px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-400">
                IMEI
              </p>
              <p className="mt-2 text-sm font-bold text-slate-900 break-all">
                {selectedBatchRow.imei}
              </p>
            </div>
            <div className="rounded-2xl border border-red-100 bg-white px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-400">
                Service ID
              </p>
              <p className="mt-2 text-sm font-bold text-slate-900">
                {selectedBatchRow.serviceId ?? "N/A"}
              </p>
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* Hidden Certificate Containers */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: "-10000px",
          width: "1100px",
          pointerEvents: "none",
          zIndex: -1,
          overflow: "hidden",
        }}
      >
        {successfulBatchRows.map((row, index) => (
          <CertificatePDF
            key={`bulk-certificate-${row.rowNumber}-${row.imei}-${index}`}
            data={row.data}
            id={`certificate-pdf-bulk-success-${index}`}
            providerName={row.provider}
            serviceId={row.serviceId}
          />
        ))}
        {selectedBatchRow?.ok && selectedBatchRow.data && (
          <CertificatePDF
            key={`selected-bulk-certificate-${selectedBatchIndex}`}
            data={selectedBatchRow.data}
            id={`certificate-pdf-bulk-${selectedBatchIndex}`}
            providerName={selectedBatchRow.provider}
            serviceId={selectedBatchRow.serviceId}
          />
        )}
      </div>
    </div>
  );
};
