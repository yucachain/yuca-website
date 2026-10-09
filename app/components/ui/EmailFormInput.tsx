"use client";

import React, { useState, useRef, useEffect } from "react";
import { useField } from "formik";
import { AlertCircle, Mail } from "lucide-react";

export interface EmailFormInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "value" | "onChange" | "onBlur"> {
  name: string;
  label?: string;
  helperText?: string;
}

export default function EmailFormInput({
  name,
  label,
  helperText,
  placeholder = "admin@yucachain.com",
  disabled,
  className = "",
  id,
}: EmailFormInputProps) {
  const [field, meta, helpers] = useField<string>(name);
  const [customError, setCustomError] = useState<string | null>(null);
  const errorTimerRef = useRef<NodeJS.Timeout | null>(null);

  const inputId = id ?? name;
  const formikError = Boolean(meta.touched && meta.error);
  const activeError = customError || (formikError ? meta.error : null);

  const triggerError = (msg: string) => {
    setCustomError(msg);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => {
      setCustomError(null);
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, []);

  const validateEmailFormat = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      setCustomError(null);
      return;
    }

    // Check if user entered pure digits or phone number
    if (/^\+?[0-9\s\-()]{4,}$/.test(trimmed)) {
      triggerError("Phone numbers or numbers alone are not allowed. Please enter an email address.");
      return;
    }

    // Check if plain text without '@'
    if (!trimmed.includes("@")) {
      triggerError("Email must include '@' and a domain (e.g. admin@yucachain.com). Text alone is not allowed.");
      return;
    }

    // Check full email pattern
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      triggerError("Please enter a valid email address (e.g. admin@yucachain.com).");
      return;
    }

    setCustomError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If the input is empty and the user starts with '+' (international phone prefix)
    const input = e.currentTarget;
    if (input.value.length === 0 && e.key === "+") {
      e.preventDefault();
      triggerError("Phone numbers are not allowed. Please enter an email address.");
      return;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    helpers.setValue(val);

    // Real-time check if pure numbers/phone format is being entered
    if (/^\+?[0-9]{5,}$/.test(val.trim())) {
      triggerError("Phone numbers are not allowed. Please enter an email address.");
    } else if (customError && val.includes("@")) {
      setCustomError(null);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    field.onBlur(e);
    validateEmailFormat(e.target.value);
  };

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1 block text-xs sm:text-sm font-medium text-gray-800"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <Mail size={16} />
        </div>
        <input
          id={inputId}
          name={name}
          type="email"
          inputMode="email"
          autoComplete="email"
          value={field.value ?? ""}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={[
            "w-full rounded-xl border bg-[#f8f9f8] pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-gray-900 transition-colors duration-150 outline-none",
            "placeholder:text-gray-400",
            activeError
              ? "border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-2 focus:ring-red-400/20"
              : "border-emerald-950/25 focus:border-[#226049] focus:ring-2 focus:ring-[#226049]/20 focus:bg-white",
            disabled ? "cursor-not-allowed bg-gray-100 text-gray-400" : "",
            className,
          ].join(" ")}
        />
      </div>

      {activeError ? (
        <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1.5 animate-in fade-in">
          <AlertCircle size={13} className="shrink-0" />
          <span>{activeError}</span>
        </p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
}
