import React from 'react';

interface CustomSwitchProps {
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function CustomSwitch({
  name,
  checked,
  onChange,
  disabled,
  title,
  size = 'md',
}: CustomSwitchProps) {
  const sizeClasses = {
    sm: 'w-7 h-4 after:h-3 after:w-3 after:top-[2px] after:left-[2px]',
    md: 'w-9 h-5 after:h-4 after:w-4 after:top-[2px] after:left-[2px]',
    lg: 'w-11 h-6 after:h-5 after:w-5 after:top-[2px] after:left-[2px]',
  };

  return (
    <label
      title={title}
      className={`relative inline-flex items-center ${
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
      }`}
    >
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
      />
      <div
        className={`${
          sizeClasses[size] || sizeClasses.md
        } bg-red-500 peer-focus:outline-none rounded-full peer dark:bg-red-950/60 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:bg-white after:border-red-300 after:border after:rounded-full after:transition-all dark:border-red-900 peer-checked:bg-green-600`}
      ></div>
    </label>
  );
}
