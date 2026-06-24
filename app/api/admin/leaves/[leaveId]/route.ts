import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers";
import { LeaveStatus } from "@prisma/client";
import { calculateAnnualLeave } from "@/utils/leaveUtils";

export async function PATCH(request: Request, { params }: { params: Promise<{ leaveId: string }> }) {
    const { leaveId } = await params;
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
        }
    })

    if (!admin || admin.role !== "ADMIN") {
        return NextResponse.json(
            { message: "관리자 권한이 필요합니다." },
            { status: 403 }
        );
    }

    const body = await request.json();
    const { status } = body;

    if (status !== LeaveStatus.approved && status !== LeaveStatus.rejected) {
        return NextResponse.json(
            { message: "승인 또는 반려 요청이 아닙니다." },
            { status: 400 }
        )
    }

    const leave = await prisma.leaveHistory.findFirst({
        where: {
            id: leaveId,
            user: {
                companyId: admin.companyId,
            }
        },
        select: {
            id: true,
            userId: true,
            leaveDate: true,
            status: true,
            usedDays: true,
            usedHours: true,
            user: {
                select: {
                    name: true,
                    // 유저의 입사일을 기준으로 연차를 계산하기 때문에
                    // createdAt 을 허용
                    createdAt: true,
                }
            }
        }
    });

    if (!leave) {
        return NextResponse.json(
            { message: "처리할 연차 신청을 찾을 수 없습니다." },
            { status: 404 }
        );
    }

    if (status === LeaveStatus.approved && leave.leaveDate < todayText) {
        return NextResponse.json(
            { message: "이미 지난 연차는 승인할 수 없습니다." },
            { status: 400 }
        )
    }

    if (leave.status !== LeaveStatus.pending) {
        return NextResponse.json(
            { message: "이미 처리된 연차 신청입니다." },
            { status: 400 }
        );
    }

    const result = await prisma.$transaction(async (tx) => {
        if (status === LeaveStatus.approved) {
            const totalDays = calculateAnnualLeave(leave.user.createdAt.toISOString());

            const balance = await tx.leaveBalance.upsert({
                where: { userId: leave.userId },
                update: {
                    totalDays,
                    usedDays: { increment: leave.usedDays },
                    useHours: { increment: leave.usedHours },
                },
                create: {
                    id: crypto.randomUUID(),
                    userId: leave.userId,
                    totalDays,
                    usedDays: leave.usedDays,
                    useHours: leave.usedHours,
                }
            });

            const updatedLeave = await tx.leaveHistory.update({
                where: { id: leave.id },
                data: {
                    status,
                }
            });

            await tx.adminActivityLog.create({
                data: {
                    adminId: userId,
                    companyId: admin.companyId,
                    type: "leave",
                    message: `관리자가 부서 ${leave.user.name}님의 연차 신청을 승인했습니다.`,
                    targetId: leave.id,
                    targetType: "leave",
                }
            })

            return {
                leave: updatedLeave,
                balance,
            }
        }

        const updatedLeave = await tx.leaveHistory.update({
            where: { id: leave.id },
            data: {
                status,
            }
        });

        await tx.adminActivityLog.create({
            data: {
                adminId: userId,
                companyId: admin.companyId,
                type: "leave",
                message: `관리자가 부서 ${leave.user.name}님의 연차 신청을 반려했습니다.`,
                targetId: leave.id,
                targetType: "leave",
            }
        });

        return {
            leave: updatedLeave,
            balance: null,
        }
    })

    return NextResponse.json({
        message: status === LeaveStatus.approved
            ? "연차 신청이 승인되었습니다."
            : "연차 신청이 반려되었습니다.",
        result,
    })
}