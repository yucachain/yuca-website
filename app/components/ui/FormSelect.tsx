import React from "react";
import { useField } from "formik";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FormSelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  helperText?: string;
  id?: string;
  disabled?: boolean;
}

/**
 * <FormSelect name="state" label="State" placeholder="Select State" options={NIGERIAN_STATES} />
 */
export default function FormSelect({
  name,
  label,
  placeholder = "Select an option",
  options,
  helperText,
  id,
  disabled,
}: FormSelectProps) {
  const [field, meta] = useField(name);
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
        <select
          id={inputId}
          disabled={disabled}
          aria-invalid={hasError}
          className={[
            "w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-9 text-sm text-gray-900",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-emerald-800/30 focus:border-emerald-800",
            hasError ? "border-red-400" : "border-gray-300",
            !field.value && "text-gray-400",
            "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400",
          ]
            .filter(Boolean)
            .join(" ")}
          {...field}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-gray-900">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          strokeWidth={1.8}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>

      {hasError ? (
        <p className="mt-1.5 text-sm text-red-600">{meta.error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
}
