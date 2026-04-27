import LeaveActionButton from "./LeaveActionButton"
import { ApplyForm } from "@/types/leave"

type LeaveApplyModalProps = {
    isApplyOpen: boolean,
    closeApplyModal: () => void,
    applyForm: ApplyForm;
    onChangeLeaveDate: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onChangeLeaveType: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onChangeReason: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleSubmitApply: () => void;
}

export default function LeaveApplyModal(
    { isApplyOpen, closeApplyModal, applyForm, onChangeLeaveDate, onChangeLeaveType,
        onChangeReason, handleSubmitApply }: LeaveApplyModalProps) {
    return (
        <>
            {isApplyOpen &&
                (<div onClick={closeApplyModal}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center"
                >
                    <div onClick={(e) => e.stopPropagation()}
                        className="bg-white p-4 rounded-md w-full max-w-md"
                    >
                        <h3 className="text-base font-bold mb-4">연차 신청</h3>

                        <div className="space-y-4">

                            {/* 사용 날짜 */}
                            <div>
                                <label className="block text-sm font-medium mb-1">사용 날짜</label>
                                <input
                                    type="date"
                                    value={applyForm.leaveDate}
                                    onChange={onChangeLeaveDate}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>

                            {/* 휴가 유형 */}
                            <div>
                                <label className="block text-sm font-medium mb-1">휴가 유형</label>
                                <select
                                    value={applyForm.leaveType}
                                    onChange={onChangeLeaveType}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                >
                                    <option value="annual">연차</option>
                                    <option value="half_am">오전 반차</option>
                                    <option value="half_pm">오후 반차</option>
                                </select>
                            </div>

                            {/* 사유 */}
                            <div>
                                <label className="block text-sm font-medium mb-1">사유</label>
                                <textarea
                                    value={applyForm.reason}
                                    onChange={onChangeReason}
                                    placeholder="사유를 입력하세요"
                                    rows={4}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                        </div>

                        <div className="mt-5 flex justify-end gap-2">
                            <LeaveActionButton
                                onClick={closeApplyModal}
                                className="border border-gray-300 hover:bg-gray-300"
                                name="취소하기"
                            />

                            <LeaveActionButton
                                onClick={handleSubmitApply}
                                className="bg-green-500 text-white hover:bg-green-400"
                                name="신청하기"
                            />
                        </div>
                    </div>
                </div>)
            }
        </>
    )
}