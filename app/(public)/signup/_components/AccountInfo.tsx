type AccountInfoProps = {
    form: {
        name: string,
        email: string,
        password: string,
        confirmPassword: string,
    };

    error: {
        name: string,
        email: string,
        password: string,
        confirmPassword: string,
    };

    onChange: (key: "name" | "email" | "password" | "confirmPassword", value: string) => void;
    onNext: () => void,
    onBlurConfirmPassword: () => void,
}

const accountFields = [
    { key: "name", label: "이름", type: "text", placeholder: "이름을 입력하세요" },
    { key: "email", label: "이메일", type: "email", placeholder: "이메일을 입력하세요" },
    { key: "password", label: "비밀번호", type: "password", placeholder: "비밀번호를 입력하세요" },
    { key: "confirmPassword", label: "비밀번호 확인", type: "password", placeholder: "비밀번호를 다시 입력하세요" },
] as const;


export default function AccountInfo({ form, error, onChange, onNext, onBlurConfirmPassword }: AccountInfoProps) {

    return (
        <>
            {/* 상단 설명 */}
            <div className="flex flex-col gap-1 items-center justify-center mt-10 mb-5">
                <h2 className="text-xl font-bold">
                    계정 정보를 입력해주세요
                </h2>
                <p className="text-sm text-gray-400 font-bold">
                    기본 정보를 입력하고 계정을 만들어보세요.
                </p>
            </div>

            {/* 정보입력칸 */}
            <div className="flex flex-col gap-5 mb-5">
                {accountFields.map((field) => {
                    return (
                        <div key={field.key}>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold">{field.label}</label>
                                <input
                                    type={field.type}
                                    value={form[field.key]}
                                    onChange={(e) => onChange(field.key, e.target.value)}
                                    onBlur={field.key === "confirmPassword" ? onBlurConfirmPassword : undefined}
                                    placeholder={field.placeholder}
                                    className="w-full border-2 border-gray-300 rounded-lg p-2"
                                />
                                {error[field.key] && (<p className="text-sm text-red-500">{error[field.key]}</p>)}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* 버튼 영역 */}
            <div className="flex flex-col gap-2">
                <button
                    onClick={onNext}
                    className="w-full bg-blue-500 rounded-lg text-white font-bold py-2
                            hover:bg-blue-400 cursor-pointer"
                >
                    다음
                </button>

                {/* 로그인화면 개발시 - 기능추가 */}
                <button
                    className="w-full bg-gray-200 rounded-lg font-bold py-2
                            hover:bg-gray-300 cursor-pointer"
                >
                    취소
                </button>
            </div>
        </>
    )
}