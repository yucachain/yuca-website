import React from "react";
import { useField } from "formik";
import Input, { InputProps } from "./Input";

export interface FormInputProps
  extends Omit<InputProps, "name" | "value" | "onChange" | "onBlur"> {
  /** Formik field name — must match a key in your Formik `initialValues` */
  name: string;
  /** Visible label rendered above the input */
  label?: string;
  /** Optional helper text shown under the input when there is no error */
  helperText?: string;
}

/**
 * Text input wired to Formik via `useField`.
 *
 * <FormInput name="email" label="Email Address" type="email" placeholder="you@example.com" />
 */
export default function FormInput({
  name,
  label,
  helperText,
  id,
  ...rest
}: FormInputProps) {
  const [field, meta] = useField(name);
  const inputId = id ?? name;
  const hasError = Boolean(meta.touched && meta.error);
  const describedBy = hasError
    ? `${inputId}-error`
    : helperText
    ? `${inputId}-helper`
    : undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-0.6 block text-sm font-medium text-gray-800"
        >
          {label}
        </label>
      )}

      <Input
        id={inputId}
        hasError={hasError}
        aria-invalid={hasError}
        aria-describedby={describedBy}
        {...field}
        {...rest}
      />

      {hasError ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600">
          {meta.error}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-gray-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}