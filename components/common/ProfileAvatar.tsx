import { UserStatus } from "@/types/chat"
import { getStatusRingColor } from "../chat/SideBar"
import { User } from "lucide-react";

type ProfileAvatarProps = {
    src?: string | null,
    status?: UserStatus,
    size?: number,
    alt?: string,
    absolute?: string,
    absoluteStyle?: string,
}

export default function ProfileAvatar({ src, status, size, alt = "프로필 사진", absolute, absoluteStyle }: ProfileAvatarProps) {

    const ringColor = status ? getStatusRingColor(status) : "ring-gray-400";

    if (src) {
        return (
            <img
                src={src}
                alt={alt}
                className={`${absolute} ${absoluteStyle} rounded-full object-cover ring-3 ${ringColor}`}
                style={{ width: size, height: size }}
            />
        )
    }

    return (
        <div
            className={`${absolute} ${absoluteStyle} flex items-center justify-center rounded-full ring-3 ${ringColor}`}
            style={{ width: size, height: size }}
        >
            <User className={`w-3/4 h-3/4 text-slate-400`} />
        </div>
    )
}