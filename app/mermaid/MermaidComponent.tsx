"use client";

import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface MermaidComponentProps {
  mermaidCode: string;
}

const MermaidComponent: React.FC<MermaidComponentProps> = ({ mermaidCode }) => {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "strict",
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
      mermaidRef.current.innerHTML = `<div id="${elementId}" class="mermaid"></div>`;

      try {
        const { svg } = await mermaid.render(elementId, mermaidCode);
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = svg;
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

  return <div className="mermaid w-full" ref={mermaidRef}></div>;
};

export default MermaidComponent;
