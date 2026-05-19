"use client";
import ProfileAvatar from "@/components/common/ProfileAvatar";
import { useAuthStore } from "@/stores/useAuthStore";
import { Notice } from "@/types/notice";
import { getCategoryName, getCategoryStyle } from "@/utils/noticeUtils";
import { ChevronLeft, Clock, Download, Eye, MoreHorizontal, Paperclip, PinIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"

type NoticeDetailProps = {
    noticeId: string,
}

export default function NoticeDetail({ noticeId }: NoticeDetailProps) {
    const authUser = useAuthStore((state) => state.user);
    const router = useRouter();

    const [notice, setNotice] = useState<Notice | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toastMessage, setToastMessage] = useState("")
    const [toastType, setToastType] = useState<"error" | "success">("success");

    const notice_title = notice ? notice.title : "제목 없음";
    const notice_category = notice ? notice.category : "카테고리 없음";
    const notice_createdAt = notice ? notice.createdAt : "생성되지 않음";

    const isMyNotice = authUser?.id === notice?.authorId;

    function formatNoticeTime(createdAt: string) {
        if (!notice?.createdAt) return;

        const date = new Date(createdAt);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hour = String(date.getHours()).padStart(2, "0");
        const minute = String(date.getMinutes()).padStart(2, "0");

        return `${year}.${month}.${day} ${hour}:${minute}`;
    }

    const showToast = (message: string, type: "success" | "error") => {
        if (toastMessage) return;

        setToastMessage(message);
        setToastType(type);

        setTimeout(() => {
            setToastMessage("");
        }, 1500);
    }

    const fetchNoticeDetail = async () => {
        const res = await fetch(`/api/notice/${noticeId}`);
        const data = await res.json();

        setNotice(data);
    }

    const handleDelete = async () => {
        if (isDeleting) return
        if (!notice?.id) {
            showToast("삭제할 게시글 정보를 찾을 수 없습니다.", "error");
            return;
        }

        try {
            setIsDeleting(true);

            const res = await fetch("/api/notice", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: notice?.id,
                }),
            });

            if (!res.ok) {
                if (res.status === 401) {
                    showToast("로그인이 필요합니다.", "error");
                } else if (res.status === 400) {
                    showToast("게시글 아이디가 필요합니다.", "error");
                } else if (res.status === 404) {
                    showToast("삭제할 수 없는 게시물입니다.", "error");
                }
                return;
            }

            showToast("게시글이 삭제되었습니다.", "success");
            setTimeout(() => {
                router.push("/notice");
            }, 1500)
        } catch (error) {
            showToast("서버에 연결할 수 없습니다", "error");
        } finally {
            setIsDeleting(false);
        }

    }

    useEffect(() => {
        fetchNoticeDetail();
    }, [])

    return (
        <div className="h-[100dvh] flex flex-col gap-4 px-8 py-6 bg-white rounded-md">

            {/* 상호작용 메세지 */}
            {toastMessage && (
                <div className={`fixed right-40 top-15 z-50 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg
                    animate-slide-toast ${toastType === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
                    {toastMessage}
                    <div className={`mt-2 animate-toast-timer h-1 w-full ${toastType === "error" ? "bg-red-300" : "bg-emerald-300"}`} />
                </div>
            )}

            {/* 목록으로 버튼 */}
            <button className="mb-10">
                <div className="flex items-center text-gray-600 group">
                    <ChevronLeft className="group-hover:text-gray-800 cursor-pointer" />
                    <p className="group-hover:text-gray-800 cursor-pointer">
                        목록으로
                    </p>
                </div>
            </button>

            {/* 상단 - 고정, 제목, 태그, 버튼 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {notice?.isPinned ? <PinIcon size={25} className="text-red-600" /> : ""}
                    <h2 className="text-2xl font-bold">
                        {notice_title}
                    </h2>
                </div>
                <div className="relative flex items-center gap-5">
                    <div className={`px-3 py-1 rounded-full ${getCategoryStyle(notice_category)}`}>
                        {getCategoryName(notice_category)}
                    </div>
                    {isMyNotice &&
                        (<>
                            <button
                                type="button"
                                onClick={() => setMenuOpen((prev) => !prev)}
                                className="cursor-pointer hover:text-gray-300"
                            >
                                <MoreHorizontal />
                            </button>

                            {menuOpen && (
                                <div className="absolute top-10 right-0 rounded-md border boder-gray-300 shadow-md 
                                    flex flex-col gap-3 p-2 bg-white"
                                >
                                    <button
                                        onClick={() => router.push(`/notice/${noticeId}/edit`)}
                                        className="hover:bg-emerald-100 px-2 py-1 rounded-md cursor-pointer"
                                    >
                                        수정
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="hover:bg-red-100 px-2 py-1 rounded-md cursor-pointer"
                                    >
                                        {isDeleting ? "삭제중.." : "삭제"}
                                    </button>
                                </div>
                            )}
                        </>)
                    }
                </div>
            </div>

            {/* 상단 - 프로필사진, 이름, 시간, 조회수 */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <ProfileAvatar
                        src={notice?.author?.profilePic}
                        alt="프로필 사진"
                        size={25}
                    />
                    <p className="font-semibold text-lg">{notice?.author?.name}</p>
                </div>

                <div className="flex items-center gap-1 text-gray-500">
                    <Clock size={14} className="translate-y-[1px]" />
                    <p className="leading-none">{formatNoticeTime(notice_createdAt)}</p>
                </div>

                <div className="flex items-center gap-1 text-gray-500">
                    <Eye size={14} />
                    {/* 조회수 DB 컬럼에 꼭 추가하기 */}
                    {/* viewCount   Int     @default(0) */}
                </div>
            </div>

            <span className="w-full h-[1px] bg-gray-200 border border-gray-200/80 my-2" />

            {/* 게시물 내용 */}
            <div className="min-h-0 flex-1 overflow-y-auto">
                {notice?.content
                    ? (<div
                        className="whitespace-pre-wrap leading-7 text-gray-700"
                        dangerouslySetInnerHTML={{ __html: notice.content }}>
                    </div>)
                    : (<div className="flex h-full items-center justify-center text-gray-400">
                        <p>본문 내용이 없습니다.</p>
                    </div>)
                }

                {notice?.attachments
                    ?.filter((file) => file.fileType?.startsWith("image/"))
                    .map((file) => {
                        return (
                            <img
                                key={file.id}
                                src={file.fileUrl}
                                alt={file.fileName}
                                className="mt-4 max-h-[500px] w-full rounded-xl object-contain"
                            />
                        )
                    })
                }

                {notice?.attachments && notice.attachments.length > 0 && (
                    <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-3 flex items-center gap-2 font-semibold text-gray-700">
                            <Paperclip size={18} />
                            <span>첨부파일</span>
                        </div>

                        <div className="flex flex-col gap-2">
                            {notice.attachments.map((file) => {
                                return (
                                    <a
                                        key={file.id}
                                        href={file.fileUrl}
                                        download={file.fileName}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 hover:bg-gray-100"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-800">{file.fileName}</p>
                                            {file.fileSize && (
                                                <p className="text-sm text-gray-400">
                                                    {(file.fileSize / 1024).toFixed(1)} KB
                                                </p>
                                            )}
                                        </div>

                                        <Download size={18} className="text-gray-500" />
                                    </a>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}