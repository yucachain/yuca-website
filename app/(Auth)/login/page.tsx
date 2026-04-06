"use client";

import { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import InputText from '@/components/InputText';

const validationSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email address')
        .required('Email Address is required'),
    password: Yup.string()
        .required('Password is required'),
    rememberMe: Yup.boolean()
});

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative h-screen w-full flex items-center justify-center bg-gray-900 overflow-hidden font-sans">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full"
                style={{ backgroundImage: "url('/images/auth_bg_image.png')" }}
            />
            {/* Dark Overlay over the background */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Glassmorphism Card */}
            <div className="relative z-10 w-full max-w-[480px] p-6 md:px-10 md:py-10 mx-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] shadow-2xl">
                <h2 className="text-xl md:text-2xl font-bold text-white text-center mb-6 tracking-wider">
                    LOG IN
                </h2>

                <Formik
                    initialValues={{
                        email: '',
                        password: '',
                        rememberMe: false,
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values, { setSubmitting }) => {
                        console.log(values);
                        setTimeout(() => {
                            setSubmitting(false);
                        }, 1000);
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form className="flex flex-col gap-4">

                            <InputText
                                name="email"
                                type="email"
                                theme="dark"
                                label="Email Address"
                                placeholder="abdulbasitissa@gmail.com"
                            />

                            <InputText
                                name="password"
                                theme="dark"
                                type={showPassword ? "text" : "password"}
                                label="Password"
                                placeholder="********"
                                rightIcon={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-white/60 hover:text-white transition-colors cursor-pointer"
                                        aria-label="Toggle password visibility"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                }
                            />

                            {/* Remember Me Checkbox */}
                            <div className="flex items-center gap-2 mt-1">
                                <Field
                                    type="checkbox"
                                    name="rememberMe"
                                    id="rememberMe"
                                    className="w-4 h-4 rounded border-gray-300 bg-white/10 accent-[#215243] cursor-pointer"
                                />
                                <label htmlFor="rememberMe" className="text-sm font-medium text-white cursor-pointer select-none">
                                    Remember me
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full max-w-[200px] mx-auto mt-4 bg-[#215243] text-white py-3 rounded-xl font-semibold text-lg hover:bg-[#1a4336] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                            >
                                {isSubmitting ? 'Logging in...' : 'Log In'}
                            </button>

                            <div className="text-center mt-3 text-sm text-white/90">
                                Forgot Password? <Link href="/forgetPassword" className="text-white font-bold hover:underline">Click here..</Link>
                            </div>

                            <div className="text-center mt-4">
                                <Link href="#" className="flex flex-col text-sm text-white font-bold hover:underline">
                                    Request Access
                                    <span className="text-[11px] font-normal text-white/80 tracking-wide mt-1">(For industrial buyers and processors)</span>
                                </Link>
                            </div>

                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}
