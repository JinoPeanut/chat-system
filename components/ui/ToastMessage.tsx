"use client";

import { AlertCircle, CheckCircle, Info, X } from "lucide-react";
import { useEffect } from "react";

type ToastType = "success" | "error" | "info";

type ToastMessageProps = {
    message: string;
    type?: ToastType;
    duration?: number;
    onClose: () => void;
};

const toastStyle = {
    success: {
        box: "border-green-200 bg-green-50 text-green-700",
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    },
    error: {
        box: "border-red-200 bg-red-50 text-red-700",
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    },
    info: {
        box: "border-blue-200 bg-blue-50 text-blue-700",
        icon: <Info className="h-5 w-5 text-blue-500" />,
    },
};

export default function ToastMessage({
    message,
    type = "info",
    duration = 3000,
    onClose,
}: ToastMessageProps) {
    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [message, duration, onClose]);

    if (!message) return null;

    return (
        <div
            className={`
        fixed right-6 top-6 z-50 flex min-w-[280px] items-center gap-3
        rounded-xl border px-4 py-3 text-sm shadow-lg
        ${toastStyle[type].box}
      `}
        >
            {toastStyle[type].icon}

            <p className="flex-1 font-medium">{message}</p>

            <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1 hover:bg-black/5"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}