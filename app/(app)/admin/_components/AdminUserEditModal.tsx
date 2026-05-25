import ProfileAvatar from "@/components/common/ProfileAvatar"
import { User } from "@/types/chat"
import { getStatusCardColor, getStatusColor, getStatusText } from "@/utils/statusUtils"
import { formatUserCreatedAt } from "./AdminUserPage"

type AdminUserEditModalProps = {
    user: User,
    onClose: () => void,
}

export default function AdminUserEditModal({ user, onClose }: AdminUserEditModalProps) {
    return (
        <div onClick={onClose}
            className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div onClick={(e) => e.stopPropagation()}
                className="bg-white p-4 rounded-md w-full max-w-md">
                <div className="flex flex-col">
                    {/* 상단 제목 */}
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold tracking-tight">사원 정보 수정</h3>
                    </div>

                    <div className="grid grid-cols-[170px_1fr] justify-center items-center mt-10">
                        <div className="flex flex-col justify-center items-center gap-3 px-6">
                            <ProfileAvatar
                                src={user.profilePic}
                                size={120}
                                alt={`${user.name}의 프로필`}
                            />

                            <p className="font-semibold">{user.name}</p>

                            <div className={`flex items-center gap-1 rounded-full px-2 py-1 ${getStatusCardColor(user.status)}`}>
                                <div className={`w-2 h-2 ${getStatusColor(user.status)} rounded-full`} />
                                <p>{getStatusText(user.status)}</p>
                            </div>

                            <p className="text-sm text-gray-500">{user.email}</p>

                            <p className="text-sm text-gray-500">가입일: {formatUserCreatedAt(user.createdAt)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}