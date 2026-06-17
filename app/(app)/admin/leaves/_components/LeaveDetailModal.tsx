import { DepartmentLeaveStat } from "@/types/leave"
import { formatCreatedAt } from "@/utils/dateUtils";
import { getLeaveTypeText } from "@/utils/statusUtils";
import { CalendarCheck, Moon, Sun, Users2 } from "lucide-react"

type LeaveDetailModalProps = {
    onClose: () => void,
    department: DepartmentLeaveStat,
}

const leaveTypeStyleField = {
    annual: {
        Icon: CalendarCheck,
        bgColor: "bg-violet-100",
        textColor: "text-violet-500",
        barColor: "bg-violet-500",
    },
    half_am: {
        Icon: Sun,
        bgColor: "bg-orange-100",
        textColor: "text-orange-500",
        barColor: "bg-orange-500",
    },
    half_pm: {
        Icon: Moon,
        bgColor: "bg-blue-100",
        textColor: "text-blue-500",
        barColor: "bg-blue-500",
    },
} as const;

export default function LeaveDetailModal({ onClose, department }: LeaveDetailModalProps) {

    const deptInfoField = [
        { title: "부서명", content: department.department },
        { title: "부서장", content: department.managerName },
        { title: "소속 인원", content: `${department.memberCount}명` },
    ]

    const useLeaveTypeCurrent = department.leaveTypeStats;

    return (
        <div onClick={onClose}
            className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div onClick={(e) => e.stopPropagation()}
                className="relative bg-white p-4 rounded-md w-full max-w-2xl">

                <div className="flex flex-col gap-3">

                    {/* 상단 제목 */}
                    <h3 className="font-semibold tracking-tight text-lg">{department.department} 연차 현황 상세</h3>

                    <div className="flex flex-col gap-1 mt-3">
                        <h3 className="font-semibold">부서 정보</h3>
                        <div className="flex gap-5 items-center border border-gray-200 rounded-lg px-2 py-3">
                            <div className="p-2 bg-violet-100 text-violet-500 rounded-lg">
                                <Users2 size={28} />
                            </div>
                            <div className="w-full grid grid-cols-3">
                                {deptInfoField.map((dept) => {
                                    return (
                                        <div key={dept.title} className="flex flex-col gap-1">
                                            <p className="text-sm text-gray-500">{dept.title}</p>
                                            <p className="font-semibold">{dept.content}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <h3 className="font-semibold">사용 유형별 현황</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {useLeaveTypeCurrent.map((stat) => {
                                const style = leaveTypeStyleField[stat.type];
                                const Icon = style.Icon;

                                return (
                                    <div key={stat.type} className="flex flex-col border border-gray-200 rounded-lg p-2">

                                        <div className="flex gap-2 items-center">
                                            <Icon size={48} className={`p-2 rounded-lg ${style.bgColor} ${style.textColor}`} />
                                            <div className="flex flex-col">
                                                <p className="text-sm text-gray-600">{stat.label}</p>
                                                <div className="flex items-baseline">
                                                    <p className="text-2xl font-bold">{stat.days}</p>
                                                    <p className="font-semibold text-sm">일</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center mt-2">
                                            <div className="flex items-center gap-1">
                                                <div className="w-20 h-1 rounded-full bg-gray-100">
                                                    <div className={`h-full rounded-full ${style.barColor}`} style={{ width: `${stat.rate}%` }} />
                                                </div>
                                                <span className="w-12 text-right text-gray-500 font-semibold text-sm">
                                                    {stat.rate.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <h3 className="font-semibold">최근 연차 사용 내역</h3>
                        <div className="grid grid-cols-[120px_120px_100px_100px_140px] mt-3 text-sm
                            border-t border-l border-r border-gray-300 rounded-t-lg px-3 py-1 bg-gray-100 text-gray-500 font-semibold">
                            <p className="text-left">사용자</p>
                            <p className="text-left">사용일</p>
                            <p className="text-center">연차 유형</p>
                            <p className="text-center">사용 일수</p>
                            <p className="text-center">사유</p>
                        </div>

                        <div className="flex flex-col border border-gray-300 rounded-b-lg px-3 bg-white font-medium">
                            {department.recentLeaves.length === 0
                                ? (<div className="py-8 text-center text-sm text-gray-400">
                                    최근 연차 사용 내역이 없습니다.
                                </div>)
                                : (department.recentLeaves.map((dept, index) => {

                                    const isLast = index === department.recentLeaves.length - 1;

                                    return (
                                        <div key={dept.id}>
                                            <div className="grid grid-cols-[120px_120px_100px_100px_140px] items-center py-3">
                                                <p className="text-left text-sm font-semibold">{dept.userName} {dept.position}</p>
                                                <p className="text-left text-sm font-semibold">{formatCreatedAt(dept.leaveDate)}</p>
                                                <p className="text-center text-sm font-semibold">{getLeaveTypeText(dept.leaveType)}</p>
                                                <p className="text-center text-sm font-semibold">{dept.usedDays}</p>
                                                <p className="text-center text-sm font-semibold">{dept.reason ?? "-"}</p>

                                            </div>

                                            {!isLast && <div className="w-full h-[1px] bg-gray-200" />}
                                        </div>
                                    )
                                }))}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="border border-gray-200 px-6 py-2 hover:bg-gray-200 rounded-lg cursor-pointer font-semibold"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}