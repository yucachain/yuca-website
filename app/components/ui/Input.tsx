"use client";

import React from "react";

interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement>{

    label?:string;
    error?:string;
}

const Input = React.forwardRef<HTMLInputElement,InputProps>(
(
{
    label,
    error,
    className,
    id,
    ...props
},
ref
)=>{

return(

<div className="w-full space-y-1">

    {label && (
        <label
            htmlFor={id}
            className="text-sm font-medium text-gray-700"
        >
            {label}
        </label>
    )}

    <input
        ref={ref}
        id={id}
        className={`w-full rounded border px-3 py-2 outline-none ${
            error
            ? "border-red-500"
            : "border-gray-300"
        } ${className}`}
        {...props}
    />

    {error && (
        <p className="text-red-500 text-sm">
            {error}
        </p>
    )}

</div>

);

}

);

Input.displayName="Input";

export default Input;