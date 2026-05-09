import { useCallback, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// Certificate dimensions (A4 size in pixels at 96 DPI)
const CERTIFICATE_PDF_WIDTH = 800;
const CERTIFICATE_PDF_HEIGHT = 1100;

export const useCertificateDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const downloadCertificatePdf = useCallback(
    async (
      elementIds: string[],
      filename: string,
      onProgress?: (progress: number) => void,
    ) => {
      if (elementIds.length === 0) {
        console.error("No certificate elements found");
        return;
      }

      setIsDownloading(true);
      setDownloadProgress(0);

      try {
        // Wait for DOM to be ready
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Get all style elements
        const styleSheets = Array.from(
          document.querySelectorAll("style, link[rel='stylesheet']"),
        ) as (HTMLStyleElement | HTMLLinkElement)[];
        const originalMedias = styleSheets.map((s) => s.media || "");

        // Temporarily disable all stylesheets for clean capture
        styleSheets.forEach((s) => (s.media = "none"));

        // Create PDF with dynamic dimensions
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

            // Capture element as canvas with higher quality
            const canvas = await html2canvas(element, {
              scale: 3, // Higher scale for better quality
              useCORS: true,
              logging: false,
              backgroundColor: "#ffffff",
              windowWidth: elementWidth,
              windowHeight: elementHeight,
              onclone: (clonedDoc, element) => {
                // Ensure cloned element has proper styling
                const clonedElement = clonedDoc.getElementById(elementId);
                if (clonedElement) {
                  clonedElement.style.display = "block";
                  clonedElement.style.visibility = "visible";
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
        styleSheets.forEach((s, i) => (s.media = originalMedias[i]));

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
        const styleSheets = Array.from(
          document.querySelectorAll("style, link[rel='stylesheet']"),
        ) as (HTMLStyleElement | HTMLLinkElement)[];
        styleSheets.forEach((s, i) => {
          if (s.media === "none") {
            s.media = "";
          }
        });

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

  return { isDownloading, downloadProgress, downloadCertificatePdf };
};
