import { UserStatus } from "@/types/chat";

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