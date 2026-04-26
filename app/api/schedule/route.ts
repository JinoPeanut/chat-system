import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    // 스케줄 모든 데이터
    const schedule = await prisma.schedule.findMany();

    return NextResponse.json(schedule);
}

export async function POST(request: Request) {
    const body = await request.json();

    const schedule = await prisma.schedule.create({
        data: {
            userId: body.userId,
            title: body.title,
            titleMemo: body.titleMemo ? body.titleMemo : null,
            content: body.content ? body.content : null,
            startAt: new Date(body.startAt),
            endAt: body.endAt ? new Date(body.endAt) : null,
        }
    });

    return NextResponse.json(schedule);
}