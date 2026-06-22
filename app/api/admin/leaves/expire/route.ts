import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers";

export async function POST() {
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

    const result = await prisma.leaveHistory.updateMany({
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

    return NextResponse.json({
        message: `${result.count}건의 만료 연차를 반려 처리했습니다.`,
        count: result.count,
    })
}