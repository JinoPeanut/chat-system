import { AdminDepartment, OrganizationDepartment } from "@/types/department";

type OrganizationChartProps = {
    organization: {
        companyName: string,
        departments: OrganizationDepartment[],
    }
}

export default function OrganizationChart({ organization }: OrganizationChartProps) {
    const { companyName, departments } = organization;

    return (
        <div className="overflow-x-auto rounded-xl bg-white p-10">
            <div className="relative min-w-max">

                {/* 회사 카드 */}
                <div className="flex justify-center">
                    <div className="rounded-xl border border-violet-300 bg-white px-10 py-4 text-center">
                        <p className="font-bold">{companyName}</p>
                        <p className="text-sm text-gray-500">
                            전체인원 {departments.reduce((sum, dept) => sum + dept.memberCount, 0)}명
                        </p>
                    </div>
                </div>

                {/* 회사에서 가로선까지 내려오는 세로선 */}
                <div className="mx-auto h-10 w-px bg-gray-300" />

                {/* 모든 부서를 연결하는 가로선 */}
                <div className="relative mx-auto w-fit">
                    {departments.length > 1 && (
                        <div className="absolute left-[5.5rem] right-[5.5rem] top-0 h-px bg-gray-300" />
                    )}

                    {/* 부서 카드 목록 */}
                    <div className="flex justify-center gap-10">
                        {departments.map((dept) => (
                            <div key={dept.id} className="relative w-44 shrink-0 pt-10">
                                {/* 가로선에서 각 부서로 내려오는 세로선 */}
                                <div className="absolute left-1/2 top-0 h-10 w-px -translate-x-1/2 bg-gray-300" />

                                <div className="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 text-center shadow-sm">
                                    <p className="font-bold">{dept.name}</p>
                                    <p className="mt-2 text-sm text-gray-500">
                                        {dept.manager?.name ?? "부서장 미지정"}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {dept.memberCount}명
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}