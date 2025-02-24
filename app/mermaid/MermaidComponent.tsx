"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import mermaid from "mermaid";

interface MermaidComponentProps {
  mermaidCode: string;
  prompt: string;
}

const MermaidComponent: React.FC<MermaidComponentProps> = ({
  mermaidCode,
  prompt,
}) => {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "strict",
      flowchart: {
        htmlLabels: true,
        nodeSpacing: 50,
        curve: "basis",
        defaultRenderer: "dagre-wrapper",
        useMaxWidth: true,
      },
      themeVariables: {
        nodeBkg: "#ffffff",
        nodeTextColor: "#000000",
      },
    });

    const renderMermaid = async () => {
      if (!mermaidCode || !mermaidRef.current) return;

      // Validate mermaid code
      try {
        await mermaid.parse(mermaidCode);
      } catch (error) {
        console.error("Invalid Mermaid syntax:", error);
        mermaidRef.current.innerHTML =
          '<div class="text-red-500">Error: Invalid diagram syntax</div>';
        return;
      }

      const elementId = "mermaid-" + Math.random().toString(36).substring(2, 9);
      mermaidRef.current.innerHTML = `<div id="${elementId}" class="mermaid bg-white"></div>`;

      try {
        const { svg } = await mermaid.render(elementId, mermaidCode);
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = svg;
          const svgElement = mermaidRef.current.querySelector("svg");
          if (svgElement) {
            // Add white background rect as first child
            const rect = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "rect"
            );
            rect.setAttribute("width", "100%");
            rect.setAttribute("height", "100%");
            rect.setAttribute("fill", "white");
            svgElement.insertBefore(rect, svgElement.firstChild);
          }
        }
      } catch (error) {
        console.error("Error rendering Mermaid diagram:", error);
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML =
            '<div class="text-red-500">Error: Failed to render diagram</div>';
        }
      }
    };

    renderMermaid();
  }, [mermaidCode]);

  const downloadAsSvg = useCallback(() => {
    if (!mermaidRef.current) return;

    const svg = mermaidRef.current.querySelector("svg");
    if (!svg) return;

    // Get SVG dimensions
    const bbox = svg.getBoundingClientRect();
    const width = bbox.width;
    const height = bbox.height;

    // Clone the SVG to modify it safely
    const clonedSvg = svg.cloneNode(true) as SVGElement;

    // Set dimensions explicitly
    clonedSvg.setAttribute("width", width.toString());
    clonedSvg.setAttribute("height", height.toString());

    // Ensure white background
    const bgRect = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    bgRect.setAttribute("width", "100%");
    bgRect.setAttribute("height", "100%");
    bgRect.setAttribute("fill", "white");
    clonedSvg.insertBefore(bgRect, clonedSvg.firstChild);

    // Convert SVG to string with XML declaration
    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml" });
    const downloadUrl = URL.createObjectURL(svgBlob);

    // Create download link
    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = "flowchart.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Cleanup
    URL.revokeObjectURL(downloadUrl);
  }, []);

  const downloadAsPng = useCallback(() => {
    if (!mermaidRef.current) return;

    const svg = mermaidRef.current.querySelector("svg");
    if (!svg) return;

    // Get SVG dimensions
    const bbox = svg.getBoundingClientRect();
    const width = bbox.width;
    const height = bbox.height;

    // Clone the SVG to modify it safely
    const clonedSvg = svg.cloneNode(true) as SVGElement;

    // Set dimensions explicitly
    clonedSvg.setAttribute("width", width.toString());
    clonedSvg.setAttribute("height", height.toString());

    // Ensure white background
    const bgRect = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    bgRect.setAttribute("width", "100%");
    bgRect.setAttribute("height", "100%");
    bgRect.setAttribute("fill", "white");
    clonedSvg.insertBefore(bgRect, clonedSvg.firstChild);

    // Convert SVG to string with XML declaration and create data URL
    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const svgDataUrl =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));

    // Create image and canvas for PNG conversion
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        console.error("Could not get canvas context");
        return;
      }

      // Draw white background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, width, height);

      // Draw the image
      ctx.drawImage(img, 0, 0);

      // Convert to PNG and download
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error("Could not create PNG blob");
          return;
        }
        const downloadUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");
        downloadLink.href = downloadUrl;
        downloadLink.download = "flowchart.png";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadUrl);
      }, "image/png");
    };

    // Handle any errors during image loading
    img.onerror = () => {
      console.error("Error loading SVG for PNG conversion");
    };

    // Load the SVG data URL
    img.src = svgDataUrl;
  }, []);

  const saveToCloud = useCallback(async () => {
    if (!mermaidRef.current) return;

    const svg = mermaidRef.current.querySelector("svg");
    if (!svg) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Get SVG dimensions
      const bbox = svg.getBoundingClientRect();
      const width = bbox.width;
      const height = bbox.height;

      // Clone the SVG to modify it safely
      const clonedSvg = svg.cloneNode(true) as SVGElement;

      // Set dimensions explicitly
      clonedSvg.setAttribute("width", width.toString());
      clonedSvg.setAttribute("height", height.toString());

      // Ensure white background
      const bgRect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      bgRect.setAttribute("width", "100%");
      bgRect.setAttribute("height", "100%");
      bgRect.setAttribute("fill", "white");
      clonedSvg.insertBefore(bgRect, clonedSvg.firstChild);

      // Convert SVG to string with XML declaration and create data URL
      const svgData = new XMLSerializer().serializeToString(clonedSvg);
      const svgDataUrl =
        "data:image/svg+xml;base64," +
        btoa(unescape(encodeURIComponent(svgData)));

      // Create image and canvas for PNG conversion
      const img = new Image();

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          // Draw white background
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, width, height);

          // Draw the image
          ctx.drawImage(img, 0, 0);

          // Convert to PNG and get base64 data
          const pngData = canvas.toDataURL("image/png");

          // Call the storage API
          fetch("/api/storage", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              imageData: pngData,
              prompt,
              mermaidCode,
            }),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Failed to save flowchart");
              }
              return response.json();
            })
            .then(() => {
              setSaveSuccess(true);
              // Clear success message after 3 seconds
              setTimeout(() => setSaveSuccess(false), 3000);
              resolve();
            })
            .catch((error) => {
              reject(error);
            });
        };

        img.onerror = () => {
          reject(new Error("Error loading SVG for PNG conversion"));
        };

        img.src = svgDataUrl;
      });
    } catch (error) {
      console.error("Error saving flowchart:", error);
      setSaveError(
        error instanceof Error ? error.message : "Failed to save flowchart"
      );
      // Clear error message after 3 seconds
      setTimeout(() => setSaveError(null), 3000);
    } finally {
      setIsSaving(false);
    }
  }, [mermaidCode, prompt]);

  return (
    <div className="space-y-4">
      <div className="mermaid w-full bg-white" ref={mermaidRef}></div>
      <div className="flex gap-4">
        <button
          onClick={downloadAsSvg}
          className="flex-1 bg-accent hover:bg-accent-hover text-accent-foreground font-medium py-2.5 px-4 rounded-lg transition-colors"
        >
          Download as SVG
        </button>
        <button
          onClick={downloadAsPng}
          className="flex-1 bg-accent hover:bg-accent-hover text-accent-foreground font-medium py-2.5 px-4 rounded-lg transition-colors"
        >
          Download as PNG
        </button>
        <button
          onClick={saveToCloud}
          disabled={isSaving}
          className="flex-1 bg-accent hover:bg-accent-hover text-accent-foreground font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </span>
          ) : (
            "Save to Cloud"
          )}
        </button>
      </div>
      {saveSuccess && (
        <div className="mt-2 text-sm text-green-600 flex items-center justify-center">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Flowchart saved successfully!
        </div>
      )}
      {saveError && (
        <div className="mt-2 text-sm text-red-600 flex items-center justify-center">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {saveError}
        </div>
      )}
    </div>
  );
};

export default MermaidComponent;
