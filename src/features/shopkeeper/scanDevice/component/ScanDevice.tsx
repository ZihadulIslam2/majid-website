"use client";

import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ScannerModal } from "@/components/shared/website/ScannerModal";
import { BulkImeiUploadModal } from "@/components/shared/website/BulkImeiUploadModal";
import { useServices } from "../hooks/useServices";
import { useScanDevice } from "../hooks/useScanDevice";
import { useCertificateDownload } from "../hooks/useCertificateDownload";
import { usePersistedReport } from "../hooks/usePersistedReport";
import { SingleResultView } from "./SingleResultView";
import { ScanHeader } from "./ScanHeader";
import { ServiceSelector } from "./ServiceSelector";
import { ScanInput } from "./ScanInput";
import { ScanButtons } from "./ScanButtons";
import { ScanProgress } from "./ScanProgress";
import { FeaturesGrid } from "./FeaturesGrid";
import { BulkResultView } from "./BulkResultView";

export default function ScanDevice() {
  const searchParams = useSearchParams();
  const queryImei = searchParams.get("imei");
  const queryServiceId = searchParams.get("serviceId");

  // Hooks
  const {
    serviceCategories,
    selectedService,
    setSelectedService,
    isDropdownOpen,
    setIsDropdownOpen,
  } = useServices(queryServiceId);

  const {
    imei,
    setImei,
    isScanning,
    scanResult,
    batchResult,
    setBatchResult,
    currentStep,
    error,
    singleReportMeta,
    handleScan,
    clearResults,
  } = useScanDevice();

  const { isDownloading, downloadCertificatePdf } = useCertificateDownload();

  // Persisted report restoration
  usePersistedReport(scanResult, batchResult, 0, singleReportMeta, (state) => {
    if (state.mode === "single" && state.singleResult) {
      // Restore single result
    } else if (state.mode === "bulk" && state.batchResult) {
      setBatchResult(state.batchResult);
    }
  });

  // Auto-scan from query params
  useEffect(() => {
    if (queryImei && selectedService && !isScanning && !scanResult) {
      handleScan(queryImei, selectedService.serviceId || 6);
    }
  }, [queryImei, selectedService, isScanning, scanResult, handleScan]);

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Show single result if available
  if (scanResult) {
    return (
      <SingleResultView
        scanResult={scanResult}
        singleReportMeta={singleReportMeta}
        selectedService={selectedService}
        onBack={clearResults}
        onDownload={() =>
          downloadCertificatePdf(
            ["certificate-pdf-single"],
            `Certificate_${scanResult.imei}.pdf`,
          )
        }
        isDownloading={isDownloading}
      />
    );
  }

  // Main form view
  return (
    <div className="min-h-full p-4 md:p-10 max-w-6xl space-y-12 mx-auto font-poppins">
      <ScanHeader />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full bg-card rounded-[40px] p-6 md:p-12 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] border border-border"
      >
        <div className="space-y-8">
          <ServiceSelector
            serviceCategories={serviceCategories}
            selectedService={selectedService}
            setSelectedService={setSelectedService}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            disabled={isScanning}
          />

          <ScanInput
            imei={imei}
            setImei={setImei}
            onScanClick={() => setIsScannerOpen(true)}
            disabled={isScanning}
          />

          <ScanButtons
            onScan={() => handleScan(imei, selectedService?.serviceId || 6)}
            onBulkClick={() => setIsBulkModalOpen(true)}
            isScanning={isScanning}
            isDisabled={isScanning || !imei || !selectedService}
          />

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-semibold text-center">
              {error}
            </div>
          )}

          <ScanProgress isScanning={isScanning} currentStep={currentStep} />
        </div>
      </motion.div>

      {!isScanning && <FeaturesGrid />}

      {/* Modals */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={(scannedImei) => {
          setImei(scannedImei);
          if (selectedService) {
            handleScan(scannedImei, selectedService.serviceId || 6);
          }
        }}
      />

      <BulkImeiUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        serviceId={selectedService?.serviceId || 6}
        onBatchComplete={(result) => {
          clearResults();
          setBatchResult(result);
        }}
      />

      {/* Bulk Result View */}
      {batchResult && (
        <BulkResultView
          batchResult={batchResult}
          onClear={clearResults}
          onDownloadCertificate={downloadCertificatePdf}
          isDownloading={isDownloading}
        />
      )}
    </div>
  );
}
