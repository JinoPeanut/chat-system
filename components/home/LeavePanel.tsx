import { USERS } from "@/types/chat";
import { LEAVE } from "@/types/leave";
import { ListChecks, PackageOpen, TentTree } from "lucide-react";

const getLeaveColor = (percent: number) => {
    if (percent <= 10) return "bg-green-500"
    if (percent <= 20) return "bg-green-400"
    if (percent <= 30) return "bg-green-300"
    if (percent <= 40) return "bg-lime-300"
    if (percent <= 50) return "bg-yellow-300"
    if (percent <= 60) return "bg-yellow-400"
    if (percent <= 70) return "bg-orange-300"
    if (percent <= 80) return "bg-orange-400"
    if (percent <= 90) return "bg-orange-500"
    return "bg-red-500"
}

export default function LeavePanel() {

    const myUserId = USERS.user1.id;
    const myLeave = Object.values(LEAVE).find((u) => u.userId === myUserId);

    const remainDays = myLeave ? myLeave?.totalDays - myLeave?.usedDays : 0;
    const remainHours = myLeave ? 8 - myLeave.useHours : 0;
    const leavePercent = myLeave ? Math.min(100, (myLeave?.usedDays / myLeave.totalDays) * 100) : 0;

    return (
        <div className="
                border border-gray-200 rounded-md
                px-2 shadow-lg min-h-[45%]
            ">
            <div className="pb-4">
                <h2 className="text-sm font-bold pt-3">
                    휴가 관리
                </h2>
            </div>

            {/* 연차카드 */}
            <div className="grid grid-cols-3 gap-2">

                {/* 잔여 연차 */}
                <div className="col-span-1 flex-col items-start bg-gray-300/80
                    rounded-md h-[7rem] p-2 group hover:bg-blue-200"
                >
                    <TentTree size={26} className="text-gray-400 group-hover:text-blue-500" />
                    <p className="text-xs leading-tight pt-5 text-gray-500 font-bold
                        group-hover:text-blue-500
                    ">
                        잔여 연차
                    </p>
                    <p className="font-bold">
                        {remainDays}일
                    </p>
                    <p className="text-xs leading-tight text-gray-500 group-hover:text-blue-500">
                        {remainHours}시간
                    </p>
                </div>

                {/* 사용 연차 */}
                <div className="col-span-1 flex-col items-start bg-gray-300/80
                    rounded-md h-[7rem] p-2 group hover:bg-blue-200"
                >
                    <ListChecks size={26} className="text-gray-400 group-hover:text-blue-500" />
                    <p className="text-xs leading-tight pt-5 text-gray-500 font-bold
                        group-hover:text-blue-500
                    ">
                        사용 연차
                    </p>
                    <p className="font-bold">
                        {myLeave?.usedDays}일
                    </p>
                    <p className="text-xs leading-tight text-gray-500 group-hover:text-blue-500">
                        {myLeave?.useHours}시간
                    </p>
                </div>

                {/* 총 연차 */}
                <div className="col-span-1 flex-col items-start bg-gray-300/80
                    rounded-md h-[7rem] p-2 group hover:bg-blue-200"
                >
                    <PackageOpen size={26} className="text-gray-400 group-hover:text-blue-500" />
                    <p className="text-xs leading-tight pt-5 text-gray-500 font-bold
                        group-hover:text-blue-500
                    ">
                        총 연차
                    </p>
                    <p className="font-bold">
                        {myLeave?.totalDays}일
                    </p>
                </div>
            </div>

            {/* 남은 연차 비율 */}
            <div className="mt-3 flex items-center justify-center mx-6">
                <p className={`
                    ${getLeaveColor(Number(leavePercent.toFixed(0)))}
                    rounded-md py-1 text-center text-xs break-words
                    w-full
                `}>
                    총 연차중 {leavePercent.toFixed(0)}% 소진했습니다.
                </p>
            </div>

            <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`${getLeaveColor(leavePercent)} h-2 rounded-full`}
                        style={{ width: `${leavePercent}%` }}
                    />
                </div>
            </div>

            <div className="mt-3 flex gap-2">
                <button className="flex-1 bg-green-500 text-white rounded-md py-2 text-sm hover:bg-green-400">
                    연차 신청
                </button>
                <button className="flex-1 bg-gray-200 rounded-md py-2 text-sm hover:bg-gray-300">
                    내역 보기
                </button>
            </div>
        </div>
    )
}