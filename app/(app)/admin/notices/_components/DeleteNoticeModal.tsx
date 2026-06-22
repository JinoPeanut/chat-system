
type DeleteNoticeModalProps = {
    notice: {
        id: string,
    },
    onDeleteNotice: (noticeId: string) => Promise<boolean>,
    onClose: () => void,
    errorMessage: string,
    isProcessing: boolean,
}

export default function DeleteNoticeModal({ notice, onDeleteNotice, onClose, errorMessage, isProcessing }: DeleteNoticeModalProps) {

    return (
        <div onClick={onClose}
            className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div onClick={(e) => e.stopPropagation()}
                className="relative bg-white p-4 rounded-md w-full max-w-lg">

                {errorMessage && (
                    <div className="absolute right-5 top-15 animate-slide-toast bg-red-100 rounded-md px-4 py-2">
                        <p className="text-sm text-red-500">{errorMessage}</p>

                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-red-100">
                            <div className="h-full bg-red-500 animate-toast-timer" />
                        </div>
                    </div>
                )}

                <div className="flex justify-center items-center">
                    <h3 className="font-semibold tracking-tight">정말로 삭제하시겠습니까?</h3>
                </div>

                <div className="flex justify-center items-center gap-5 mt-5">
                    <button
                        onClick={onClose}
                        className="rounded-md border border-gray-200 px-8 py-2 cursor-pointer hover:bg-gray-100">
                        취소
                    </button>
                    <button
                        onClick={async () => {
                            const success = await onDeleteNotice(notice.id);
                            if (success) onClose();
                        }}
                        disabled={isProcessing}
                        className="rounded-md bg-red-500 text-white px-8 py-2 cursor-pointer hover:bg-red-400
                                disabled:opacity-50 disabled:cursor-not-allowed">
                        {isProcessing ? "삭제 중..." : "삭제"}
                    </button>
                </div>
            </div>
        </div>
    )
}