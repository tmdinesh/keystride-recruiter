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
        "fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg animate-in slide-in-from-top-5",
        {
          "bg-green-50 border-green-200 text-green-800": type === "success",
          "bg-red-50 border-red-200 text-red-800": type === "error",
          "bg-blue-50 border-blue-200 text-blue-800": type === "info",
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
