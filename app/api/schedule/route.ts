import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    // 홈 화면전용
    const schedule = await prisma.schedule.findMany();

    return NextResponse.json(schedule);
}