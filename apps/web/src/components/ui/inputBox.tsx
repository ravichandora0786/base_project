import React from 'react';

interface InputBoxProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  error?: string;
  touched?: boolean;
}

export default function InputBox({ error, touched, className = '', type = 'text', ...props }: InputBoxProps) {
  const isTextArea = type === 'textarea';
  const hasError = touched && !!error;

  const baseClass = `h-10 w-full rounded-lg border bg-custom-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 transition ${
    hasError 
      ? 'border-red-500 focus-visible:ring-red-500' 
      : 'border-custom focus-visible:ring-indigo-500'
  } ${className}`;

  if (isTextArea) {
    return (
      <div>
        <textarea
          className={`${baseClass} h-24 resize-none`}
          {...(props as any)}
        />
        {hasError && <div className="mt-1 text-xs text-red-500 font-semibold">{error}</div>}
      </div>
    );
  }

  return (
    <div>
      <input
        type={type}
        className={baseClass}
        {...props}
      />
      {hasError && <div className="mt-1 text-xs text-red-500 font-semibold">{error}</div>}
    </div>
  );
}
