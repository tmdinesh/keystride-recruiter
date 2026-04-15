import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = "info", onClose }) => {
  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-soft-lg animate-in slide-in-from-top-5",
        {
          "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400": type === "success",
          "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400": type === "error",
          "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400": type === "info",
        }
      )}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 rounded-sm opacity-70 hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
