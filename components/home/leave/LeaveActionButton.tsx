type LeaveActionButtonProps = {
    BtnType?: "button" | "submit" | "reset",
    onClick?: () => void,
    className?: string,
    name?: string,
}

export default function LeaveActionButton({ BtnType = "button", onClick, className, name }: LeaveActionButtonProps) {
    return (
        <button
            type={BtnType}
            onClick={onClick}
            className={`rounded-md px-3 py-2 text-sm ${className}`}
        >
            {name}
        </button>
    )
}