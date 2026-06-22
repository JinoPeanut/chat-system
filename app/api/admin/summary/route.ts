import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
    const leaveMonth = request.nextUrl.searchParams.get("leaveMonth");
    const noticePeriod = request.nextUrl.searchParams.get("noticePeriod");
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user_id")?.value;

    if (!userId) {
        return NextResponse.json({ message: "로그인 정보 없음" }, { status: 401 })
    }

    const currentUser = await prisma.user.findFirst({
        where: { id: userId, },
        select: {
            companyId: true,
            role: true,
        }
    })

    if (!currentUser || currentUser.role !== "ADMIN") {
        return NextResponse.json(
            { message: "관리자 권한이 필요합니다." },
            { status: 403 }
        );
    }

    const now = new Date();

    const fallbackMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const selectedLeaveMonth = leaveMonth ?? fallbackMonth;
    const selectNoticePeriod = noticePeriod ?? "last7Days";

    const [yearText, monthText] = selectedLeaveMonth.split("-");

    const year = Number(yearText);
    const monthIndex = Number(monthText) - 1;

    const leaveMonthStart = new Date(year, monthIndex, 1);
    const leaveNextMonthStart = new Date(year, monthIndex + 1, 1);

    const thisMonthStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
    );

    const nextMonthStart = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1,
    );

    const lastMonthStart = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
    )

    const getDateKey = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    const userTotal = await prisma.user.count({
        where: { companyId: currentUser.companyId }
    });

    const onlineUserTotal = await prisma.user.count({
        where: {
            companyId: currentUser.companyId,
            status: "online",
        },
    })

    // 부서의 갯수
    const departmentTotal = await prisma.department.count({
        where: {
            companyId: currentUser.companyId
        }
    })

    // 연차 API 영역
    const thisMonthPendingLeaveTotal = await prisma.leaveHistory.count({
        where: {
            status: "pending",
            createdAt: {
                gte: thisMonthStart,
                lt: nextMonthStart,
            },
            user: { companyId: currentUser.companyId }
        }
    });

    const lastMonthPendingLeaveTotal = await prisma.leaveHistory.count({
        where: {
            status: "pending",
            createdAt: {
                gte: lastMonthStart,
                lt: thisMonthStart,
            },
            user: { companyId: currentUser.companyId }
        }
    })

    const pendingLeaveDiff = thisMonthPendingLeaveTotal - lastMonthPendingLeaveTotal;

    const selectedPendingLeaveTotal = await prisma.leaveHistory.count({
        where: {
            status: "pending",
            createdAt: {
                gte: leaveMonthStart,
                lt: leaveNextMonthStart,
            },
            user: {
                companyId: currentUser.companyId,
            },
        },
    });

    const approvedLeaveTotal = await prisma.leaveHistory.count({
        where: {
            status: "approved",
            createdAt: {
                gte: leaveMonthStart,
                lt: leaveNextMonthStart,
            },
            user: { companyId: currentUser.companyId }
        }
    })

    const rejectedLeaveTotal = await prisma.leaveHistory.count({
        where: {
            status: "rejected",
            createdAt: {
                gte: leaveMonthStart,
                lt: leaveNextMonthStart,
            },
            user: { companyId: currentUser.companyId }
        }
    })

    const leaveChartData = [
        { name: "대기", value: selectedPendingLeaveTotal },
        { name: "승인", value: approvedLeaveTotal },
        { name: "반려", value: rejectedLeaveTotal },
    ]

    // 게시글 API 영역

    const thisMonthNoticeTotal = await prisma.notice.count({
        where: {
            createdAt: {
                gte: thisMonthStart,
                lt: nextMonthStart,
            },
            author: { companyId: currentUser.companyId }
        }
    })

    const lastMonthNoticeTotal = await prisma.notice.count({
        where: {
            createdAt: {
                gte: lastMonthStart,
                lt: thisMonthStart,
            },
            author: { companyId: currentUser.companyId }
        }
    })

    let noticeChartData: { label: string, count: number }[] = [];

    if (selectNoticePeriod === "last7Days") {
        const last7DaysStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 6,
        );

        const tomorrowStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1,
        );

        const notices = await prisma.notice.findMany({
            where: {
                createdAt: {
                    gte: last7DaysStart,
                    lt: tomorrowStart,
                },
                author: { companyId: currentUser.companyId },
            },
            select: {
                createdAt: true,
            }
        });

        const noticeCountByDate = notices.reduce<Record<string, number>>(
            (acc, notice) => {
                const key = getDateKey(notice.createdAt);

                acc[key] = (acc[key] ?? 0) + 1;

                return acc;
            },
            {},
        );

        noticeChartData = Array.from({ length: 7 }, (_, index) => {
            const targetDate = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() - 6 + index,
            );

            const key = getDateKey(targetDate);

            return {
                label: `${targetDate.getMonth() + 1}/${targetDate.getDate()}`,
                count: noticeCountByDate[key] ?? 0,
            }
        })
    }

    if (selectNoticePeriod === "thisMonth") {

        const notices = await prisma.notice.findMany({
            where: {
                createdAt: {
                    gte: thisMonthStart,
                    lt: nextMonthStart,
                },
                author: { companyId: currentUser.companyId },
            },
            select: {
                createdAt: true,
            }
        });

        const noticeCountByDate = notices.reduce<Record<string, number>>(
            (acc, notice) => {
                const key = getDateKey(notice.createdAt);

                acc[key] = (acc[key] ?? 0) + 1;

                return acc;
            },
            {},
        );

        const daysInThisMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
        ).getDate();

        noticeChartData = Array.from({ length: daysInThisMonth }, (_, index) => {
            const targetDate = new Date(
                now.getFullYear(),
                now.getMonth(),
                index + 1,
            );

            const key = getDateKey(targetDate);

            return {
                label: `${targetDate.getDate()}일`,
                count: noticeCountByDate[key] ?? 0,
            }
        })
    }

    if (selectNoticePeriod === "thisYear") {
        const thisYearStart = new Date(
            now.getFullYear(),
            0,
            1,
        );

        const nextYearStart = new Date(
            now.getFullYear() + 1,
            0,
            1,
        );

        const notices = await prisma.notice.findMany({
            where: {
                createdAt: {
                    gte: thisYearStart,
                    lt: nextYearStart,
                },
                author: { companyId: currentUser.companyId },
            },
            select: {
                createdAt: true,
            }
        });

        const noticeCountByMonth = notices.reduce<Record<string, number>>(
            (acc, notice) => {
                const month = notice.createdAt.getMonth();

                acc[month] = (acc[month] ?? 0) + 1;

                return acc;
            },
            {},
        );

        noticeChartData = Array.from({ length: 12 }, (_, index) => {
            return {
                label: `${index + 1}월`,
                count: noticeCountByMonth[index] ?? 0,
            }
        })
    }

    const monthlyNoticeDiff = thisMonthNoticeTotal - lastMonthNoticeTotal;

    return NextResponse.json({
        userTotal,
        onlineUserTotal,
        departmentTotal,
        pendingLeaveTotal: thisMonthPendingLeaveTotal,
        pendingLeaveDiff,
        monthlyNoticeTotal: thisMonthNoticeTotal,
        monthlyNoticeDiff,

        leaveChartData,
        noticeChartData,
    })
}