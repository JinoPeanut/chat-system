import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user_id")?.value;

    if (!userId) {
        return NextResponse.json(
            { message: "로그인이 필요합니다." },
            { status: 401 }
        );
    }

    const body = await request.json();

    const { date, checkInAt, checkOutAt, workMinutes } = body;

    if (!date) {
        return NextResponse.json(
            { message: "필수 값이 없습니다." },
            { status: 400 }
        );
    }

    const existingAttendance = await prisma.attendance.findFirst({
        where: {
            userId,
            date
        }
    })

    if (existingAttendance) {
        return NextResponse.json(
            { message: "이미 출근 처리되어 있습니다." },
            { status: 409 }
        )
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
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user_id")?.value;

    if (!userId) {
        return NextResponse.json(
            { message: "로그인이 필요합니다." },
            { status: 401 }
        );
    }

    const body = await request.json();
    const { date, checkOutAt, workMinutes } = body;

    if (!date) {
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
