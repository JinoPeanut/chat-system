import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user_id")?.value;

    if (userId) {
        await prisma.user.update({
            where: { id: userId },
            data: { status: "offline" },
        })
    }

    cookieStore.delete("auth_user_id");

    return NextResponse.json(
        { message: "로그아웃 되었습니다." },
        { status: 200 }
    );
}