import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const attendance = await prisma.attendance.findMany({
        orderBy: {
            date: "desc",
        },
    });

    return NextResponse.json(attendance);
}

export async function POST(request: Request) {
    const body = await request.json();

    const { userId, date, checkInAt, checkOutAt, workMinutes } = body;

    if (!userId || !date) {
        return NextResponse.json(
            { message: "필수 값이 없습니다." },
            { status: 400 }
        );
    }

    const attendance = await prisma.attendance.create({
        data: {
            id: crypto.randomUUID(),
            userId,
            date,
            checkInAt,
            checkOutAt,
            workMinutes,
        },
    });

    return NextResponse.json(attendance, { status: 201 });
}

export async function PATCH(request: Request) {
    const body = await request.json();
    const { userId, date, checkOutAt, workMinutes } = body;

    if (!userId || !date) {
        return NextResponse.json(
            { message: "필수 값이 없습니다." },
            { status: 400 }
        );
    }

    const existingAttendance = await prisma.attendance.findFirst({
        where: {
            userId,
            date,
        },
    });

    if (!existingAttendance) {
        return NextResponse.json(
            { message: "수정할 출석 기록이 없습니다." },
            { status: 404 }
        );
    }

    const updatedAttendance = await prisma.attendance.update({
        where: {
            id: existingAttendance.id,
        },
        data: {
            checkOutAt,
            workMinutes,
        },
    });

    return NextResponse.json(updatedAttendance);
}
