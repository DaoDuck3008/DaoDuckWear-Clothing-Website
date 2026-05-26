"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, X, ArrowRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { createPortal } from "react-dom";

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "success" | "warning";
  title: string;
  message?: string;
  description?: string;
  buttonText?: string;
  confirmText?: string;
  cancelText?: string;
  onAction?: () => void;
  onConfirm?: () => void;
}

export const StatusModal: React.FC<StatusModalProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  description,
  buttonText,
  confirmText,
  cancelText,
  onAction,
  onConfirm,
}) => {
  const displayDescription = description || message;
  const displayConfirmText = confirmText || buttonText || "Xác nhận";
  const displayCancelText = cancelText || "Đóng";
  const handleConfirm = onConfirm || onAction;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Styles for custom animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes modal-pop {
          0% { opacity: 0; transform: scale(0.9) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes icon-jump {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .animate-modal-pop { animation: modal-pop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-icon-jump { animation: icon-jump 2s ease-in-out infinite; }
        .animate-pulse-ring { animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; }
      `}} />

      {/* Backdrop with Blur */}
      <div 
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-sm shadow-[0_20px_50px_rgba(0,0,0,0.2)] animate-modal-pop overflow-hidden rounded-2xl">
        {/* Decorative Top Line */}
        <div className={cn(
          "h-1.5 w-full",
          type === "success" ? "bg-green-500" : "bg-amber-500"
        )} />

        <div className="p-8 flex flex-col items-center text-center">
          {/* Animated Icon Container */}
          <div className="relative mb-8">
            {/* Pulse Rings */}
            <div className={cn(
              "absolute inset-0 rounded-full animate-pulse-ring",
              type === "success" ? "bg-green-200" : "bg-amber-200"
            )} />
            <div className={cn(
              "absolute inset-0 rounded-full animate-pulse-ring [animation-delay:0.5s]",
              type === "success" ? "bg-green-100" : "bg-amber-100"
            )} />
            
            {/* Main Icon Circle */}
            <div className={cn(
              "relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg animate-icon-jump",
              type === "success" ? "bg-green-500 text-white" : "bg-amber-500 text-white"
            )}>
              {type === "success" ? (
                <CheckCircle2 className="w-10 h-10" />
              ) : (
                <AlertTriangle className="w-10 h-10" />
              )}
            </div>
          </div>

          {/* Text Content */}
          <h2 className="text-xl font-bold text-stone-900 mb-3 tracking-tight">
            {title}
          </h2>
          <p className="text-stone-500 text-sm leading-relaxed mb-8 px-2">
            {displayDescription}
          </p>

          {/* Action Buttons */}
          <div className="w-full space-y-3">
            <button
              onClick={() => {
                if (handleConfirm) handleConfirm();
                onClose();
              }}
              className={cn(
                "w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all active:scale-[0.98]",
                type === "success" 
                  ? "bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-200" 
                  : "bg-stone-900 text-white hover:bg-black shadow-lg shadow-stone-200"
              )}
            >
              {displayConfirmText}
              <ArrowRight className="w-4 h-4" />
            </button>

            <button 
              onClick={onClose}
              className="w-full py-3 text-sm font-semibold text-stone-400 hover:text-stone-600 transition-colors"
            >
              {displayCancelText}
            </button>
          </div>
        </div>

        {/* X Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-300 hover:text-stone-900 transition-colors rounded-full hover:bg-stone-50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>,
    document.body
  );
};
