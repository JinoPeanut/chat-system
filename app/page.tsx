import AttendancePanel from "@/components/home/AttendancePanel";
import LeavePanel from "@/components/home/leave/LeavePanel";
import NoticePanel from "@/components/home/NoticePanel";
import ProfileCard from "@/components/home/ProfileCard";
import RecentChatsPanel from "@/components/home/RecentChatsPanel";
import TodaySchedulePanel from "@/components/home/TodaySchedulePanel";

export default function HomePage() {
  return (
    <div>
      {/* 최상단 텍스트 */}
      <div className="flex items-end gap-2 px-2 pt-2">
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
          <AttendancePanel />
          <LeavePanel />
        </div>

        {/* 중간 - 최근채팅, 공지사항 */}
        <div className="col-span-6">
          <RecentChatsPanel />
          <NoticePanel />
        </div>
        {/* 오른쪽 - 오늘일정, 프로필카드 */}
        <div className="col-span-3">
          <ProfileCard />
          <TodaySchedulePanel />
        </div>
      </div>
    </div>
  )
}