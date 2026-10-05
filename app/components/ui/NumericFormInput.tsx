"use client";

import React, { useState, useRef, useEffect } from "react";
import { useField } from "formik";
import { AlertCircle } from "lucide-react";

export interface NumericFormInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "value" | "onChange" | "onBlur"> {
  name: string;
  label?: string;
  helperText?: string;
  allowLeadingPlus?: boolean;
}

export default function NumericFormInput({
  name,
  label,
  helperText,
  allowLeadingPlus = true,
  placeholder,
  maxLength,
  disabled,
  className = "",
  id,
}: NumericFormInputProps) {
  const [field, meta, helpers] = useField<string>(name);
  const [numberError, setNumberError] = useState<string | null>(null);
  const errorTimerRef = useRef<NodeJS.Timeout | null>(null);

  const inputId = id ?? name;
  const formikError = Boolean(meta.touched && meta.error);
  const activeError = numberError || (formikError ? meta.error : null);

  const triggerNumberError = () => {
    setNumberError("Number is required here. Text is not allowed.");
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => {
      setNumberError(null);
    }, 3500);
  };

  useEffect(() => {
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allowed control keys
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "Tab" ||
      e.key === "Escape" ||
      e.key === "Enter" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      e.key === "Home" ||
      e.key === "End"
    ) {
      return;
    }

    // Allow Ctrl / Cmd shortcuts (Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z)
    if (e.ctrlKey || e.metaKey) {
      return;
    }

    // Allow leading + for international phone numbers at index 0
    if (allowLeadingPlus && e.key === "+") {
      const input = e.currentTarget;
      if (input.selectionStart === 0 && !input.value.includes("+")) {
        setNumberError(null);
        return;
      }
    }

    // If key is a digit 0-9
    if (/^[0-9]$/.test(e.key)) {
      setNumberError(null);
      return;
    }

    // Any other key (letters, punctuation, etc.) is rejected
    e.preventDefault();
    triggerNumberError();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    
    // Check if pasted/entered text contains disallowed characters
    let cleaned = rawVal;
    let hadTextLetters = false;

    if (allowLeadingPlus) {
      const startsWithPlus = rawVal.startsWith("+");
      const digitsOnly = rawVal.replace(/\D/g, "");
      cleaned = startsWithPlus ? `+${digitsOnly}` : digitsOnly;
      if (/[a-zA-Z]/.test(rawVal)) {
        hadTextLetters = true;
      }
    } else {
      cleaned = rawVal.replace(/\D/g, "");
      if (/[a-zA-Z]/.test(rawVal)) {
        hadTextLetters = true;
      }
    }

    if (hadTextLetters) {
      triggerNumberError();
    } else if (numberError) {
      setNumberError(null);
    }

    helpers.setValue(cleaned);
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
        <input
          id={inputId}
          name={name}
          type="tel"
          inputMode="numeric"
          pattern="[0-9+]*"
          value={field.value ?? ""}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={field.onBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          className={[
            "w-full rounded-xl border bg-[#f8f9f8] px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 transition-colors duration-150 outline-none",
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
