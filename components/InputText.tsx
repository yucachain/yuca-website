"use client";

import React from 'react';
import { useField } from 'formik';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  rightIcon?: React.ReactNode;
  theme?: 'light' | 'dark';
}

const InputText: React.FC<InputProps> = ({ label, rightIcon, theme = 'light', className = '', ...props }) => {
  const [field, meta] = useField(props);

  const isDark = theme === 'dark';
  
  const baseInputStyles = `w-full pl-4 ${rightIcon ? 'pr-10' : 'pr-4'} py-2 border rounded-lg outline-none transition-all`;
  
  const stateStyles = meta.touched && meta.error
    ? 'border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50 text-black'
    : isDark 
      ? 'border-white/30 bg-white/10 text-white placeholder-white/50 focus:border-white/60 focus:ring-1 focus:ring-white/60'
      : 'border-gray-300 bg-white text-gray-900 focus:border-[#215243] focus:ring-1 focus:ring-[#215243]';

  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && (
        <label htmlFor={props.id || props.name} className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-700'}`}>
          {label}
        </label>
      )}
      <div className="relative w-full">
        <input
          id={props.id || props.name}
          className={`${baseInputStyles} ${stateStyles}`}
          {...field}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-500">
            {rightIcon}
          </div>
        )}
      </div>
      {meta.touched && meta.error ? (
        <span className="text-xs text-red-500 mt-0.5">{meta.error}</span>
      ) : null}
    </div>
  );
};

export default InputText;
