import { HomeAttendance } from "./attendance";
import { Chat } from "./chat";
import { LeaveBalance, LeaveHistory } from "./leave";
import { Notice } from "./notice";
import { HomeProfile } from "./profile";

export type HomeResponse = {
    attendance: HomeAttendance,
    recentChat: Chat[],
    notices: Notice[],
    leave: {
        leaveBalance: LeaveBalance,
        leaveHistory: LeaveHistory[],
    },
    profile: HomeProfile | null,
};