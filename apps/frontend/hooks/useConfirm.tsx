"use client";

import { useCallback, useRef, useState } from "react";
import { StatusModal } from "@/components/ui/StatusModal";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  type?: "success" | "warning";
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

/**
 * Hook thay thế `window.confirm` bằng StatusModal có animation/styling đồng bộ.
 *
 * Cách dùng:
 * ```tsx
 * const { confirm, confirmDialog } = useConfirm();
 *
 * const handleDelete = async () => {
 *   const ok = await confirm({
 *     title: "Xóa nhân viên",
 *     description: `Bạn có chắc muốn xóa "${name}"?`,
 *     confirmText: "Xóa",
 *   });
 *   if (!ok) return;
 *   // ... actual delete
 * };
 *
 * return (
 *   <>
 *     ...
 *     {confirmDialog}
 *   </>
 * );
 * ```
 */
export function useConfirm() {
  const [state, setState] = useState<ConfirmState | null>(null);
  // Tránh resolve nhiều lần (onClose + onConfirm có thể trùng).
  const resolvedRef = useRef(false);

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolvedRef.current = false;
      setState({ ...opts, resolve });
    });
  }, []);

  const handleClose = useCallback(() => {
    if (state && !resolvedRef.current) {
      resolvedRef.current = true;
      state.resolve(false);
    }
    setState(null);
  }, [state]);

  const handleConfirm = useCallback(() => {
    if (state && !resolvedRef.current) {
      resolvedRef.current = true;
      state.resolve(true);
    }
  }, [state]);

  const confirmDialog = (
    <StatusModal
      isOpen={!!state}
      onClose={handleClose}
      type={state?.type ?? "warning"}
      title={state?.title ?? ""}
      description={state?.description}
      confirmText={state?.confirmText ?? "Xác nhận"}
      cancelText={state?.cancelText ?? "Hủy"}
      onConfirm={handleConfirm}
    />
  );

  return { confirm, confirmDialog };
}
