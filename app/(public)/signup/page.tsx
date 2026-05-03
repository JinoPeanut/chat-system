"use client"

import { useEffect, useState } from "react";
import AccountInfo from "./_components/AccountInfo";
import AccoutAddInfo from "./_components/AccountAddInfo";
import SignupStep from "./_components/SignupStep";
import AccountCompleted from "./_components/AccountCompleted";

export default function SignUp() {

    const [step, setStep] = useState<1 | 2 | 3>(3);
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

    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

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

            case "department":
                if (value === "") return "";
                return "";

            case "position":
                if (value === "") return "";
                return "";

            case "inviteCode":
                if (value === "") return "";
                if (/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(value)) {
                    return "초대코드에는 한글을 사용할 수 없습니다.";
                }

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

    const validateAdditionalForm = () => {
        const newErrors = {
            department: !form.department.trim()
                ? "부서를 선택하세요"
                : "",

            position: !form.position.trim()
                ? "직급을 선택하세요"
                : "",

            inviteCode: !form.inviteCode.trim()
                ? "초대코드를 입력해주세요."
                : !/^[A-Za-z0-9-]+$/.test(form.inviteCode)
                    ? "초대코드 형식이 올바르지 않습니다."
                    : "",
        };

        setError((prev) => ({
            ...prev,
            ...newErrors,
        }));

        return Object.values(newErrors).every((error) => error === "");
    }

    // 1단계 회원가입 전용 검사(버튼용)
    const handleNextFromAccount = () => {
        if (!validateAccountForm()) return;
        setStep(2);
    }

    // 2단계 이전으로 돌아가기
    const handlePrevFromAdditional = () => {
        setStep(1);
    }

    // 2단계 추가입력 전용 검사(버튼용)
    const handleNextFromAdditional = async () => {
        if (!validateAdditionalForm()) return;

        const isSuccess = await handleSubmit();
        if (!isSuccess) return;

        setStep(3);
    }


    const handleSubmit = async () => {

        setSubmitError("");
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    department: form.department,
                    position: form.position,
                    inviteCode: form.inviteCode,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 409) {
                    setSubmitError("이미 사용중인 이메일 입니다");
                } else if (res.status === 404) {
                    setSubmitError("유효하지 않은 초대코드 입니다");
                } else {
                    setSubmitError(data.message ?? "회원가입에 실패했습니다");
                }
                return false;
            }

            return true;

        } catch {
            setSubmitError("네트워크 오류가 발생했습니다");
        } finally {
            setIsSubmitting(false);
        }
    };

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
                <div className="mb-8">
                    <SignupStep step={step} />
                </div>

                {step === 1 &&
                    <AccountInfo
                        form={form}
                        error={error}
                        onChange={handleChange}
                        onNext={handleNextFromAccount}
                        onBlurConfirmPassword={validateConfirmPassword}
                    />
                }
                {step === 2 &&
                    <AccoutAddInfo
                        form={form}
                        error={error}
                        onChange={handleChange}
                        onPrev={handlePrevFromAdditional}
                        onNext={handleNextFromAdditional}
                        isSubmitting={isSubmitting}
                    />
                }
                {step === 3 && <AccountCompleted />}
            </div>
        </div>
    )
}