import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    const body = await request.json();

    if (!body.name || !body.email || !body.password) {
        return NextResponse.json(
            { message: "필수 값이 없습니다." },
            { status: 400 }
        )
    }

    const existingUser = await prisma.user.findUnique({
        where: { email: body.email }
    });

    if (existingUser) {
        return NextResponse.json(
            { message: "이미 사용중인 이메일 입니다." },
            { status: 409 }
        );
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
        data: {
            id: crypto.randomUUID(),
            name: body.name,
            email: body.email,
            passwordHash,
            department: body.department,
            position: body.position,
            status: "offline",
            profilePic: null,
        },
    });

    return NextResponse.json(user, { status: 201 });
}