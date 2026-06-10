"use client"

import { usePagination } from "@/hooks/notice/usePagination";
import { AdminDepartment, OrganizationDepartment } from "@/types/department";
import { formatCreatedAt } from "@/utils/dateUtils";
import { Building2Icon, ChevronDown, ChevronRight, Edit, LucideIcon, RefreshCcw, Search, Settings, Trash2, UserCheck2Icon, UserRoundX } from "lucide-react";
import { useEffect, useState } from "react";
import OrganizationChart from "./OrganizationChart";
import CreateDeptModal from "./CreateDeptModal";
import EditDeptModal from "./EditDeptModal";
import DeleteDeptModal from "./DeleteDeptModal";

type AdminDepartmentsResponse = {
    message: string,
    departments: AdminDepartment[],
    organization: {
        companyName: string,
        departments: OrganizationDepartment[],
    },
    managerOptions: ManagerOption[],
    managerCandidates: ManagerCandidate[],
    deptTotal: number,
    assignedManagerTotal: number,
    unassignedManagerTotal: number,
    assignedTotalPercent: number,
    unassignedTotalPercent: number,
    totalPages: number,
};

type DeptCardField = {
    label: string,
    icon: LucideIcon,
    iconColor: string,
    bgColor: string,
    total: number,
    percent?: number,
    description?: string,
}

type ManagerOption = {
    managerId: string,
    manager: {
        name: string,
    }
}

export type ManagerCandidate = {
    id: string;
    name: string;
    department: string;
    position: string;
};

