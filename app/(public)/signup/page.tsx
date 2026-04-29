export default function SignUp() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
                {/* 단계별 표시 */}
                <div>
                    <div className="rounded-full w-[2rem] h-[2rem] bg-violet-400">

                    </div>
                </div>

                {/* 상단 설명 */}
                <div className="flex flex-col gap-1 items-center justify-center mt-10">
                    <h2 className="text-xl font-bold">
                        계정 정보를 입력해주세요
                    </h2>
                    <p className="text-sm text-gray-400 font-bold">
                        기본 정보를 입력하고 계정을 만들어보세요.
                    </p>
                </div>

                {/* 정보입력칸 */}
                <div>

                </div>
            </div>
        </div>
    )
}