"use client"

import { User } from "@/types/chat"
import { HomeResponse, Notice, NOTICE_TABS, NoticeScope } from "@/types/notice";
import { useEffect, useState } from "react";

const getCategoryName = (category: string) => {
    if (category === "notice") return "공지사항"
    if (category === "event") return "이벤트"
    if (category === "update") return "업데이트"
    if (category === "etc") return "기타"
}

export default function NoticePanel() {
    const [activeTab, setActiveTab] = useState<NoticeScope>("all");
    const [users, setUsers] = useState<User[]>([]);
    const [notices, setNotices] = useState<Notice[]>([]);

    const filteredNotices = notices
        .filter((notice) => activeTab === "all" || notice.category === activeTab);

    useEffect(() => {
        const fetchHomeData = async () => {
            const res = await fetch("/api/home");
            const data: HomeResponse = await res.json();

            setUsers(data.users);
            setNotices(data.notices);
        }

        fetchHomeData();
    }, [])

    return (
        <div className="border border-gray-200 rounded-md
                px-2 pb-4 shadow-lg min-h-[60%] mb-4">
            <div>
                <h3 className="text-sm font-bold pt-3">게시판</h3>
            </div>

            {/* 탭 - 전체, 공지사항, 이벤트 등 */}
            <div className="flex gap-4 mb-2">
                {NOTICE_TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`
                            ${activeTab === tab.key
                                ? "border-b-2 border-black text-black font-bold"
                                : "text-gray-400 font-bold"}}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* 게시글 목록 */}
            <div className="flex flex-col gap-2">
                {filteredNotices.map((notice) => {
                    const author = notice.author;
                    const authorName = author?.name ?? "알 수 없음";
                    const authorProfile = author?.profilePic;

                    return (
                        <div key={notice.id}>
                            {/* 태그, 제목 */}
                            <p className="font-bold tracking-tight mb-1">
                                [{getCategoryName(notice.category)}] {notice.title}
                            </p>

                            <div className="flex items-center gap-2">
                                {/* 프로필 사진 */}
                                <img
                                    src={authorProfile ?? "/default-avatar.png"} alt={authorName}
                                    className="w-[1.5rem] h-[1.5rem] rounded-full bg-gray-400"
                                />
                                {/* 이름, 직급 */}
                                <span className="text-sm text-gray-400 tracking-tight">
                                    {authorName} {author?.position}
                                </span>

                                {/* 업로드 시간 */}
                                <span className="text-sm text-gray-400 tracking-tight">
                                    {notice.createdAt.slice(0, 10)}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}