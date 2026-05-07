"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

const loginField = [
    { key: "email", label: "이메일", type: "email", placeholder: "이메일을 입력하세요." },
    { key: "password", label: "비밀번호", type: "password", placeholder: "비밀번호를 입력하세요." }
] as const

export default function LoginPage() {
    const setUser = useAuthStore((state) => state.setUser);
    const router = useRouter();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState({
        email: "",
        password: "",
    });

    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateLoginForm = () => {
        const newErrors = {
            email: !form.email.trim() ? "이메일을 입력해주세요." : "",
            password: !form.password.trim() ? "비밀번호를 입력해주세요." : "",
        };

        setError(newErrors);

        return Object.values(newErrors).every((error) => error === "");
    };


    const handleChange = (key: keyof typeof form, value: string) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }))

        setError((prev) => ({
            ...prev,
            [key]: "",
        }))
    }

    const handleSubmit = async () => {

        setSubmitError("");
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 400) {
                    setSubmitError("이메일 또는 비밀번호를 입력해 주세요.");
                } else if (res.status === 404) {
                    setSubmitError("존재하지 않는 계정입니다.");
                } else if (res.status === 401) {
                    setSubmitError("비밀번호가 올바르지 않습니다.");
                } else {
                    setSubmitError(data.message ?? "로그인에 실패했습니다");
                }
                return false;
            }

            setUser(data.user);
            return true;

        } catch {
            setSubmitError("네트워크 오류가 발생했습니다");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNextFromLogin = async () => {
        if (!validateLoginForm()) return;

        const isSuccess = await handleSubmit();
        if (!isSuccess) return;

        router.push("/home");
    }

    useEffect(() => {
        if (!submitError) return;

        const timer = setTimeout(() => {
            setSubmitError("");
        }, 3000);

        return () => clearTimeout(timer);
    }, [submitError])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            {submitError && (
                <div className="fixed top-6 right-6 z-50 rounded-md bg-red-500 px-4 py-3 text-sm font-medium text-white shadow-lg">
                    {submitError}
                </div>
            )}
            <div className="w-full max-w-xl rounded-xl bg-white p-24 shadow-lg">
                <div className="flex flex-col gap-2 items-center justify-center -mt-10">
                    <h2 className="font-bold text-2xl">로그인</h2>
                    <p className="font-medium text-gray-500">로그인하고 빠른 소통을 시작해보세요!</p>
                </div>

                <div className="flex flex-col gap-6 mb-5 mt-15">
                    {loginField.map((field) => {
                        return (
                            <div key={field.key} className="flex flex-col gap-2">
                                <label className="text-sm font-bold">
                                    {field.label}
                                </label>
                                <input
                                    type={field.type}
                                    value={form[field.key]}
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                    placeholder={field.placeholder}
                                    className="w-full border-2 border-gray-300 rounded-lg p-2"
                                />
                                {error[field.key] && (<p className="text-sm text-red-500">{error[field.key]}</p>)}
                            </div>
                        )
                    })}
                </div>

                <div className="flex flex-col">
                    <button
                        onClick={handleNextFromLogin}
                        className="w-full bg-blue-500 rounded-lg text-white font-bold py-2
                            hover:bg-blue-400 cursor-pointer"
                    >
                        로그인
                    </button>
                    <div className="flex items-center justify-center gap-4 mt-3">
                        <button className="w-auto text-sm px-2 pb-1 text-gray-500 hover:font-bold">
                            아이디 찾기
                        </button>
                        <span className="w-[1px] h-5 bg-gray-600 -mx-2" />
                        <button className="w-auto text-sm px-2 pb-1 text-gray-500 hover:font-bold">
                            비밀번호 찾기
                        </button>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-10">
                        <p className="font-medium">계정이 아직 없으신가요?</p>
                        <button
                            onClick={() => router.push("/signup")}
                            className="font-semibold text-sm px-2 text-gray-500 hover:text-blue-500">
                            회원가입
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}