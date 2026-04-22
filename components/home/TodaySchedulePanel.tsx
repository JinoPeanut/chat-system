"use client"

import { Plus } from "lucide-react";
import { useState } from "react";

export default function TodaySchedulePanel() {

    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    return (
        <div className="border border-gray-300 rounded-xl
                shadow-lg min-h-[45%] pb-2 overflow-hidden mt-2
            ">
            {/* 일정 추가 */}
            <div className="flex justify-between items-center px-4 pt-4 pb-2">
                <p className="font-bold text-sm">
                    오늘의 일정
                </p>
                <div
                    className="bg-violet-200 rounded-lg p-1 cursor-pointer hover:bg-violet-300"
                    onClick={openModal}
                >
                    <Plus size={18} />
                </div>
            </div>

            <div className="border-gray-100 border-[0.2]"></div>

            {/* 일정 카드 - Object로 여러개 배치하기*/}
            <div className="bg-violet-200 rounded-md m-2 p-2 flex gap-3 hover:bg-violet-300 group">
                <div className="bg-violet-400 w-[0.2rem] h-[2.5rem]">{/* 세로줄 */}</div>
                <div className="flex flex-col justify-between">
                    <div className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                        {"팀 회의"}
                        <p className="w-[3px] h-[3px] rounded-full bg-black"></p>
                        {"노트북 꼭 챙겨가기!"}
                    </div>
                    <p className="text-xs font-semibold text-gray-400 group-hover:text-gray-100">
                        {"11:00"}
                    </p>
                </div>
            </div>

            {/* 스케줄 모달 */}
            {isOpen &&
                (<div onClick={closeModal}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white p-4 rounded-md"
                    >
                        <div>

                        </div>
                    </div>
                </div>)
            }
        </div>

    )
}
