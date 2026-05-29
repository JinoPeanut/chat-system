type LeaveActionButtonProps = {
    BtnType?: "button" | "submit" | "reset",
    onClick?: () => void,
    className?: string,
    name?: string,
    processingName?: string,
    isProcessing?: boolean,
}

export default function LeaveActionButton({ BtnType = "button", onClick, className, name, processingName, isProcessing }: LeaveActionButtonProps) {
    return (
        <button
            type={BtnType}
            onClick={onClick}
            disabled={isProcessing}
            className={`rounded-md px-3 py-2 text-sm ${isProcessing ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${className}`}
        >
            {isProcessing ? processingName : name}
        </button>
    )
}