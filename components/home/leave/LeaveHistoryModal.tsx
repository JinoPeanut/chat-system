import { LeaveHistory } from "@/types/leave"

type LeaveHistoryModalProps = {
    isOpen: boolean,
    closeModal: () => void,
    myLeaveHistory: LeaveHistory[],
    myUserName: string,
}

export default function LeaveHistoryModal(
    { isOpen, closeModal, myLeaveHistory, myUserName }: LeaveHistoryModalProps
) {
    return (
        <>
            {isOpen &&
                (<div
                    onClick={closeModal}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white p-4 rounded-md"
                    >
                        <div className="grid grid-cols-7 gap-3 border-b pb-2 text-sm font-bold text-center">
                            <p>이름</p>
                            <p>사용 날짜</p>
                            <p>휴가 유형</p>
                            <p>사용량</p>
                            <p>신청 상태</p>
                            <p>사유</p>
                            <p>신청 일시</p>
                        </div>

                        <div className="max-h-[360px] overflow-y-auto">
                            {myLeaveHistory.length === 0
                                ? <p className="py-6 text-center text-sm text-gray-500">내역이 없습니다</p>
                                : (myLeaveHistory.map((item) => (
                                    <div
                                        key={item.id}
                                        className="grid grid-cols-7 gap-2 border-b py-2 text-sm text-center"
                                    >
                                        <p>{myUserName}</p>
                                        <p>{item.leaveDate}</p>
                                        <p>{item.leaveType}</p>
                                        <p>{item.usedDays}일 {item.usedHours}시간</p>
                                        <p>{item.status}</p>
                                        <p className="truncate">{item.reason ?? "-"}</p>
                                        <p>{item.createdAt.slice(0, 10)}</p>
                                    </div>
                                )))
                            }
                        </div>
                        <div className="flex items-center justify-center mt-2">
                            <button
                                className="border-gray-300 border py-2 px-4 rounded-md 
                                    hover:bg-gray-300"
                                onClick={closeModal}>
                                닫기
                            </button>
                        </div>
                    </div>
                </div>)
            }
        </>
    )
}