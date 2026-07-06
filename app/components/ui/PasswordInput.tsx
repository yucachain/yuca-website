import React, { useState } from "react";
import { useField } from "formik";
import Input, { InputProps } from "./Input";

export interface PasswordInputProps
  extends Omit<InputProps, "name" | "value" | "onChange" | "onBlur" | "type"> {
  name: string;
  label?: string;
  helperText?: string;
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 5.1A10.9 10.9 0 0 1 12 5c7 0 11 7 11 7a13.2 13.2 0 0 1-3.4 3.9M6.6 6.6C3.7 8.4 2 12 2 12a13.6 13.6 0 0 0 4.2 5.1A10.6 10.6 0 0 0 12 19c1 0 2-.1 2.9-.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Password field wired to Formik, with a show/hide toggle
 * (mirrors the eye icon shown in the YucaChain login/sign-up form).
 *
 * <PasswordInput name="password" label="Password" />
 */
export default function PasswordInput({
  name,
  label,
  helperText,
  id,
  ...rest
}: PasswordInputProps) {
  const [field, meta] = useField(name);
  const [visible, setVisible] = useState(false);
  const inputId = id ?? name;
  const hasError = Boolean(meta.touched && meta.error);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-gray-800"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <Input
          id={inputId}
          type={visible ? "text" : "password"}
          hasError={hasError}
          aria-invalid={hasError}
          className="pr-9"
          {...field}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <EyeIcon open={visible} />
        </button>
      </div>

      {hasError ? (
        <p className="mt-1.5 text-sm text-red-600">{meta.error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
}