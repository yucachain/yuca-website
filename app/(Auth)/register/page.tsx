"use client";

import { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import InputText from '@/components/InputText';

const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string()
        .email('Invalid email address')
        .required('Email Address is required'),
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Please re-type your password'),
});

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
            <div className="relative z-10 w-full max-w-[480px] p-5 md:px-8 md:py-6 mx-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] shadow-2xl">
                <h2 className="text-xl md:text-2xl font-bold text-white text-center mb-3 tracking-wider">
                    SIGN UP
                </h2>

                <Formik
                    initialValues={{
                        firstName: '',
                        lastName: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
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
                        <Form className="flex flex-col gap-2">

                            <InputText
                                name="firstName"
                                theme="dark"
                                label="First Name"
                            />

                            <InputText
                                name="lastName"
                                theme="dark"
                                label="Last Name"
                            />

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

                            <InputText
                                name="confirmPassword"
                                theme="dark"
                                type={showConfirmPassword ? "text" : "password"}
                                label="Re-type Password"
                                placeholder="********"
                                rightIcon={
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="text-white/60 hover:text-white transition-colors cursor-pointer"
                                        aria-label="Toggle confirm password visibility"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                }
                            />

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full max-w-[200px] mx-auto mt-1 bg-[#215243] text-white py-2 rounded-xl font-semibold text-base hover:bg-[#1a4336] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                            >
                                {isSubmitting ? 'Signing up...' : 'Sign Up'}
                            </button>

                            <div className="text-center mt-2 text-sm text-white/90">
                                Already have an account? <Link href="/login" className="text-white font-bold hover:underline">Log In</Link>
                            </div>

                            <div className="text-center mt-2">
                                <Link href="#" className="flex flex-col text-sm text-white font-bold hover:underline">
                                    Request Access
                                    <span className="text-[11px] font-normal text-white/80 tracking-wide mt-0.5">(For industrial buyers and processors)</span>
                                </Link>
                            </div>

                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}