import { ActivityLogType } from "@/types/logs"
import { CalendarCheck, ClipboardCheck, Megaphone } from "lucide-react"

export const getActivityIcon = (type: ActivityLogType) => {
    if (type === "notice") return Megaphone
    if (type === "leave") return CalendarCheck
    return ClipboardCheck
}

export const getActivityName = (type: ActivityLogType) => {
    if (type === "notice") return "게시글"
    if (type === "leave") return "연차"
    return "기타"
}

export const getActivityStyle = (type: ActivityLogType) => {
    if (type === "notice") return "bg-violet-100 text-violet-500"
    if (type === "leave") return "bg-orange-100 text-orange-500"
    return "bg-blue-100 text-blue-500"
}