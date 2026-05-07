import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    const body = await request.json();

    // 타이핑 검사
    if (!body.email || !body.password) {
        return NextResponse.json(
            { message: "이메일 또는 비밀번호를 입력해 주세요" },
            { status: 400 }
        );
    }

    const existingUser = await prisma.user.findUnique({
        where: { email: body.email }
    });

    // 해당 이메일이 있는지 검사
    if (!existingUser) {
        return NextResponse.json(
            { message: "존재하지 않는 계정입니다." },
            { status: 404 }
        );
    }

    const isValidPassword = await bcrypt.compare(
        body.password,
        existingUser.passwordHash,
    );

    // 이메일이 있으면 비밀번호가 맞는지 검사
    if (!isValidPassword) {
        return NextResponse.json(
            { message: "비밀번호가 올바르지 않습니다." },
            { status: 401 }
        );
    }

    const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: { status: "online" }
    });

    const cookieStore = await cookies();

    cookieStore.set("auth_user_id", updatedUser.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    })

    // 모두 통과하면 값 리턴
    return NextResponse.json(
        {
            message: "로그인에 성공했습니다.",
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                department: updatedUser.department,
                position: updatedUser.position,
                status: updatedUser.status,
                createdAt: updatedUser.createdAt,
                companyId: updatedUser.companyId,
            },
        },
        { status: 200 }
    );
}