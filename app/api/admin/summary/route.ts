import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers";

export async function GET() {
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

    const userTotal = await prisma.user.count({
        where: { companyId: currentUser.companyId }
    });

    const onlineUserTotal = await prisma.user.count({
        where: {
            companyId: currentUser.companyId,
            status: "online",
        },
    })

    const userForDepartment = await prisma.user.findMany({
        where: { companyId: currentUser.companyId },
        select: { department: true }
    });

    const departmentTotal = new Set(
        userForDepartment.map((user) => user.department).filter(Boolean)
    ).size;

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

    const monthlyNoticeDiff = thisMonthNoticeTotal - lastMonthNoticeTotal;

    return NextResponse.json({
        userTotal,
        onlineUserTotal,
        departmentTotal,
        pendingLeaveTotal: thisMonthPendingLeaveTotal,
        pendingLeaveDiff,
        monthlyNoticeTotal: thisMonthNoticeTotal,
        monthlyNoticeDiff,
    })
}