import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { calculateAnnualLeave } from "@/utils/leaveUtils";
import { getKoreanDateTime } from "@/utils/dateUtils";

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user_id")?.value;

    if (!userId) {
        return NextResponse.json(
            { message: "로그인이 필요합니다." },
            { status: 401 }
        );
    }

    const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            companyId: true,
            createdAt: true,
        },
    });

    if (!currentUser) {
        return NextResponse.json(
            { message: "사용자를 찾을 수 없습니다." },
            { status: 404 }
        );
    }

    const { date: todayKey } = getKoreanDateTime(new Date());

    const attendance = await prisma.attendance.findFirst({
        where: {
            userId: currentUser.id,
            date: todayKey,
        },
        select: {
            date: true,
            checkInAt: true,
            checkOutAt: true,
            workMinutes: true,
        }
    });

    const getCurrentWeekRange = () => {
        const today = new Date(`${todayKey}T00:00:00Z`);
        const day = today.getUTCDay();

        // 일요일은 0이므로 지난 월요일까지 -6일
        const mondayOffset = day === 0 ? -6 : 1 - day;

        const monday = new Date(today);
        monday.setUTCDate(today.getUTCDate() + mondayOffset);

        const sunday = new Date(monday);
        sunday.setUTCDate(monday.getUTCDate() + 6);

        return {
            weekStart: monday.toISOString().slice(0, 10),
            weekEnd: sunday.toISOString().slice(0, 10),
        }
    }

    const { weekStart, weekEnd } = getCurrentWeekRange();

    const weeklyAttendances = await prisma.attendance.findMany({
        where: {
            userId: currentUser.id,
            date: {
                gte: weekStart,
                lte: weekEnd,
            }
        },
        select: {
            workMinutes: true,
        }
    })

    const weeklyWorkMinutes = weeklyAttendances.reduce((sum, attendance) => {
        return sum + (attendance.workMinutes ?? 0)
    }, 0);

    const workTime = 2400;

    const attendanceSummary = {
        today: attendance,
        workMinutes: weeklyWorkMinutes,
        leftMinutes: Math.max(0, workTime - weeklyWorkMinutes),
        workPercent: Math.min(100, (weeklyWorkMinutes / workTime) * 100),
    }

    const leaveBalance = await prisma.leaveBalance.findUnique({
        where: { userId: currentUser.id },
        select: {
            usedDays: true,
            useHours: true,
        }
    });

    const totalDays = calculateAnnualLeave(currentUser.createdAt.toISOString());
    const usedDays = leaveBalance?.usedDays ?? 0;
    const useHours = leaveBalance?.useHours ?? 0;

    const balance = {
        totalDays,
        usedDays,
        useHours,
        remainDays: totalDays - usedDays,
        remainHours: 8 - useHours,
        leavePercent: totalDays > 0
            ? Math.min(100, (usedDays / totalDays) * 100)
            : 0
    };

    const leaveHistory = await prisma.leaveHistory.findMany({
        where: { userId: currentUser.id },
        select: {
            id: true,
            leaveDate: true,
            usedDays: true,
            usedHours: true,
            leaveType: true,
            status: true,
            reason: true,
            createdAt: true,
        },
        orderBy: { createdAt: "desc" },
    });

    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 4)));

    const notices = await prisma.notice.findMany({
        where: {
            author: {
                companyId: currentUser.companyId,
            }
        },
        select: {
            id: true,
            title: true,
            category: true,
            createdAt: true,
            author: {
                select: {
                    name: true,
                    position: true,
                    profilePic: true,
                }
            }
        },
        orderBy: {
            createdAt: "desc",
        },
        take: limit,
    });

    const recentChat = await prisma.chatRoom.findMany({
        where: {
            members: {
                some: {
                    id: userId,
                }
            }
        },
        select: {
            id: true,
            members: {
                select: {
                    id: true,
                    name: true,
                    profilePic: true,
                }
            },
            messages: {
                orderBy: {
                    timeAt: "desc",
                },
                take: 1,
                select: {
                    id: true,
                    content: true,
                    timeAt: true,
                }
            },
        }
    })

    const profile = await prisma.profile.findUnique({
        where: { userId },
        select: {
            statusMsg: true,
            statusWork: true,
            bestWorker: true,
            tel: true,
        }
    });

    const now = new Date();

    const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
    );

    const startOfTomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
    );

    const scheduleHome = await prisma.schedule.findMany({
        where: {
            userId: currentUser.id,
            startAt: {
                gte: startOfToday,
                lt: startOfTomorrow,
            },
        },
        select: {
            id: true,
            title: true,
            titleMemo: true,
            startAt: true,
            endAt: true,
        },
        orderBy: {
            startAt: "asc",
        },
        take: 3,
    });

    const scheduleDetail = await prisma.schedule.findMany({
        where: {
            userId: currentUser.id
        },
        select: {
            id: true,
            title: true,
            titleMemo: true,
            content: true,
            startAt: true,
            endAt: true,
        },
        orderBy: {
            startAt: "asc",
        }
    })

    return NextResponse.json({
        attendance: attendanceSummary,
        recentChat,
        notices,
        leave: {
            leaveBalance: balance,
            leaveHistory: leaveHistory,
        },
        profile,
        schedules: {
            today: scheduleHome,
            calendar: scheduleDetail,
        }
    });
}
