'use client';

import React from 'react';
import Select from 'react-select';

interface SelectDropDownProps {
  name: string;
  options: any[];
  value: any;
  error?: string;
  placeholder?: string;
  isSearchable?: boolean;
  isClearable?: boolean;
  onChange: (value: any) => void;
  disabled?: boolean;
  touched?: boolean;
  isMulti?: boolean;
  onBlur?: any;
}

export default function SelectDropDown({
  name,
  options,
  value,
  error,
  placeholder,
  isSearchable,
  isClearable,
  onChange,
  disabled,
  touched,
  isMulti,
  onBlur,
}: SelectDropDownProps) {
  const hasError = touched && !!error;

  return (
    <>
      <Select
        options={options}
        placeholder={placeholder || 'Select'}
        isClearable={isClearable}
        isSearchable={isSearchable || false}
        menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
        name={name}
        onBlur={onBlur}
        isDisabled={disabled || false}
        value={value}
        controlShouldRenderValue
        hideSelectedOptions={true}
        onChange={onChange}
        isMulti={isMulti}
        menuPlacement="auto"
        className="text-sm h-10"
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          control: (provided, state) => ({
            ...provided,
            backgroundColor: 'var(--card)',
            border: hasError
              ? '1px solid #ef4444'
              : state.isFocused
                ? '1px solid var(--primary)'
              : '1px solid var(--border)',
            borderRadius: '0.5rem',
            boxShadow: state.isFocused
              ? '0 0 0 2px color-mix(in srgb, var(--primary) 20%, transparent)'
              : 'none',
            '&:hover': {
              borderColor: hasError
                ? '#ef4444'
                : 'var(--primary)',
              cursor: 'pointer',
            },
          }),

          menu: (provided) => ({
            ...provided,
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
          }),

          option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
              ? 'var(--primary)'
              : state.isFocused
              ? 'color-mix(in srgb, var(--primary) 10%, transparent)'
              : 'transparent',
            color: state.isSelected
              ? '#fff'
              : 'inherit',
            fontSize: '12px',
          }),

          singleValue: (provided) => ({
            ...provided,
            fontSize: '12px',
          }),
          multiValue: (provided) => ({
            ...provided,
            borderRadius: '0.4rem',
          }),
          multiValueLabel: (provided) => ({
            ...provided,
            fontSize: '12px',
          }),
          multiValueRemove: (provided) => ({
            ...provided,
            ':hover': {
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              color: 'red',
              cursor: 'pointer',
            },
          }),
          placeholder: (provided) => ({
            ...provided,
          }),
          dropdownIndicator: (provided) => ({
            ...provided,
            padding: '4px',
          }),
        }}
      />
      {touched && error && (
        <div className="mt-1 text-xs text-red-500 font-semibold">{error}</div>
      )}
    </>
  );
}