export default function AdminDeptPage() {

    const [department, setDepartment] = useState<AdminDepartment[]>([]);
    const [orgDepartment, setOrgDepartment] = useState<{
        companyName: string,
        departments: OrganizationDepartment[],
    }>({
        companyName: "",
        departments: [],
    });
    const [managerOptions, setManagerOptions] = useState<ManagerOption[]>([]);
    const [managerCandidates, setManagerCandidates] = useState<ManagerCandidate[]>([]);
    const [deptTotal, setDeptTotal] = useState({
        departmentTotal: 0,
        assignedManagerTotal: 0,
        unassignedManagerTotal: 0,
    });
    const [deptPercent, setDeptPercent] = useState({
        assignedTotalPercent: 0,
        unassignedTotalPercent: 0,
    })
    const [deptTabs, setDeptTabs] = useState<"dept" | "organ">("dept");
    const [errorMessage, setErrorMessage] = useState("");

    const LIMIT = 7;
    const [keyword, setKeyword] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const { page, setPage, nextPage, prevPage } = usePagination({ totalPages });

    const [selectManager, setSelectManager] = useState("");
    const [managerSelectOpen, setManagerSelectOpen] = useState(false);

    const [selectSort, setSelectSort] = useState("");
    const [sortSelectOpen, setSortSelectOpen] = useState(false);

    const [selectDept, setSelectDept] = useState<AdminDepartment | null>(null);

    const [createDeptModalOpen, setCreateDeptModalOpen] = useState(false);
    const [deptEditModalOpen, setDeptEditModalOpen] = useState(false);
    const [deptDeleteModalOpen, setDeptDeleteModalOpen] = useState(false);

    const deptCardField: DeptCardField[] = [
        { label: "전체 부서 수", icon: Building2Icon, iconColor: "text-violet-500", bgColor: "bg-violet-200", total: deptTotal.departmentTotal, description: "전체 부서" },
        { label: "부서장 지정 완료", icon: UserCheck2Icon, iconColor: "text-green-500", bgColor: "bg-green-200", total: deptTotal.assignedManagerTotal, percent: deptPercent.assignedTotalPercent },
        { label: "부서장 미 지정", icon: UserRoundX, iconColor: "text-orange-500", bgColor: "bg-orange-200", total: deptTotal.unassignedManagerTotal, percent: deptPercent.unassignedTotalPercent }
    ]

    const sortOptions = [
        { label: "부서명 순", value: "nameAsc" },
        { label: "부서장 순", value: "managerAsc" },
        { label: "생성일 최신순", value: "createdAtDesc" },
        { label: "생성일 오래된순", value: "createdAtAsc" },
    ]

    const selectManagerName = managerOptions.find(
        (manager) => manager.managerId === selectManager
    )?.manager.name;

    const selectSortName = sortOptions.find(
        (sort) => sort.value === selectSort
    )?.label;

    const fetchDeptData = async () => {

        const params = new URLSearchParams({
            page: String(page),
            limit: String(LIMIT),
        });

        if (keyword.trim()) {
            params.set("keyword", keyword.trim());
        }

        if (selectManager) {
            params.set("managerId", selectManager);
        }

        if (selectSort) {
            params.set("sort", selectSort);
        }


        try {
            const res = await fetch(`/api/admin/departments?${params.toString()}`);
            const data: AdminDepartmentsResponse = await res.json();

            if (!res.ok) {
                setErrorMessage(data.message ?? "부서 정보를 불러오지 못했습니다.");
                return;
            }

            setDepartment(data.departments);
            setOrgDepartment(data.organization);
            setManagerOptions(data.managerOptions);
            setManagerCandidates(data.managerCandidates);
            setDeptTotal({
                departmentTotal: data.deptTotal,
                assignedManagerTotal: data.assignedManagerTotal,
                unassignedManagerTotal: data.unassignedManagerTotal,
            });
            setDeptPercent({
                assignedTotalPercent: data.assignedTotalPercent,
                unassignedTotalPercent: data.unassignedTotalPercent,
            })
            setTotalPages(data.totalPages);
        } catch (error) {
            setErrorMessage("")
        }
    }

    useEffect(() => {
        fetchDeptData();
    }, [page, keyword, selectManager, selectSort])

    return (
        <div className="h-[100dvh] w-full flex flex-col gap-2 px-8 py-6">
            <h2 className="font-bold text-lg">사원 관리</h2>
            <p className="font-semibold text-sm text-gray-500">사원 정보를 조회하고 관리할 수 있습니다.</p>

            <div className="flex justify-between items-center mt-8">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setDeptTabs("dept")}
                        className={`px-3 py-2 ${deptTabs === "dept" ? "border-b-2 border-violet-500 text-violet-500" : "border-b-2 border-transparent text-black"}`}
                    >
                        부서 목록
                    </button>
                    <button
                        onClick={() => setDeptTabs("organ")}
                        className={`px-3 py-2 ${deptTabs === "organ" ? "border-b-2 border-violet-500 text-violet-500" : "border-b-2 border-transparent text-black"}`}
                    >
                        조직도 보기
                    </button>
                </div>

                <button
                    type="button"
                    onClick={() => setCreateDeptModalOpen(true)}
                    className="px-4 py-2 rounded-md border border-violet-500 text-white bg-violet-500
                        hover:bg-violet-400 hover:border-violet-400 cursor-pointer"
                >
                    + 부서추가
                </button>
            </div>

            {deptTabs === "dept"
                ? (<div className="flex flex-col">
                    <div className="grid grid-cols-3 gap-4">
                        {deptCardField.map((dept) => {
                            return (
                                <div key={dept.label} className="flex items-start gap-4 rounded-xl shadow-sm py-4 px-8 bg-white">
                                    <div className={`rounded-xl p-6 ${dept.bgColor}`}>
                                        <dept.icon size={30} className={`${dept.iconColor}`} />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <p className="text-gray-500 font-semibold">{dept.label}</p>
                                        <div className="flex items-end">
                                            <p className="text-3xl font-bold">{dept.total}</p>
                                            <p className="font-semibold">개</p>
                                        </div>
                                        {dept.percent !== undefined
                                            ? (<p className="text-gray-400 font-semibold">전체의 {dept.percent}%</p>)
                                            : (<p className="text-gray-400 font-semibold">{dept.description}</p>)
                                        }
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="flex items-center gap-3 mt-5">
                        <div className="flex border border-gray-300 rounded-lg p-2">
                            <input
                                value={keyword}
                                onChange={(e) => {
                                    setKeyword(e.target.value)
                                    setPage(1);
                                }}
                                type="text"
                                placeholder="부서명 검색"
                                className="outline-none"
                            />
                            <Search size={18} className="text-gray-500" />
                        </div>

                        {/* 부서장 선택 */}
                        <div
                            onClick={() => setManagerSelectOpen((prev) => !prev)}
                            className="relative w-44 rounded-lg px-4 py-2 border border-gray-300"
                        >
                            <div className="flex gap-2 items-center">
                                <span className="text-center">{selectManagerName ?? "부서장 선택"}</span>
                                {managerSelectOpen ? (<ChevronRight size={18} className="absolute right-5" />) : (<ChevronDown size={18} className="absolute right-5" />)}
                            </div>
                            {managerSelectOpen && (
                                <div className="absolute left-0 top-full mt-2 z-20 w-full rounded-2xl border border-gray-200 bg-white p-2 shadow-md">
                                    {managerOptions.map((manager) => {
                                        return (
                                            <button
                                                key={manager.managerId}
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectManager(manager.managerId);
                                                    setManagerSelectOpen(false);
                                                    setPage(1);
                                                }}
                                                className={`mb-1 w-full rounded-full px-3 py-1 text-sm hover:bg-violet-50 cursor-pointer`}
                                            >
                                                {manager.manager.name}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 정렬 선택 */}
                        <div
                            onClick={() => setSortSelectOpen((prev) => !prev)}
                            className="relative w-44 rounded-lg px-4 py-2 border border-gray-300"
                        >
                            <div className="flex gap-2 items-center">
                                <span className="text-center">{selectSortName ?? "정렬 선택"}</span>
                                {sortSelectOpen ? (<ChevronRight size={18} className="absolute right-5" />) : (<ChevronDown size={18} className="absolute right-5" />)}
                            </div>
                            {sortSelectOpen && (
                                <div className="absolute left-0 top-full mt-2 z-20 w-full rounded-2xl border border-gray-200 bg-white p-2 shadow-md">
                                    {sortOptions.map((sort) => {
                                        return (
                                            <button
                                                key={sort.label}
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectSort(sort.value);
                                                    setSortSelectOpen(false);
                                                    setPage(1);
                                                }}
                                                className={`mb-1 w-full rounded-full px-3 py-1 text-sm hover:bg-violet-50 cursor-pointer`}
                                            >
                                                {sort.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 선택 초기화 버튼 */}
                        <button
                            onClick={() => {
                                setKeyword("");
                                setSelectManager("");
                                setSelectSort("");
                                setPage(1);
                            }}
                            className="cursor-pointer text-gray-500 hover:text-gray-700"
                        >
                            <RefreshCcw className="refresh-icon" />
                        </button>
                    </div>

                    {/* 부서 관리 대시보드 */}
                    <div className="grid grid-cols-[200px_200px_150px_1fr_200px_150px] mt-3
                        border-t border-l border-r border-gray-300 rounded-t-lg px-4 py-2">
                        <p>부서명</p>
                        <p>부서장</p>
                        <p>인원 수</p>
                        <p>설명</p>
                        <p>생성일</p>
                        <p>작업</p>
                    </div>
                    <div className="flex flex-col border border-gray-300 rounded-b-lg px-4 bg-white">
                        {department.map((dept, index) => {
                            const isLast = index === department.length - 1;
                            return (
                                <div key={dept.id}>
                                    <div className="grid grid-cols-[200px_200px_150px_1fr_200px_150px] items-center py-3">
                                        <p>{dept.name}</p>
                                        {dept.manager?.name ? (<p>{dept.manager?.name} {dept.manager.position}</p>) : (<p className="text-violet-500">미지정</p>)}
                                        <p>{dept.memberCount}명</p>
                                        <p>{dept.description}</p>
                                        <p>{formatCreatedAt(dept.createdAt)}</p>
                                        <div className="flex gap-5 cursor-pointer text-gray-500">
                                            <Edit
                                                className="hover:text-gray-700"
                                                onClick={() => {
                                                    setSelectDept(dept);
                                                    setDeptEditModalOpen(true);
                                                }}
                                            />
                                            <Trash2
                                                className="hover:text-gray-700"
                                                onClick={() => {
                                                    setSelectDept(dept);
                                                    setDeptDeleteModalOpen(true);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {!isLast && <div className="w-full h-[1px] bg-gray-200" />}
                                </div>
                            )
                        })}
                    </div>

                    <div className="flex justify-center items-center gap-4 mt-4">
                        <button
                            onClick={prevPage}
                            disabled={page === 1}
                            className="px-3 py-1 border rounded disabled:opacity-40"
                        >
                            이전
                        </button>
                        <span className="text-sm font-medium">
                            {page} / {totalPages}
                        </span>
                        <button
                            onClick={nextPage}
                            disabled={page === totalPages}
                            className="px-3 py-1 border rounded disabled:opacity-40"
                        >
                            다음
                        </button>
                    </div>
                </div>)
                : (<OrganizationChart organization={orgDepartment} />)
            }

            {createDeptModalOpen &&
                (
                    <CreateDeptModal
                        fetchDeptData={fetchDeptData}
                        onClose={() => setCreateDeptModalOpen(false)}
                        managerCandidates={managerCandidates} />
                )
            }

            {deptEditModalOpen && selectDept && (
                <EditDeptModal
                    department={selectDept}
                    fetchDeptData={fetchDeptData}
                    onClose={() => setDeptEditModalOpen(false)}
                    managerCandidates={managerCandidates}
                />
            )}

            {deptDeleteModalOpen && selectDept && (
                <DeleteDeptModal
                    department={selectDept}
                    fetchDeptData={fetchDeptData}
                    onClose={() => setDeptDeleteModalOpen(false)}
                />
            )}
        </div>
    )
}