
import { useRouter } from "next/navigation";

export default function AccountCompleted() {
    const router = useRouter();
    return (
        <>
            <div className="flex flex-col items-center justify-center">
                <h2 className="text-xl font-bold mb-10">가입이 완료되었습니다!</h2>

                <div className="relative flex items-center justify-center w-20 h-20">
                    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
                        <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            stroke="#8b5cf6"
                            strokeWidth="2"
                            strokeLinecap="round"
                            className="signup-loader-progress"
                        />
                    </svg>

                    <svg viewBox="0 0 52 52" className="h-10 w-10">
                        <polyline
                            points="14,27 22,35 38,19"
                            pathLength="100"
                            fill="none"
                            stroke="#8b5cf6"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="signup-check-draw"
                        />
                    </svg>
                </div>

                <div className="mt-20">
                    <button
                        onClick={() => router.push("/login")}
                        className="w-full bg-blue-500 rounded-lg text-white font-bold py-2 px-4
                            hover:bg-blue-400 cursor-pointer"
                    >
                        로그인 이동
                    </button>
                </div>
            </div>

        </>
    )
}