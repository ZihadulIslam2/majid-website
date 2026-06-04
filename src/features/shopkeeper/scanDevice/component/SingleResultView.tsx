/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Loader2,
  Receipt,
  Copy,
  RefreshCw,
  Clock,
} from "lucide-react";
import { IMEIResult } from "../../scanDevice/types/scanDevice.types";
import { CertificatePDF } from "./CertificatePDF";
import { InvoiceModal, InvoiceFormData } from "./InvoiceModal";
import { useCertificateDownload } from "../hooks/useCertificateDownload";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { SmartInvoicePDF } from "./SmartInvoicePDF";

interface SingleResultViewProps {
  scanResult: IMEIResult;
  singleReportMeta: { provider?: string; serviceId?: number } | null;
  selectedService?: { name?: string; serviceId?: number | null } | null;
  onBack: () => void;
  onRegenerate?: (imei: string, serviceId: number) => Promise<void>;
  onDownload?: () => Promise<void> | void;
  isDownloading?: boolean;
}

export const SingleResultView = ({
  scanResult,
  singleReportMeta,
  selectedService,
  onBack,
  onRegenerate,
  onDownload,
  isDownloading: parentIsDownloading,
}: SingleResultViewProps) => {
  const { status } = useSession();
  const isGuest = status === "unauthenticated";
  const { downloadCertificatePdf } = useCertificateDownload();

  const [isCertificateDownloading, setIsCertificateDownloading] =
    useState(false);
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceFormData, setInvoiceFormData] =
    useState<InvoiceFormData | null>(null);
  const [isInvoiceGenerating, setIsInvoiceGenerating] = useState(false);

  // Helper function to safely extract data from various response formats
  const extractData = () => {
    // Get the raw data
    const rawData = (scanResult as any).data || scanResult;
    const parsedProviderData = rawData?.parsedProviderData || {};
    const riskMeterData = rawData?.riskMeter || scanResult?.riskMeter || {};

    // Handle different riskMeter formats (object or number)
    let riskScore = 0;
    let riskLevel = "N/A";

    if (typeof riskMeterData === "number") {
      riskScore = riskMeterData;
      riskLevel = riskScore <= 25 ? "low" : riskScore <= 60 ? "medium" : "high";
    } else if (typeof riskMeterData === "object" && riskMeterData !== null) {
      riskScore = riskMeterData.score || riskMeterData.riskMeter || 0;
      riskLevel =
        riskMeterData.riskLevel ||
        (riskScore <= 25 ? "low" : riskScore <= 60 ? "medium" : "high");
    }

    // Extract device name from various possible fields
    const deviceName =
      parsedProviderData.device ||
      parsedProviderData.model_name ||
      parsedProviderData.model ||
      parsedProviderData.device_configuration?.split(" ")[0] ||
      scanResult.deviceName ||
      "iPhone";

    // Extract IMEI
    const imeiValue =
      parsedProviderData.imei_number ||
      parsedProviderData.imei ||
      parsedProviderData.deviceid ||
      scanResult.imei;

    // Extract IMEI2
    const imei2Value =
      parsedProviderData.imei2 || parsedProviderData.imei_2 || "";

    // Extract Serial Number
    const serialNumber =
      parsedProviderData.serial_number || parsedProviderData.serial || "N/A";

    // Extract EID
    const eidNumber = parsedProviderData.eid || "N/A";

    // Extract Warranty Status
    const warrantyStatus =
      parsedProviderData.warranty_type ||
      (parsedProviderData.limited_warranty === "Yes"
        ? "Limited Warranty"
        : parsedProviderData.limited_warranty === "No"
          ? "No Warranty"
          : parsedProviderData.applecare_description || "Limited Warranty");

    // Extract Purchase Date
    const purchaseDate =
      parsedProviderData.estimated_purchase_date ||
      parsedProviderData.coverage_start_date ||
      "N/A";

    // Extract Coverage End Date
    const coverageEndDate =
      parsedProviderData.warranty_expires ||
      parsedProviderData.coverage_end_date ||
      "N/A";

    // Extract Notice
    const notice = parsedProviderData.notice || "";

    // Extract Replaced Device
    const replacedDevice =
      parsedProviderData.replaced_device === "Yes" ? "Yes" : "No";

    // Extract Activation Status
    const activationStatus =
      parsedProviderData.activation_status ||
      (parsedProviderData.device_activation === "No"
        ? "Not Activated"
        : parsedProviderData.device_activation === "Yes"
          ? "Activated"
          : "Activated");

    // Extract Coverage Benefits
    const coverageBenefits =
      parsedProviderData.coverage_benefits ||
      parsedProviderData.applecare_description ||
      "";

    // Extract Registration Status
    const registrationStatus =
      parsedProviderData.registration_status === "Yes"
        ? "Yes"
        : parsedProviderData.icloud_status === "CLEAN"
          ? "Yes"
          : parsedProviderData.registration_status || "";

    // Extract Temp Coverage
    const tempCoverage =
      parsedProviderData.temp_coverage === "Yes" ? "Yes" : "No";

    // Extract Open Repair
    const openRepair = parsedProviderData.open_repair === "Yes" ? "Yes" : "No";

    // Extract Serial Key
    const serialKey = parsedProviderData.serial_key || "";

    // Extract iCloud Status
    const iCloudLock =
      parsedProviderData.icloud_lock === "ON"
        ? "Locked"
        : parsedProviderData.icloud_lock === "OFF"
          ? "Unlocked"
          : "N/A";

    const iCloudStatus = parsedProviderData.icloud_status || "N/A";

    // Extract MDM Lock
    const mdmLock =
      parsedProviderData.mdm_lock === "ON"
        ? "Locked"
        : parsedProviderData.mdm_lock === "OFF"
          ? "Unlocked"
          : "N/A";

    // Extract Unlock Status
    const unlockStatus =
      parsedProviderData.simpolicy_unlock_status ||
      (parsedProviderData.initial_activation_policy_description?.includes(
        "UNLOCK",
      )
        ? "UNLOCKED"
        : parsedProviderData.last_activation_policy_description?.includes(
              "UNLOCK",
            )
          ? "UNLOCKED"
          : "N/A");

    // Check if there's an error
    const hasError =
      !!parsedProviderData.error_r01 || !!parsedProviderData.failed_reason;
    const errorMessage =
      parsedProviderData.error_r01 || parsedProviderData.failed_reason || "";

    // Check if data is empty
    const isEmpty = Object.keys(parsedProviderData).length === 0;

    return {
      deviceName,
      imeiValue,
      imei2Value,
      serialNumber,
      eidNumber,
      warrantyStatus,
      purchaseDate,
      coverageEndDate,
      notice,
      replacedDevice,
      activationStatus,
      coverageBenefits,
      registrationStatus,
      tempCoverage,
      openRepair,
      serialKey,
      iCloudLock,
      iCloudStatus,
      mdmLock,
      unlockStatus,
      hasError,
      errorMessage,
      isEmpty,
      riskScore,
      riskLevel,
      image: parsedProviderData.image?.src,
      parsedProviderData,
      rawData,
      aiInsight: rawData?.aiInsight,
    };
  };

  const {
    deviceName,
    imeiValue,
    imei2Value,
    serialNumber,
    eidNumber,
    warrantyStatus,
    purchaseDate,
    coverageEndDate,
    notice,
    replacedDevice,
    activationStatus,
    coverageBenefits,
    registrationStatus,
    tempCoverage,
    openRepair,
    serialKey,
    iCloudLock,
    iCloudStatus,
    mdmLock,
    unlockStatus,
    hasError,
    errorMessage,
    isEmpty,
    riskScore,
    riskLevel,
    image,
    aiInsight,
  } = extractData();

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === "N/A") return "N/A";
    // Try to format various date formats
    try {
      // Handle DD/MM/YY format
      if (dateStr.match(/^\d{2}\/\d{2}\/\d{2}$/)) {
        const [day, month, year] = dateStr.split("/");
        const date = new Date(
          2000 + parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
        );
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
      // Handle Month DD, YYYY format
      if (dateStr.match(/^[A-Za-z]+ \d{1,2}, \d{4}$/)) {
        return dateStr;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const handleDownloadCertificate = async () => {
    if (onDownload) {
      await onDownload();
    } else {
      setIsCertificateDownloading(true);
      try {
        await downloadCertificatePdf(
          ["certificate-pdf-single"],
          `Certificate_${scanResult.imei}.pdf`,
        );
      } catch (error) {
        console.error("Certificate download failed:", error);
      } finally {
        setIsCertificateDownloading(false);
      }
    }
  };

  const handleGenerateInvoice = async (formData: InvoiceFormData) => {
    setIsInvoiceGenerating(true);
    setInvoiceFormData(formData);
    setIsInvoiceModalOpen(false);

    try {
      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      });
      await downloadCertificatePdf(
        ["smart-invoice-pdf-container"],
        `Invoice_${scanResult.imei}.pdf`,
      );
    } catch (error) {
      console.error("Invoice generation failed:", error);
    } finally {
      setIsInvoiceGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!onRegenerate) {
      console.error("onRegenerate callback not provided");
      alert(
        "Regenerate function not available. Please refresh the page and try again.",
      );
      return;
    }

    const serviceId = selectedService?.serviceId ?? 6;
    const currentImei = scanResult?.imei;

    if (!currentImei || !/^\d{15}$/.test(currentImei)) {
      alert(`Valid IMEI not found. Found: "${currentImei}"`);
      return;
    }

    setIsRegenerating(true);
    try {
      await onRegenerate(currentImei, serviceId);
      alert("Report regenerated successfully!");
    } catch (error: any) {
      console.error("Regenerate error:", error);
      alert(error.message || "Failed to regenerate report");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    const sections = [
      `Model: ${deviceName}`,
      `IMEI: ${imeiValue}`,
      imei2Value ? `IMEI2: ${imei2Value}` : "",
      `Serial Number: ${serialNumber}`,
      `EID: ${eidNumber}`,
      `Activation Status: ${activationStatus}`,
      `Warranty Type: ${warrantyStatus}`,
      `Warranty Expires: ${formatDate(coverageEndDate)}`,
      `Estimated Purchase Date: ${formatDate(purchaseDate)}`,
      coverageBenefits ? `Coverage Benefits: ${coverageBenefits}` : "",
      registrationStatus ? `Registration Status: ${registrationStatus}` : "",
      `Replaced Device: ${replacedDevice}`,
      tempCoverage === "Yes" ? `Temp Coverage: ${tempCoverage}` : "",
      openRepair === "Yes" ? `Open Repair: ${openRepair}` : "",
      iCloudLock !== "N/A" ? `iCloud Lock: ${iCloudLock}` : "",
      iCloudStatus !== "N/A" ? `iCloud Status: ${iCloudStatus}` : "",
      mdmLock !== "N/A" ? `MDM Lock: ${mdmLock}` : "",
      unlockStatus !== "N/A" ? `Unlock Status: ${unlockStatus}` : "",
      notice ? `Notice: ${notice}` : "",
      serialKey ? `Serial Key: ${serialKey}` : "",
      `Risk Level: ${riskLevel.toUpperCase()}`,
      `Risk Score: ${riskScore}/100`,
      aiInsight?.message ? `AI Insight: ${aiInsight.message}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(sections);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDownloadingNow = parentIsDownloading || isCertificateDownloading;

  // Show error or empty state (without retry button)
  if (hasError || isEmpty) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium mb-4 transition"
          >
            <ArrowLeft size={18} />
            Back to scan
          </button>

          <div className="bg-white border border-slate-200 rounded-[32px] p-8 text-center">
            <div className="text-slate-400 text-6xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">
              {hasError ? "Unable to Retrieve Data" : "No Data Available"}
            </h3>
            <p className="text-slate-500">
              {hasError && errorMessage
                ? errorMessage
                : hasError
                  ? "Could not fetch device information from the service provider"
                  : "No device information available from this service"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium mb-4 transition"
        >
          <ArrowLeft size={18} />
          Back to scan
        </button>

        {/* Regenerate Warning - only show for cached data */}
        {(scanResult as any).oldGenerated === true && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-[32px] p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-full">
                <Clock size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Cached Data Notice
                </p>
                <p className="text-xs text-amber-700">
                  This data is from a previous report. Click &quot;Generate
                  New&quot; for the latest information.
                </p>
              </div>
            </div>
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50 flex-shrink-0 transition"
            >
              {isRegenerating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              {isRegenerating ? "Generating..." : "Generate New"}
            </button>
          </motion.div>
        )}

        {/* Main Card */}
        <div className="bg-white border border-slate-200 rounded-[32px] p-5 shadow-sm relative">
          <div className="space-y-3 text-center text-[14px] text-[#5F6368] leading-relaxed">
            {/* Device Image if available */}
            {image && (
              <div className="flex justify-center mb-2">
                <img
                  src={image}
                  alt="Device"
                  className="h-20 w-auto object-contain"
                />
              </div>
            )}

            <p>
              <span className="font-semibold">Model:</span> {deviceName}
            </p>
            <p>
              <span className="font-semibold">IMEI:</span> {imeiValue}
            </p>
            {imei2Value && imei2Value !== "N/A" && (
              <p>
                <span className="font-semibold">IMEI2:</span> {imei2Value}
              </p>
            )}
            <p>
              <span className="font-semibold">Serial Number:</span>{" "}
              {serialNumber}
            </p>
            {serialKey && serialKey !== "N/A" && (
              <p>
                <span className="font-semibold">Serial Key:</span> {serialKey}
              </p>
            )}
            {eidNumber && eidNumber !== "N/A" && (
              <p className="break-all">
                <span className="font-semibold">EID:</span> {eidNumber}
              </p>
            )}

            {/* Additional device info from Sickw */}
            {unlockStatus !== "N/A" && (
              <p>
                <span className="font-semibold">Unlock Status:</span>{" "}
                {unlockStatus}
              </p>
            )}

            {iCloudLock !== "N/A" && (
              <p>
                <span className="font-semibold">iCloud Lock:</span> {iCloudLock}
              </p>
            )}

            {iCloudStatus !== "N/A" && (
              <p>
                <span className="font-semibold">iCloud Status:</span>{" "}
                {iCloudStatus}
              </p>
            )}

            {mdmLock !== "N/A" && (
              <p>
                <span className="font-semibold">MDM Lock:</span> {mdmLock}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="font-semibold">Activation:</span>
              <span
                className={`${activationStatus === "Activated" ? "bg-[#4CAF50]" : "bg-[#FF9800]"} text-white px-2 py-0.5 rounded-md text-[10px] font-bold`}
              >
                {activationStatus.toUpperCase()}
              </span>
            </div>

            <p>
              <span className="font-semibold">Warranty:</span> {warrantyStatus}
            </p>

            {purchaseDate !== "N/A" && (
              <p>
                <span className="font-semibold">Purchase Date:</span>{" "}
                {formatDate(purchaseDate)}
              </p>
            )}

            {coverageEndDate !== "N/A" && (
              <p>
                <span className="font-semibold">Coverage End:</span>{" "}
                {formatDate(coverageEndDate)}
              </p>
            )}

            {coverageBenefits && coverageBenefits !== "N/A" && (
              <p>
                <span className="font-semibold">Coverage Benefits:</span>{" "}
                {coverageBenefits}
              </p>
            )}

            {registrationStatus && registrationStatus !== "N/A" && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="font-semibold">Registration:</span>
                <span className="bg-[#4CAF50] text-white px-2 py-0.5 rounded-md text-[10px] font-bold">
                  {registrationStatus.toUpperCase()}
                </span>
              </div>
            )}

            {notice && (
              <p className="text-amber-600 text-xs">
                <span className="font-semibold">Notice:</span> {notice}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="font-semibold">Replaced by Apple:</span>
              <span
                className={`${replacedDevice === "No" ? "bg-[#4CAF50]" : "bg-[#F44336]"} text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase`}
              >
                {replacedDevice === "No" ? "NO" : "YES"}
              </span>
            </div>

            {tempCoverage === "Yes" && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="font-semibold">Temp Coverage:</span>
                <span className="bg-[#2196F3] text-white px-2 py-0.5 rounded-md text-[10px] font-bold">
                  {tempCoverage}
                </span>
              </div>
            )}

            {openRepair === "Yes" && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="font-semibold">Open Repair:</span>
                <span className="bg-[#FF9800] text-white px-2 py-0.5 rounded-md text-[10px] font-bold">
                  {openRepair}
                </span>
              </div>
            )}

            {/* Risk Meter Section */}
            <div className="border-t border-slate-100 pt-3 mt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Risk Level:</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white ${
                    riskScore <= 25
                      ? "bg-emerald-500"
                      : riskScore <= 60
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                >
                  {riskLevel.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="font-semibold">Risk Score:</span> {riskScore}
                /100
              </div>
              <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${riskScore <= 25 ? "bg-emerald-500" : riskScore <= 60 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width: `${riskScore}%` }}
                />
              </div>
            </div>

            {/* AI Insight Section */}
            {aiInsight && aiInsight.message && (
              <div className="border-t border-slate-100 pt-3 mt-2">
                <p className="font-semibold mb-1">
                  {aiInsight.title || "AI Insight"}:
                </p>
                <p className="text-sm italic text-slate-600">
                  {aiInsight.message}
                </p>
              </div>
            )}
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopyToClipboard}
            className="absolute bottom-4 right-4 text-slate-300 hover:text-slate-500 transition"
          >
            <Copy size={22} />
          </button>

          {/* Copied Notification */}
          {copied && (
            <div className="absolute top-3 right-3 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-full animate-pulse">
              Copied!
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isGuest && (
          <div className="mt-4 flex gap-2 flex-col sm:flex-row">
            <button
              onClick={() => setIsInvoiceModalOpen(true)}
              disabled={isInvoiceGenerating}
              className="flex-1 py-2.5 px-4 rounded-xl border-2 border-[#84CC16] text-[#84CC16] font-bold text-sm flex items-center justify-center gap-2 hover:bg-lime-50 transition disabled:opacity-50"
            >
              {isInvoiceGenerating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Receipt size={14} />
              )}
              Create Smart Invoice
            </button>
            <button
              onClick={handleDownloadCertificate}
              disabled={isDownloadingNow}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#84CC16] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#76b813] transition shadow-lg shadow-lime-500/20 disabled:opacity-50"
            >
              {isDownloadingNow ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              {isDownloadingNow ? "Generating..." : "Download PDF Certificate"}
            </button>
          </div>
        )}
      </div>

      {/* Hidden PDF Containers */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: "-10000px",
          width: "1100px",
          pointerEvents: "none",
          zIndex: 0,
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
        {invoiceFormData && (
          <SmartInvoicePDF
            data={scanResult}
            id="smart-invoice-pdf-container"
            invoiceData={invoiceFormData}
          />
        )}
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onGenerate={handleGenerateInvoice}
        scanResult={scanResult}
        isGenerating={isInvoiceGenerating}
      />
    </div>
  );
};
