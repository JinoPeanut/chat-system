export default function LeaveDetailModal() {
    return (
        <div //onClick={onClose}
            className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div onClick={(e) => e.stopPropagation()}
                className="relative bg-white p-4 rounded-md w-full max-w-lg">

            </div>

        </div>
    )
}