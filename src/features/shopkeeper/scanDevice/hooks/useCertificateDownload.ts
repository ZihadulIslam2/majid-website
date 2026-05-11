import { useCallback, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// Certificate dimensions (A4 size in pixels at 96 DPI)
const CERTIFICATE_PDF_WIDTH = 800;
const CERTIFICATE_PDF_HEIGHT = 1100;

// Certificate quality settings
const CERTIFICATE_SCALE = 3; // Higher scale for better quality

export const useCertificateDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Helper function to wait for DOM updates
  const waitForDomUpdate = (ms: number = 200) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Helper function to disable/enable stylesheets
  const disableStylesheets = (disabled: boolean) => {
    const styleSheets = Array.from(
      document.querySelectorAll("style, link[rel='stylesheet']"),
    ) as (HTMLStyleElement | HTMLLinkElement)[];

    if (disabled) {
      styleSheets.forEach((s) => (s.media = "none"));
    } else {
      styleSheets.forEach((s) => {
        if (s.media === "none") {
          s.media = "";
        }
      });
    }

    return styleSheets;
  };

  // Helper function to capture a single element as canvas
  const captureElement = async (
    elementId: string,
  ): Promise<HTMLCanvasElement | null> => {
    const element = document.getElementById(elementId);

    if (!element) {
      console.warn(`Certificate element "${elementId}" not found`);
      return null;
    }

    try {
      // Get element dimensions
      const elementRect = element.getBoundingClientRect();
      const elementWidth = elementRect.width;
      const elementHeight = elementRect.height;

      // Ensure element is visible
      if (elementWidth === 0 || elementHeight === 0) {
        console.warn(`Element "${elementId}" has zero dimensions`);
        return null;
      }

      // Capture element as canvas
      const canvas = await html2canvas(element, {
        scale: CERTIFICATE_SCALE,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: elementWidth,
        windowHeight: elementHeight,
        onclone: (clonedDoc, element) => {
          const clonedElement = clonedDoc.getElementById(elementId);
          if (clonedElement) {
            clonedElement.style.display = "block";
            clonedElement.style.visibility = "visible";
            clonedElement.style.opacity = "1";
          }
        },
      });

      return canvas;
    } catch (err) {
      console.error(`Failed to capture element "${elementId}":`, err);
      return null;
    }
  };

  // Helper function to add image to PDF
  const addImageToPdf = (
    pdf: jsPDF,
    canvas: HTMLCanvasElement,
    isFirstPage: boolean,
  ) => {
    if (!isFirstPage) {
      pdf.addPage([CERTIFICATE_PDF_WIDTH, CERTIFICATE_PDF_HEIGHT], "portrait");
    }

    const imgData = canvas.toDataURL("image/png", 1.0);
    const imgWidth = CERTIFICATE_PDF_WIDTH;
    const imgHeight = (canvas.height * CERTIFICATE_PDF_WIDTH) / canvas.width;

    // Center the image vertically if needed
    let yOffset = 0;
    if (imgHeight < CERTIFICATE_PDF_HEIGHT) {
      yOffset = (CERTIFICATE_PDF_HEIGHT - imgHeight) / 2;
    }

    pdf.addImage(imgData, "PNG", 0, yOffset, imgWidth, imgHeight);
  };

  // Single certificate download
  const downloadSingleCertificate = useCallback(
    async (elementId: string, filename: string): Promise<boolean> => {
      if (!elementId) {
        setError("No certificate element ID provided");
        return false;
      }

      setIsDownloading(true);
      setDownloadProgress(0);
      setError(null);

      try {
        await waitForDomUpdate(200);

        // Disable stylesheets temporarily
        const styleSheets = disableStylesheets(true);

        // Capture the element
        const canvas = await captureElement(elementId);

        // Restore stylesheets
        disableStylesheets(false);

        if (!canvas) {
          throw new Error(
            `Failed to capture certificate element "${elementId}"`,
          );
        }

        // Create PDF
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: [CERTIFICATE_PDF_WIDTH, CERTIFICATE_PDF_HEIGHT],
        });

        addImageToPdf(pdf, canvas, true);

        // Save PDF
        pdf.save(filename);

        setDownloadProgress(100);
        console.log(`✅ Single certificate saved: ${filename}`);

        return true;
      } catch (err) {
        const error = err as Error;
        console.error("Single certificate PDF generation failed:", error);
        setError(error.message || "Failed to generate certificate");

        // Restore stylesheets in case of error
        disableStylesheets(false);

        return false;
      } finally {
        setIsDownloading(false);
        setTimeout(() => setDownloadProgress(0), 500);
      }
    },
    [],
  );

  // Bulk certificates download
  const downloadBulkCertificates = useCallback(
    async (elementIds: string[], filename: string): Promise<boolean> => {
      if (elementIds.length === 0) {
        setError("No certificate elements provided");
        return false;
      }

      setIsDownloading(true);
      setDownloadProgress(0);
      setError(null);

      try {
        await waitForDomUpdate(200);

        // Disable stylesheets temporarily
        const styleSheets = disableStylesheets(true);

        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: [CERTIFICATE_PDF_WIDTH, CERTIFICATE_PDF_HEIGHT],
        });

        let successCount = 0;

        for (let i = 0; i < elementIds.length; i++) {
          const elementId = elementIds[i];

          // Capture the element
          const canvas = await captureElement(elementId);

          if (canvas) {
            addImageToPdf(pdf, canvas, i === 0);
            successCount++;
          }

          // Update progress
          const progress = Math.round(((i + 1) / elementIds.length) * 100);
          setDownloadProgress(progress);
        }

        // Restore stylesheets
        disableStylesheets(false);

        if (successCount === 0) {
          throw new Error("No certificates were successfully generated");
        }

        // Save PDF
        pdf.save(filename);

        setDownloadProgress(100);
        console.log(
          `✅ Bulk certificates saved: ${filename} (${successCount}/${elementIds.length} successful)`,
        );

        return true;
      } catch (err) {
        const error = err as Error;
        console.error("Bulk certificates PDF generation failed:", error);
        setError(error.message || "Failed to generate certificates");

        // Restore stylesheets in case of error
        disableStylesheets(false);

        return false;
      } finally {
        setIsDownloading(false);
        setTimeout(() => setDownloadProgress(0), 500);
      }
    },
    [],
  );

  // Main download function that handles both single and bulk
  const downloadCertificatePdf = useCallback(
    async (
      elementIds: string[],
      filename: string,
      onProgress?: (progress: number) => void,
    ) => {
      if (elementIds.length === 0) {
        console.error("No certificate elements found");
        setError("No certificate elements found");
        return;
      }

      setIsDownloading(true);
      setDownloadProgress(0);
      setError(null);

      try {
        await waitForDomUpdate(300);

        // Disable stylesheets temporarily
        const styleSheets = disableStylesheets(true);

        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: [CERTIFICATE_PDF_WIDTH, CERTIFICATE_PDF_HEIGHT],
        });

        let successCount = 0;

        for (let index = 0; index < elementIds.length; index++) {
          const elementId = elementIds[index];
          const element = document.getElementById(elementId);

          if (!element) {
            console.warn(
              `Certificate element "${elementId}" not found, skipping...`,
            );
            continue;
          }

          try {
            // Get element dimensions
            const elementRect = element.getBoundingClientRect();
            const elementWidth = elementRect.width;
            const elementHeight = elementRect.height;

            if (elementWidth === 0 || elementHeight === 0) {
              console.warn(
                `Element "${elementId}" has zero dimensions, skipping...`,
              );
              continue;
            }

            // Capture element as canvas with higher quality
            const canvas = await html2canvas(element, {
              scale: CERTIFICATE_SCALE,
              useCORS: true,
              logging: false,
              backgroundColor: "#ffffff",
              windowWidth: elementWidth,
              windowHeight: elementHeight,
              onclone: (clonedDoc, element) => {
                const clonedElement = clonedDoc.getElementById(elementId);
                if (clonedElement) {
                  clonedElement.style.display = "block";
                  clonedElement.style.visibility = "visible";
                  clonedElement.style.opacity = "1";
                }
              },
            });

            const imgData = canvas.toDataURL("image/png", 1.0);

            // Add new page for each certificate after the first
            if (index > 0) {
              pdf.addPage(
                [CERTIFICATE_PDF_WIDTH, CERTIFICATE_PDF_HEIGHT],
                "portrait",
              );
            }

            // Calculate image dimensions to fit page
            const imgWidth = CERTIFICATE_PDF_WIDTH;
            const imgHeight =
              (canvas.height * CERTIFICATE_PDF_WIDTH) / canvas.width;

            // Center the image vertically if needed
            let yOffset = 0;
            if (imgHeight < CERTIFICATE_PDF_HEIGHT) {
              yOffset = (CERTIFICATE_PDF_HEIGHT - imgHeight) / 2;
            }

            pdf.addImage(imgData, "PNG", 0, yOffset, imgWidth, imgHeight);
            successCount++;

            // Update progress
            const progress = Math.round(
              ((index + 1) / elementIds.length) * 100,
            );
            setDownloadProgress(progress);
            onProgress?.(progress);
          } catch (err) {
            console.error(
              `Failed to capture certificate for ${elementId}:`,
              err,
            );
          }
        }

        // Restore stylesheets
        disableStylesheets(false);

        if (successCount === 0) {
          throw new Error("No certificates were successfully generated");
        }

        // Save PDF
        pdf.save(filename);
        console.log(`✅ PDF saved: ${filename} (${successCount} certificates)`);
      } catch (err: unknown) {
        const error = err as Error;
        console.error("Certificate PDF generation failed:", error);

        // Revert stylesheets in case of error
        disableStylesheets(false);

        setError(error.message || "Failed to generate certificate PDF");
        alert(
          `Failed to generate certificate PDF: ${error.message || "Unknown error"}. Please try again.`,
        );
      } finally {
        setIsDownloading(false);
        setDownloadProgress(0);
      }
    },
    [],
  );

  // Helper function to clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isDownloading,
    downloadProgress,
    error,
    downloadCertificatePdf,
    downloadSingleCertificate,
    downloadBulkCertificates,
    clearError,
  };
};
