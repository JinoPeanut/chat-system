import { UserStatus } from "@/types/chat";
import { LeaveStatus, LeaveType } from "@/types/leave";

export function getStatusRingColor(status: UserStatus) {
    switch (status) {
        case "online":
            return "ring-green-400";
        case "offline":
            return "ring-gray-400";
        case "AFK":
            return "ring-yellow-400";
    }
}

export function getStatusColor(status: UserStatus) {
    switch (status) {
        case "online": return "bg-green-400"
        case "offline": return "bg-gray-400"
        case "AFK": return "bg-yellow-400"
    }
}

export function getStatusCardColor(status: UserStatus) {
    switch (status) {
        case "online": return "bg-green-200"
        case "offline": return "bg-gray-200"
        case "AFK": return "bg-yellow-200"
    }
}

export function getStatusText(status: UserStatus) {
    switch (status) {
        case "online": return "온라인"
        case "offline": return "오프라인"
        case "AFK": return "자리비움"
    }
}

export function getLeaveStatus(status: LeaveStatus) {
    if (!status) return "전체 상태";

    switch (status) {
        case "approved": return "승인";
        case "rejected": return "반려";
        case "pending": return "대기";
    }
}

export function getLeaveStatusCard(status: LeaveStatus) {
    switch (status) {
        case "approved": return "text-green-500 bg-green-100"
        case "rejected": return "text-red-500 bg-red-100"
        case "pending": return "text-orange-500 bg-orange-100"
    }
}

export function getLeaveTypeText(type: LeaveType) {
    switch (type) {
        case "annual":
            return "연차";
        case "half_am":
            return "오전 반차";
        case "half_pm":
            return "오후 반차";
    }
}