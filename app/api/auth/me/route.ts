import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user_id")?.value;

    if (!userId) {
        return NextResponse.json({ message: "로그인 정보 없음" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            department: true,
            position: true,
            status: true,
            profilePic: true,
            createdAt: true,
            companyId: true,
            role: true,
        }
    });

    if (!user) {
        return NextResponse.json({ message: "유저 없음" }, { status: 404 })
    }

    return NextResponse.json({ user }, { status: 200 })
}