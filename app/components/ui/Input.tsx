import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

/**
 * Base input element. Purely presentational — no Formik knowledge here.
 * FormInput / PasswordInput compose this with Formik's `useField`.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ hasError = false, className = "", ...rest }, ref) => {
    return (
      <input
        ref={ref}
        className={[
          "w-full rounded-lg border border-emerald-950/25 bg-[#f8f9f8] px-1 py-2 text-sm text-gray-900",
          "placeholder:text-gray-400 text-[0.8rem] px-3",
          "transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-emerald-800/30 focus:border-emerald-800",
          hasError
            ? "border-red-400 focus:border-red-500 focus:ring-red-400/30"
            : "border-gray-300",
          "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400",
          className,
        ].join(" ")}
        {...rest}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;