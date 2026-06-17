import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers";
import { LeaveStatus, Prisma } from "@prisma/client";
import { calculateAnnualLeave } from "@/utils/leaveUtils";

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user_id")?.value;
    const today = new Date();
    const todayText = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    if (!userId) {
        return NextResponse.json({ message: "로그인 정보 없음" }, { status: 401 })
    }

    const admin = await prisma.user.findFirst({
        where: { id: userId, },
        select: {
            companyId: true,
            role: true,
            company: {
                select: {
                    name: true,
                }
            }
        }
    })

    if (!admin || admin.role !== "ADMIN") {
        return NextResponse.json(
            { message: "관리자 권한이 필요합니다." },
            { status: 403 }
        );
    }

    today.setHours(0, 0, 0, 0);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 7)));
    const status = searchParams.get("status")?.trim();
    const department = searchParams.get("department")?.trim();
    const periodStart = searchParams.get("periodStart")?.trim();
    const periodEnd = searchParams.get("periodEnd")?.trim();

    if (periodStart && periodEnd && periodStart > periodEnd) {
        return NextResponse.json(
            { message: "시작일은 종료일보다 늦을 수 없습니다." },
            { status: 400 }
        );
    }

    const userWhere: Prisma.UserWhereInput = {
        companyId: admin.companyId
    }

    const where: Prisma.LeaveHistoryWhereInput = {
        user: userWhere,
    };

    const isLeaveStatus = (value: string): value is LeaveStatus => {
        return Object.values(LeaveStatus).includes(value as LeaveStatus);
    }

    if (status) {
        if (!isLeaveStatus(status)) {
            return NextResponse.json(
                { message: "올바르지 않은 연차 상태 입니다." },
                { status: 400 }
            )
        }

        where.status = status;
    }

    if (department) {
        userWhere.department = department;
    }

    if (periodStart || periodEnd) {
        where.createdAt = {};

        if (periodStart) {
            where.createdAt.gte = new Date(periodStart);
        }

        if (periodEnd) {
            const endDate = new Date(periodEnd);
            endDate.setDate(endDate.getDate() + 1);

            where.createdAt.lt = endDate;
        }
    }

    await prisma.leaveHistory.updateMany({
        where: {
            status: "pending",
            leaveDate: {
                lt: todayText,
            },
            user: {
                companyId: admin.companyId,
            }
        },
        data: {
            status: "rejected",
        }
    })

    const leaveTotal = await prisma.leaveHistory.count({
        where,
    })

    const leaves = await prisma.leaveHistory.findMany({
        where,
        select: {
            id: true,
            userId: true,
            createdAt: true,
            leaveDate: true,
            leaveType: true,
            usedDays: true,
            usedHours: true,
            status: true,
            reason: true,
            user: {
                select: {
                    name: true,
                    department: true,
                    position: true,
                    profilePic: true,
                }
            }
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
    })

    const departmentOptions = await prisma.department.findMany({
        where: { companyId: admin.companyId },
        select: {
            id: true,
            name: true,
        },
        orderBy: {
            name: "asc",
        }
    })

    const users = await prisma.user.findMany({
        where: { companyId: admin.companyId },
        select: {
            id: true,
            name: true,
            department: true,
            position: true,
            createdAt: true,
            leaveHistory: {
                where: {
                    status: "approved",
                },
                select: {
                    id: true,
                    leaveDate: true,
                    leaveType: true,
                    usedDays: true,
                    usedHours: true,
                    reason: true,
                }
            }
        }
    })

    const allUserHaveLeaveDays = users.reduce((sum, user) => {
        return sum + calculateAnnualLeave(user.createdAt.toISOString());
    }, 0)

    const approvedLeaves = await prisma.leaveHistory.findMany({
        where: {
            status: "approved",
            user: {
                companyId: admin.companyId,
            }
        },
        select: {
            usedDays: true,
            usedHours: true,
        }
    })

    const allUserUseLeaveDays = approvedLeaves.reduce((sum, leave) => {
        return sum + leave.usedDays
    }, 0);

    const remainLeaveDays = allUserHaveLeaveDays - allUserUseLeaveDays;

    const allUserUseLeaveHours = approvedLeaves.reduce((sum, leave) => {
        return sum + leave.usedHours
    }, 0);

    const useRate = allUserHaveLeaveDays === 0
        ? 0
        : (allUserUseLeaveDays / allUserHaveLeaveDays) * 100;

    const remainRate = allUserHaveLeaveDays === 0
        ? 0
        : (remainLeaveDays / allUserHaveLeaveDays) * 100;

    const departments = await prisma.department.findMany({
        where: {
            companyId: admin.companyId,
            ...(department ? { name: department } : {}),
        },
        select: {
            id: true,
            name: true,
            manager: {
                select: {
                    name: true,
                }
            }
        },
        orderBy: { name: "asc" },
    })

    const departmentStats = departments.map((dept) => {
        const departmentUsers = users.filter((user) => user.department === dept.name);

        const memberCount = departmentUsers.length;

        const annualDays = departmentUsers.reduce((sum, user) => {
            const userAnnual = user.leaveHistory.reduce((leaveSum, leave) => {
                if (leave.leaveType !== "annual") return leaveSum;

                return leaveSum + leave.usedDays;
            }, 0)

            return sum + userAnnual;
        }, 0);

        const halfAmDays = departmentUsers.reduce((sum, user) => {
            const userHalfAm = user.leaveHistory.reduce((leaveSum, leave) => {
                if (leave.leaveType !== "half_am") return leaveSum;

                return leaveSum + leave.usedDays;
            }, 0);

            return sum + userHalfAm;
        }, 0);

        const halfPmDays = departmentUsers.reduce((sum, user) => {
            const userHalfPm = user.leaveHistory.reduce((leaveSum, leave) => {
                if (leave.leaveType !== "half_pm") return leaveSum;

                return leaveSum + leave.usedDays;
            }, 0);

            return sum + userHalfPm;
        }, 0);

        const totalDays = departmentUsers.reduce((sum, user) => {
            return sum + calculateAnnualLeave(user.createdAt.toISOString());
        }, 0);

        const usedDays = departmentUsers.reduce((sum, user) => {
            const userUsedDays = user.leaveHistory.reduce((leaveSum, leave) => {
                return leaveSum + leave.usedDays;
            }, 0)

            return sum + userUsedDays;
        }, 0);

        // 나중에 시간 관련 사용하면 return 에 추가하기.
        const usedHours = departmentUsers.reduce((sum, user) => {

            const userUsedHours = user.leaveHistory.reduce((leaveSum, leave) => {
                return leaveSum + leave.usedHours;
            }, 0)

            return sum + userUsedHours;
        }, 0);

        const remainDays = totalDays - usedDays;

        const useRate = totalDays === 0 ? 0 : (usedDays / totalDays) * 100;

        const averageUsedDays = departmentUsers.length === 0 ? 0 : usedDays / departmentUsers.length;

        const annualRate = usedDays === 0 ? 0 : (annualDays / totalDays) * 100;
        const halfAmRate = usedDays === 0 ? 0 : (halfAmDays / totalDays) * 100;
        const halfPmRate = usedDays === 0 ? 0 : (halfPmDays / totalDays) * 100;

        const recentLeaves = departmentUsers.flatMap((user) =>
            user.leaveHistory.map((leave) => ({
                id: leave.id,
                position: user.position,
                userName: user.name,
                leaveDate: leave.leaveDate,
                leaveType: leave.leaveType,
                usedDays: leave.usedDays,
                usedHours: leave.usedHours,
                reason: leave.reason,
            })))
            .sort((a, b) => new Date(b.leaveDate).getTime() - new Date(a.leaveDate).getTime())
            .slice(0, 5);

        return {
            departmentId: dept.id,
            department: dept.name,
            managerName: dept.manager?.name ?? "미지정",
            memberCount,
            totalDays,
            usedDays,
            remainDays,
            useRate,
            averageUsedDays,
            leaveTypeStats: [
                {
                    type: "annual",
                    label: "연차",
                    days: annualDays,
                    rate: annualRate,
                },
                {
                    type: "half_am",
                    label: "오전 반차",
                    days: halfAmDays,
                    rate: halfAmRate,
                },
                {
                    type: "half_pm",
                    label: "오후 반차",
                    days: halfPmDays,
                    rate: halfPmRate,
                }
            ],
            recentLeaves,
        }
    }
    )

    return NextResponse.json({
        leaves,
        departmentOptions,
        summary: {
            totalDays: allUserHaveLeaveDays,
            usedDays: allUserUseLeaveDays,
            remainDays: remainLeaveDays,
            usedHours: allUserUseLeaveHours,
            useRate,
            remainRate,
        },
        page,
        limit,
        leaveTotal,
        totalPages: Math.max(1, Math.ceil(leaveTotal / limit)),
        departmentStats,
    })
}