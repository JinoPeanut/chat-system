"use client"

import { useState } from "react";
import AccountInfo from "./_components/AccountInfo";
import AccoutAddInfo from "./_components/AccountAddInfo";
import SignupStep from "./_components/SignupStep";

export default function SignUp() {

    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        department: "",
        position: "",
        inviteCode: "",
    });

    const [error, setError] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        department: "",
        position: "",
        inviteCode: "",
    });

    const validateField = (key: keyof typeof form, value: string, nextForm: typeof form) => {
        switch (key) {
            case "name":
                if (value === "") return "";

                if (!/^[ㄱ-ㅎㅏ-ㅣ가-힣\s]+$/.test(value)) {
                    return "이름은 한글만 입력할 수 있습니다";
                }
                return "";

            case "email":
                if (value === "") return "";

                if (/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(value)) {
                    return "이메일에는 한글을 사용할 수 없습니다";
                }
                return "";

            case "password":
                if (value === "") return "";
                return "";

            case "confirmPassword":
                if (value === "") return "";
                return "";

            default:
                return "";
        }
    }

    const handleChange = (key: keyof typeof form, value: string) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }))

        const errorMessage = validateField(key, value, {
            ...form,
            [key]: value,
        })

        setError((prev) => ({
            ...prev,
            [key]: errorMessage,
        }))
    }

    // 비밀번호 확인 검사
    const validateConfirmPassword = () => {
        if (!form.confirmPassword.trim()) return;

        setError((prev) => ({
            ...prev,
            confirmPassword:
                form.confirmPassword !== form.password
                    ? "비밀번호가 일치하지 않습니다."
                    : "",
        }));
    };

    // 회원가입 검사 함수
    const validateAccountForm = () => {
        const newErrors = {
            name: !form.name.trim()
                ? "이름을 입력해주세요."
                : !/^[ㄱ-ㅎㅏ-ㅣ가-힣\s]+$/.test(form.name)
                    ? "이름은 한글만 입력할 수 있습니다."
                    : "",

            email: !form.email.trim()
                ? "이메일을 입력해주세요."
                : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
                    ? "올바른 이메일 형식을 입력해주세요."
                    : "",

            password: !form.password.trim()
                ? "비밀번호를 입력해주세요."
                : !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(form.password)
                    ? "비밀번호는 8자 이상, 대소문자/숫자/특수문자를 포함해야 합니다."
                    : "",

            confirmPassword:
                form.confirmPassword !== form.password
                    ? "비밀번호가 일치하지 않습니다."
                    : "",
        };

        setError((prev) => ({
            ...prev,
            ...newErrors,
        }));

        return Object.values(newErrors).every((error) => error === "");
    };

    // 1단계 회원가입 전용 검사(버튼용)
    const handleNextFromAccount = () => {
        if (!validateAccountForm()) return;
        setStep(2);
    }


    const handleSubmit = async () => {
        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: form.email,
                password: form.password,
                name: form.name,
                department: form.department,
                position: form.position,
                inviteCode: form.inviteCode,
            }),
        });

        if (!res.ok) {
            // 실패 처리
            return;
        }

        // 성공 처리
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-xl rounded-xl bg-white p-24 shadow-lg">
                <div className="mb-8">
                    <SignupStep step={step} />
                </div>

                {step === 1 &&
                    <AccountInfo form={form} error={error} onChange={handleChange} onNext={handleNextFromAccount} onBlurConfirmPassword={validateConfirmPassword} />}
                {step === 2 && <AccoutAddInfo />}
                {step === 3 && <></>}
            </div>
        </div>
    )
}