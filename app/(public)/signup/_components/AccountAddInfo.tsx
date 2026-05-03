import { ChevronDown } from "lucide-react";

type AccountAddInfoProps = {
    form: {
        department: string,
        position: string,
        inviteCode: string,
    },

    error: {
        department: string,
        position: string,
        inviteCode: string,
    },

    onChange: (key: "department" | "position" | "inviteCode", value: string) => void;
    onPrev: () => void;
    onNext: () => void;
    isSubmitting: boolean;
}

const accountAddField = [
    { key: "department", label: "부서", type: "select", options: ["개발팀", "디자인팀", "인사팀", "경영팀"] },
    { key: "position", label: "직급", type: "select", options: ["인턴", "사원", "주임", "대리", "과장"] },
    { key: "inviteCode", label: "초대코드", type: "input", placeholder: "초대코드를 입력해주세요" }
] as const;

export default function AccoutAddInfo({ form, error, onChange, onPrev, onNext, isSubmitting }: AccountAddInfoProps) {
    return (
        <>
            {/* 상단 설명 */}
            <div className="flex flex-col gap-1 items-center justify-center mt-10 mb-5">
                <h2 className="text-xl font-bold">
                    추가 정보를 입력하세요.
                </h2>
                <p className="text-sm text-gray-400 font-bold">
                    소속 회사의 부서와 직급을 선택해 주세요.
                </p>
            </div>

            <div className="flex flex-col gap-5 mb-5">
                {accountAddField.map((field) => {
                    return (
                        <div key={field.key} className="flex flex-col gap-2">
                            <label className="font-bold">{field.label}</label>

                            {field.type === "select" ?
                                (<div className="relative">
                                    <select
                                        value={form[field.key]}
                                        onChange={(e) => onChange(field.key, e.target.value)}
                                        className="w-full appearance-none border-2 border-gray-300 rounded-md px-3 py-2 pr-10"
                                    >
                                        <option value="">{field.label}을 선택해주세요</option>
                                        {field.options.map((option) => {
                                            return (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            )
                                        })}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute inset-y-0 right-3 top-2 flex items-center text-gray-500" />
                                </div>)
                                : (
                                    <input
                                        type="text"
                                        value={form[field.key]}
                                        onChange={(e) => onChange(field.key, e.target.value)}
                                        placeholder={field.placeholder}
                                        className="border-2 border-gray-300 rounded-md p-2"
                                    />
                                )}

                            {error[field.key] && <p>{error[field.key]}</p>}

                        </div>
                    )
                })}

                {/* 버튼 영역 */}
                <div className="flex flex-col gap-2">
                    <button
                        onClick={onNext}
                        className="w-full bg-blue-500 rounded-lg text-white font-bold py-2
                            hover:bg-blue-400 cursor-pointer"
                    >
                        가입완료
                    </button>
                    <button
                        onClick={onPrev}
                        className="w-full bg-gray-200 rounded-lg font-bold py-2
                            hover:bg-gray-300 cursor-pointer"
                    >
                        취소
                    </button>
                </div>
            </div>
        </>
    )
}