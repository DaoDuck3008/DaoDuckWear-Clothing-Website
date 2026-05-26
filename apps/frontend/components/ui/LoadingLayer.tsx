"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingLayerProps {
  isLoading: boolean;
  message?: string;
}

export const LoadingLayer: React.FC<LoadingLayerProps> = ({
  isLoading,
  message = "Đang xử lý dữ liệu...",
}) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center">
      {/* Backdrop with Glassmorphism */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-md" />

      {/* Content */}
      <div className="relative flex flex-col items-center">
        <div className="relative">
          {/* Animated Spinner Outer */}
          <div className="w-16 h-16 border-2 border-stone-100 rounded-full" />
          {/* Active Spinner */}
          <Loader2 className="w-16 h-16 text-black animate-spin absolute top-0 left-0" />
          
          {/* Decorative small dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-black rounded-full" />
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          <span className="font-cormorant text-xl font-bold tracking-[0.2em] uppercase text-black">
            DaoDuckWear
          </span>
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-stone-200" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">
              {message}
            </span>
            <div className="h-px w-8 bg-stone-200" />
          </div>
        </div>

        {/* Dynamic loading bar under the message */}
        <div className="mt-6 w-48 h-[1px] bg-stone-100 overflow-hidden relative">
          <div className="absolute inset-0 bg-black w-1/3 animate-[loading_1.5s_infinite_ease-in-out]" />
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};
