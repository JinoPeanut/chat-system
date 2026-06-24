import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
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
            company: {
                select: {
                    name: true,
                }
            }
        }
    })

    if (!admin || admin.role !== "ADMIN") {
        return NextResponse.json(
            { message: "관리자 권한이 필요합니다." },
            { status: 403 }
        );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 7)));
    const managerId = searchParams.get("managerId")?.trim();
    const sort = searchParams.get("sort");
    const keyword = searchParams.get("keyword")?.trim();

    const where: Prisma.DepartmentWhereInput = {
        companyId: admin.companyId,
    }

    if (managerId) {
        where.managerId = managerId;
    }

    if (keyword) {
        where.OR = [
            { name: { contains: keyword, mode: "insensitive" } },
        ]
    }

    const deptTotal = await prisma.department.count({
        where: { companyId: admin.companyId }
    })

    const filteredDeptTotal = await prisma.department.count({
        where,
    })

    const assignedManagerTotal = await prisma.department.count({
        where: {
            companyId: admin.companyId,
            managerId: {
                not: null,
            }
        }
    })

    const unassignedManagerTotal = await prisma.department.count({
        where: {
            companyId: admin.companyId,
            managerId: null,
        },
    });

    const assignedTotalPercent = deptTotal > 0
        ? Math.round((assignedManagerTotal / deptTotal) * 100)
        : 0;

    const unassignedTotalPercent = deptTotal > 0
        ? Math.round((unassignedManagerTotal / deptTotal) * 100)
        : 0;

    let orderBy: Prisma.DepartmentOrderByWithRelationInput = {
        name: "asc",
    }

    if (sort === "createdAtDesc") {
        orderBy = { createdAt: "desc" }
    }

    if (sort === "createdAtAsc") {
        orderBy = { createdAt: "asc" }
    }

    if (sort === "managerAsc") {
        orderBy = {
            manager: {
                name: "asc"
            }
        }
    }

    const departments = await prisma.department.findMany({
        where,
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
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
    });

    const memberCount = await prisma.user.groupBy({
        by: ["department"],
        where: { companyId: admin.companyId },
        _count: { id: true }
    });

    const departmentWithMemberCount = departments.map((department) => {
        const countItem = memberCount.find(
            (item) => item.department === department.name
        );

        return {
            ...department,
            memberCount: countItem?._count.id ?? 0,
        }
    })


    const managerOptions = await prisma.department.findMany({
        where: {
            companyId: admin.companyId,
            managerId: {
                not: null,
            }
        },
        select: {
            managerId: true,
            manager: {
                select: {
                    name: true,
                }
            }
        },
    })

    const managerCandidates = await prisma.user.findMany({
        where: {
            companyId: admin.companyId,
        },
        select: {
            id: true,
            name: true,
            department: true,
            position: true,
        },
        orderBy: {
            name: "asc",
        }
    })

    const orgDepartments = await prisma.department.findMany({
        where: { companyId: admin.companyId },
        select: {
            id: true,
            name: true,
            managerId: true,
            manager: {
                select: {
                    name: true,
                    position: true,
                }
            }
        },
        orderBy: {
            name: "asc",
        },
    });

    const organizationData = orgDepartments.map((department) => {
        const count = memberCount.find(
            (item) => item.department === department.name
        )?._count.id ?? 0;

        return {
            ...department,
            memberCount: count,
        };
    });

    return NextResponse.json({
        departments: departmentWithMemberCount,
        organization: {
            companyName: admin.company.name,
            departments: organizationData,
        },
        managerOptions,
        managerCandidates,
        deptTotal,
        assignedManagerTotal,
        unassignedManagerTotal,
        assignedTotalPercent,
        unassignedTotalPercent,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(filteredDeptTotal / limit)),
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
        },
        select: {
            id: true,
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

    await prisma.adminActivityLog.create({
        data: {
            adminId: userId,
            companyId: admin.companyId,
            type: "default",
            message: `관리자가 부서 ${department.name}을 추가했습니다.`,
            targetId: department.id,
            targetType: "department",
        }
    })

    return NextResponse.json(
        {
            message: "부서가 추가 되었습니다",
            department,
        },
        { status: 201 }
    )
}