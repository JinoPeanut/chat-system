import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers";

export async function GET() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user_id")?.value;

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

    const departments = await prisma.department.findMany({
        where: { companyId: admin.companyId },
        select: {
            id: true,
            name: true,
            description: true,
            managerId: true,
            createdAt: true,
            updatedAt: true,
            manager: {
                select: {
                    id: true,
                    name: true,
                    position: true,
                    profilePic: true,
                }
            }
        },
        orderBy: {
            name: "asc",
        }
    });

    return NextResponse.json({
        departments,
    })
}

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user_id")?.value;

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

    const body = await request.json();

    const { name, description, managerId } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
        return NextResponse.json(
            { message: "부서명을 입력해 주세요." },
            { status: 400 }
        )
    }

    if (managerId) {
        const manager = await prisma.user.findFirst({
            where: {
                id: managerId,
                companyId: admin.companyId,
            },
            select: {
                id: true,
            },
        });

        if (!manager) {
            return NextResponse.json(
                { message: "부서장으로 지정할 사원을 찾을 수 없습니다." },
                { status: 404 }
            );
        }
    }

    const existingDepartment = await prisma.department.findFirst({
        where: {
            companyId: admin.companyId,
            name: name.trim(),
        }
    });

    if (existingDepartment) {
        return NextResponse.json(
            { message: "이미 존재하는 부서명 입니다." },
            { status: 409 },
        )
    }

    const department = await prisma.department.create({
        data: {
            name: name.trim(),
            description: typeof description === "string" ? description.trim() : null,
            companyId: admin.companyId,
            managerId: managerId || null,
        },
        select: {
            id: true,
            name: true,
            description: true,
            managerId: true,
            createdAt: true,
            updatedAt: true,
            manager: {
                select: {
                    id: true,
                    name: true,
                    position: true,
                    profilePic: true,
                }
            }
        },
    });

    return NextResponse.json(
        {
            message: "부서가 추가 되었습니다",
            department,
        },
        { status: 201 }
    )
}