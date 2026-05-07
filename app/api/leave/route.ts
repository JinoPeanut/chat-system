import { prisma } from "@/lib/prisma";
import { calculateAnnualLeave } from "@/utils/leaveUtils";
import { NextResponse } from "next/server";

export async function GET() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            createdAt: true,
        },
    });

    for (const user of users) {
        const totalDays = calculateAnnualLeave(user.createdAt.toISOString());

        await prisma.leaveBalance.upsert({
            where: { userId: user.id },
            update: { totalDays },
            create: {
                id: crypto.randomUUID(),
                userId: user.id,
                totalDays,
                usedDays: 0,
                useHours: 0,
            },
        });
    }

    const leaveBalance = await prisma.leaveBalance.findMany();
    const leaveHistory = await prisma.leaveHistory.findMany();

    return NextResponse.json({ leaveBalance, leaveHistory });
}

export async function POST(request: Request) {
    const body = await request.json();

    if (!body.userId || !body.leaveDate || !body.leaveType) {
        return NextResponse.json(
            { message: "필수 값이 없습니다." },
            { status: 400 }
        );
    }

    const leave = await prisma.leaveHistory.create({
        data: {
            id: body.id,
            userId: body.userId,
            leaveDate: body.leaveDate,
            leaveType: body.leaveType,
            usedDays: body.usedDays,
            usedHours: body.usedHours,
            status: body.status,
            reason: body.reason,
            createdAt: new Date(body.createdAt),
        },
    });

    return NextResponse.json(leave, { status: 201 });
}
