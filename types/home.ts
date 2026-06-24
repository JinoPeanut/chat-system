import { HomeAttendance } from "./attendance";
import { RecentChat } from "./chat";
import { LeaveBalance, LeaveHistory } from "./leave";
import { Notice } from "./notice";
import { HomeProfile } from "./profile";
import { ScheduleDetail, ScheduleHome } from "./schedule";

export type RefreshOptions = {
    silent?: boolean,
}

export type HomeResponse = {
    attendance: HomeAttendance,
    recentChat: RecentChat[],
    notices: Notice[],
    leave: {
        leaveBalance: LeaveBalance,
        leaveHistory: LeaveHistory[],
    },
    profile: HomeProfile | null,
    schedules: {
        today: ScheduleHome[],
        calendar: ScheduleDetail[],
    }
};