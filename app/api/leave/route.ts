import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const leaveBalance = await prisma.leaveBalance.findMany();
    const leaveHistory = await prisma.leaveHistory.findMany();

    return NextResponse.json({ leaveBalance, leaveHistory });
}