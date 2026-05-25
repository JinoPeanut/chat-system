"use client"

import { usePagination } from "@/hooks/notice/usePagination";
import { User, UserStatus } from "@/types/chat";
import { Department } from "@/types/department";
import { getStatusCardColor, getStatusColor, getStatusText } from "@/utils/statusUtils";
import { ChevronDown, ChevronRight, Edit, RefreshCcw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import AdminUserEditModal from "./AdminUserEditModal";

export const formatUserCreatedAt = (createdAt: string) => {
    const date = new Date(createdAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}.${month}.${day}`;
}

const statusOptions = [
    { label: "전체 상태", value: "" },
    { label: "온라인", value: "online" },
    { label: "오프라인", value: "offline" },
    { label: "자리비움", value: "AFK" },
];

export default function AdminUserPage() {
    const LIMIT = 7;

    const [keyword, setKeyword] = useState("");
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectDepartment, setSelectDepartment] = useState("");
    const [departmentSelectOpen, setDepartmentSelectOpen] = useState(false);

    const [selectPosition, setSelectPosition] = useState("");
    const [positionSelectOpen, setPositionSelectOpen] = useState(false);

    const [selectStatus, setSelectStatus] = useState("");
    const [statusSelectOpen, setStatusSelectOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [selectUser, setSelectUser] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const { page, setPage, nextPage, prevPage } = usePagination({ totalPages });

    const positionOptions = Array.from(
        new Set(
            departments.flatMap((department) =>
                department.members.map((member) => member.position)
            )
        )
    );

    const handleOpenEditModal = (user: User) => {
        setSelectUser(user);
        setIsEditModalOpen(true);
    };


    const fetchUserData = async () => {
        if (isLoading) return;
        setErrorMessage("");

        const params = new URLSearchParams({
            page: String(page),
            limit: String(LIMIT),
        });

        if (selectDepartment) {
            params.set("department", selectDepartment);
        }

        if (selectPosition) {
            params.set("position", selectPosition);
        }

        if (selectStatus) {
            params.set("status", selectStatus);
        }

        if (keyword.trim()) {
            params.set("keyword", keyword.trim());
        }

        try {
            setIsLoading(true);

            const res = await fetch(`/api/admin/users?${params.toString()}`);
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 400) {
                    setErrorMessage("");
                }

                return;
            }

            setUsers(data.users);
            setTotalPages(data.totalPages);
        } catch (error) {

        } finally {
            setIsLoading(false);
        }
    }

    const fetchDepartmentData = async () => {
        const res = await fetch("/api/departments");
        const data = await res.json();
        if (!res.ok) {
            if (res.status === 400) {
                setErrorMessage("");
            }
            return;
        }

        setDepartments(data);
    }

    useEffect(() => {
        fetchUserData();
    }, [page, keyword, selectDepartment, selectPosition, selectStatus])

    useEffect(() => {
        fetchDepartmentData();
    }, [])

    return (
        <div className="h-[100dvh] w-full flex flex-col gap-2 px-8 py-6">
            <h2 className="font-bold text-lg">사원 관리</h2>
            <p className="font-semibold text-sm text-gray-500">사원 정보를 조회하고 관리할 수 있습니다.</p>

            {/* 검색, select 선택 */}
            <div className="flex items-center gap-3 mt-5">
                <div className="flex border border-gray-300 rounded-lg p-2">
                    <input
                        value={keyword}
                        onChange={(e) => {
                            setKeyword(e.target.value)
                            setPage(1);
                        }}
                        type="text"
                        placeholder="이름, 이메일 검색"
                        className="outline-none"
                    />
                    <Search size={18} className="text-gray-500" />
                </div>

                {/* 부서 선택 */}
                <div
                    onClick={() => setDepartmentSelectOpen((prev) => !prev)}
                    className="relative rounded-lg px-4 py-2 border border-gray-300"
                >
                    <div className="flex gap-2 items-center">
                        <span>{selectDepartment ? selectDepartment : "전체 부서"}</span>
                        {departmentSelectOpen ? (<ChevronRight size={18} />) : (<ChevronDown size={18} />)}
                    </div>
                    {departmentSelectOpen && (
                        <div className="absolute left-0 top-full mt-2 z-20 w-full rounded-2xl border border-gray-200 bg-white p-2 shadow-md">
                            {departments.map((department) => {
                                return (
                                    <button
                                        key={department.id}
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectDepartment(department.name);
                                            setDepartmentSelectOpen(false);
                                            setPage(1);
                                        }}
                                        className={`mb-1 w-full rounded-full px-3 py-1 text-sm hover:bg-violet-50 cursor-pointer`}
                                    >
                                        {department.name}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* 직급 선택 */}
                <div
                    onClick={() => setPositionSelectOpen((prev) => !prev)}
                    className="relative rounded-lg px-4 py-2 border border-gray-300"
                >
                    <div className="flex gap-2 items-center">
                        <span>{selectPosition ? selectPosition : "전체 직급"}</span>
                        {positionSelectOpen ? (<ChevronRight size={18} />) : (<ChevronDown size={18} />)}
                    </div>
                    {positionSelectOpen && (
                        <div className="absolute left-0 top-full mt-2 z-20 w-full rounded-2xl border border-gray-200 bg-white p-2 shadow-md">
                            {positionOptions.map((position) => {
                                return (
                                    <button
                                        key={position}
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectPosition(position);
                                            setPositionSelectOpen(false);
                                            setPage(1);
                                        }}
                                        className={`mb-1 w-full rounded-full px-3 py-1 text-sm hover:bg-violet-50 cursor-pointer`}
                                    >
                                        {position}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* 온라인 상태 */}
                <div
                    onClick={() => setStatusSelectOpen((prev) => !prev)}
                    className="relative rounded-lg px-4 py-2 border border-gray-300"
                >
                    <div className="flex gap-2 items-center">
                        <span>{selectStatus ? getStatusText(selectStatus as UserStatus) : "전체 상태"}</span>
                        {statusSelectOpen ? (<ChevronRight size={18} />) : (<ChevronDown size={18} />)}
                    </div>
                    {statusSelectOpen && (
                        <div className="absolute left-0 top-full mt-2 z-20 w-full rounded-2xl border border-gray-200 bg-white p-2 shadow-md">
                            {statusOptions.map((status) => {
                                return (
                                    <button
                                        key={status.label}
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectStatus(status.value);
                                            setStatusSelectOpen(false);
                                            setPage(1);
                                        }}
                                        className={`mb-1 w-full rounded-full px-3 py-1 text-sm hover:bg-violet-50 cursor-pointer`}
                                    >
                                        {status.label}
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
                        setSelectDepartment("");
                        setSelectPosition("");
                        setSelectPosition("");
                    }}
                    className="cursor-pointer text-gray-500 hover:text-gray-700"
                >
                    <RefreshCcw className="refresh-icon" />
                </button>
            </div>

            <div>
                <div className="grid grid-cols-[140px_1fr_140px_140px_140px_140px_140px] bg-gray-100 border-t border-l border-r border-gray-300 rounded-t-xl p-2">
                    <p className="text-center">이름</p>
                    <p>이메일</p>
                    <p className="text-center">부서</p>
                    <p className="text-center">직급</p>
                    <p className="text-center">상태</p>
                    <p className="text-center">가입일</p>
                    <p className="text-center">작업</p>
                </div>
                <div className="flex flex-col rounded-b-xl border border-gray-300 bg-white/80 p-2">

                    {users.map((user, index) => {
                        const isLast = index === users.length - 1;
                        return (
                            <div key={user.id}>
                                <div className="grid grid-cols-[140px_1fr_140px_140px_140px_140px_140px] justify-center items-center py-3">
                                    <p className="text-center">{user.name}</p>
                                    <p>{user.email}</p>
                                    <p className="text-center">{user.department}</p>
                                    <p className="text-center">{user.position}</p>
                                    <div className={`grid grid-cols-[15px_1fr] items-center gap-1 rounded-full px-7 py-1 ${getStatusCardColor(user.status)}`}>
                                        <div className={`w-2 h-2 rounded-full ${getStatusColor(user.status)}`} />
                                        <p className="text-center">{getStatusText(user.status)}</p>
                                    </div>
                                    <p className="text-center">{formatUserCreatedAt(user.createdAt)}</p>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleOpenEditModal(user)}
                                        >
                                            <Edit className="cursor-pointer text-gray-500 hover:text-gray-700" />
                                        </button>
                                    </div>
                                </div>

                                {isLast ? <></> : (<div className="h-[1px] w-full bg-gray-200" />)}
                            </div>
                        )
                    })}

                </div>
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

            {/* 사원 정보 수정 모달 */}
            {isEditModalOpen && selectUser && (
                <AdminUserEditModal
                    user={selectUser}
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}
        </div>
    )
}