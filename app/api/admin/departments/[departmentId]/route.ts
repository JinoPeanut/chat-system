
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers";

export async function PATCH(request: Request, { params }: { params: Promise<{ departmentId: string }> }) {
    const { departmentId } = await params;
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
            id: {
                not: departmentId,
            }
        }
    });

    if (existingDepartment) {
        return NextResponse.json(
            { message: "이미 존재하는 부서명 입니다." },
            { status: 409 },
        )
    }

    const targetDepartment = await prisma.department.findFirst({
        where: {
            id: departmentId,
            companyId: admin.companyId,
        }
    })

    if (!targetDepartment) {
        return NextResponse.json(
            { message: "해당 부서는 수정할 수 없습니다." },
            { status: 403 }
        );
    }

    const prevDepartmentName = targetDepartment.name;
    const newDepartmentName = name.trim();

    const department = await prisma.$transaction(async (tx) => {

        // 부서명을 변경 시 기존에 있는 사원들의 부서명도 같이 변경하도록 함.
        if (prevDepartmentName !== newDepartmentName) {
            await tx.user.updateMany({
                where: {
                    companyId: admin.companyId,
                    department: prevDepartmentName,
                },
                data: {
                    department: newDepartmentName,
                }
            })
        }

        const updateDepartment = await tx.department.update({
            where: { id: departmentId },
            data: {
                name: name.trim(),
                managerId: managerId || null,
                description: description || null,
            },
            select: {
                id: true,
                name: true,
                managerId: true,
                description: true,
            }
        });

        await tx.adminActivityLog.create({
            data: {
                adminId: userId,
                companyId: admin.companyId,
                type: "default",
                message: `관리자가 부서 ${updateDepartment.name}을 수정했습니다.`,
                targetId: updateDepartment.id,
                targetType: "department",
            }
        })

        return updateDepartment;
    })

    return NextResponse.json({
        message: "부서 정보가 수정되었습니다.",
        department,
    });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ departmentId: string }> }) {
    const { departmentId } = await params;
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

    const targetDepartment = await prisma.department.findFirst({
        where: {
            id: departmentId,
            companyId: admin.companyId,
        }
    })

    if (!targetDepartment) {
        return NextResponse.json(
            { message: "해당 부서를 찾을 수 없습니다." },
            { status: 404 }
        );
    }

    const departmentMemberCount = await prisma.user.count({
        where: {
            companyId: admin.companyId,
            department: targetDepartment.name,
        }
    })

    if (departmentMemberCount > 0) {
        return NextResponse.json(
            { message: "소속 사원이 있는 부서는 삭제할 수 없습니다." },
            { status: 400 }
        );
    }

    const department = await prisma.$transaction(async (tx) => {

        const deleteDepartment = await tx.department.delete({
            where: {
                id: departmentId,
            }
        });

        await tx.adminActivityLog.create({
            data: {
                adminId: userId,
                companyId: admin.companyId,
                type: "default",
                message: `관리자가 부서 ${deleteDepartment.name}을 삭제했습니다.`,
                targetId: deleteDepartment.id,
                targetType: "department",
            }
        })

        return deleteDepartment;
    })

    return NextResponse.json({
        message: "부서 정보가 삭제되었습니다.",
        department,
    });
}