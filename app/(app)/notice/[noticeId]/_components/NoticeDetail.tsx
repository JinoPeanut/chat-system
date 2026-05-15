"use client";
import ProfileAvatar from "@/components/common/ProfileAvatar";
import { useAuthStore } from "@/stores/useAuthStore";
import { Notice } from "@/types/notice";
import { getCategoryName, getCategoryStyle } from "@/utils/noticeUtils";
import { ChevronLeft, Clock, Eye, MoreHorizontal, PinIcon } from "lucide-react";
import { useEffect, useState } from "react"

type NoticeDetailProps = {
    noticeId: string,
}

export default function NoticeDetail({ noticeId }: NoticeDetailProps) {
    const authUser = useAuthStore((state) => state.user);

    const [notice, setNotice] = useState<Notice | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);

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

    const fetchNoticeDetail = async () => {
        const res = await fetch(`/api/notice/${noticeId}`);
        const data = await res.json();

        setNotice(data);
    }

    useEffect(() => {
        fetchNoticeDetail();
    }, [])

    return (
        <div className="h-[100dvh] flex flex-col gap-4 px-8 py-6 bg-white rounded-md">

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
                                        //onClick={}
                                        className="hover:bg-emerald-100 px-2 py-1 rounded-md cursor-pointer"
                                    >
                                        수정
                                    </button>
                                    <button
                                        //onClick={}
                                        className="hover:bg-red-100 px-2 py-1 rounded-md cursor-pointer"
                                    >
                                        삭제
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
                    ? (<div className="whitespace-pre-wrap leading-7 text-gray-700">
                        {notice.content}
                    </div>)
                    : (<div className="flex h-full items-center justify-center text-gray-400">
                        <p>본문 내용이 없습니다.</p>
                    </div>)
                }
            </div>
        </div>
    )
}