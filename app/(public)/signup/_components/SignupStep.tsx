"use client";

import { useEffect, useState } from "react";

type SignupStepProps = {
    step: 1 | 2 | 3;
}

const stepsOption = [
    { title: "계정 정보" },
    { title: "추가 정보" },
    { title: "가입 완료" }
]

export default function SignupStep({ step }: SignupStepProps) {

    const [activeBar, setActiveBar] = useState<number | null>(null);

    useEffect(() => {
        if (step === 2) setActiveBar(0);
        if (step === 3) setActiveBar(1);

        const timer = setTimeout(() => {
            setActiveBar(null);
        }, 600);

        return () => clearTimeout(timer);
    }, [step])

    return (
        <div className="flex justify-center items-center">
            {stepsOption.map((items, index) => {
                return (
                    <div key={`${items.title}-${index}`} className="flex items-start">
                        <div className="flex w-24 shrink-0 flex-col items-center">
                            <div className={`relative z-10 flex items-center justify-center rounded-full w-[2.5rem] h-[2.5rem] transition-all duration-500
                                ${step === (index + 1) ? "bg-violet-500 scale-100 text-white font-bold" : "bg-gray-300 scale-90 font-medium"}`}
                            >
                                {index + 1}
                            </div>
                            <p className={`mt-2 font-semibold text-sm ${step === (index + 1) ? "" : "text-gray-300"}`}>
                                {items.title}
                            </p>
                        </div>

                        {index !== 2 &&
                            (<div className="relative z-0 h-1 w-30 -mx-10 mt-4 bg-gray-200 rounded-full overflow-hidden">
                                {activeBar === index &&
                                    (<div
                                        key={`${step}-${index}`}
                                        className="absolute inset-y-0 w-full bg-violet-500 animate-step-pass"
                                    />)}
                            </div>)
                        }
                    </div>
                )
            })}
        </div>
    )
}