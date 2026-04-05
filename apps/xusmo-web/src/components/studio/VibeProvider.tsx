"use client";

/**
 * VibeProvider
 * 
 * Replaces hard-coded CSS variables by actively digesting the generated 
 * Xusmo AI Theme Object and compiling it into runtime CSS injections.
 * Wrap your preview iframe or UI layer in this provider to instantly
 * manifest the "Vibe Coding" aesthetics defined by the engine.
 */

import React, { useMemo } from "react";
import { compileVibeToReactCSS } from "@/lib/vibe-compiler";

interface VibeProviderProps {
  theme: any;
  children: React.ReactNode;
  scope?: string;
}

export function VibeProvider({ theme, children, scope = ".vibe-layer" }: VibeProviderProps) {
  const cssString = useMemo(() => {
    if (!theme) return "";
    try {
      return compileVibeToReactCSS(theme, scope);
    } catch (e) {
      console.error("Vibe Compiler Error:", e);
      return "";
    }
  }, [theme, scope]);

  return (
    <div className={scope.replace(".", "")} style={{ width: "100%", height: "100%" }}>
      {cssString && (
        <style dangerouslySetInnerHTML={{ __html: cssString }} />
      )}
      {children}
    </div>
  );
}
