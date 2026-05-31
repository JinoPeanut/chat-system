"use client";

import { useHomeData } from "@/hooks/home/useHomeData";
import AttendancePanel from "./attendance/AttendancePanel";
import LeavePanel from "./leave/LeavePanel";
import NoticePanel from "./notice/HomeNoticePanel";
import ProfileCard from "./profile/ProfileCard";
import RecentChatsPanel from "./RecentChatsPanel";
import TodaySchedulePanel from "./schedule/TodaySchedulePanel";
import HomeSkeleton from "./skeletons/HomeSkeleton";
import ToastMessage from "../ui/ToastMessage";
import { useEffect, useState } from "react";

export default function HomeClient() {
    const { homeData, isLoading, errorMessage, refetchHome } = useHomeData();
    const [toastMessage, setToastMessage] = useState("");

    useEffect(() => {
        if (errorMessage && homeData) {
            setToastMessage(errorMessage);
        }
    }, [errorMessage, homeData]);

    if (isLoading) {
        return <HomeSkeleton />
    }

    if (errorMessage && !homeData) {
        return <div className="flex justify-center items-center p-4">{errorMessage}</div>
    }

    if (!homeData) {
        return <div className="flex justify-center items-center p-4">홈 데이터가 없습니다.</div>;
    }

    return (
        <div>
            <ToastMessage
                message={toastMessage}
                type="error"
                onClose={() => setToastMessage("")}
            />

            {/* 최상단 텍스트 */}
            <div className="flex items-end gap-2 px-6 pt-2">
                <p className="font-bold text-sm">
                    메인 홈
                </p>
                <p className="text-xs text-gray-400">
                    내 화면
                </p>
            </div>

            {/* 메인 섹션 */}
            <div className="grid grid-cols-12 gap-4 p-4">

                {/* 왼쪽 - 근태 관리*/}
                <div className="col-span-3">
                    <AttendancePanel
                        attendance={homeData.attendance}
                        onRefresh={refetchHome}
                    />
                    <LeavePanel
                        leave={homeData.leave}
                        onRefresh={refetchHome}
                    />
                </div>

                {/* 중간 - 최근채팅, 공지사항 */}
                <div className="col-span-6">
                    <RecentChatsPanel recentChat={homeData.recentChat} />
                    <NoticePanel notices={homeData.notices} />
                </div>
                {/* 오른쪽 - 오늘일정, 프로필카드 */}
                <div className="col-span-3">
                    <ProfileCard
                        profile={homeData.profile}
                        onRefresh={refetchHome}
                    />
                    <TodaySchedulePanel
                        schedule={homeData.schedules}
                        onRefresh={refetchHome}
                    />
                </div>
            </div>
        </div>
    )
}