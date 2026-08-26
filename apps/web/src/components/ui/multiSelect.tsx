'use client';

import React from 'react';
import Select from 'react-select';

interface MultiSelectProps {
  name: string;
  options: any[];
  value: any[];
  touched?: any;
  errors?: any;
  placeholder?: string;
  isSearchable?: boolean;
  isClearable?: boolean;
  onChange: (value: any) => void;
  disabled?: boolean;
}

export default function MultiSelect({
  name,
  options,
  value,
  placeholder,
  isSearchable,
  isClearable,
  onChange,
  disabled,
}: MultiSelectProps) {
  return (
    <Select
      options={options}
      blurInputOnSelect
      placeholder={placeholder || 'Select'}
      isClearable={isClearable}
      isSearchable={isSearchable || false}
      menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
      name={name}
      isDisabled={disabled || false}
      value={value}
      controlShouldRenderValue
      hideSelectedOptions={true}
      onChange={onChange}
      menuPlacement="auto"
      className="text-sm"
      isMulti={true}
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        control: (provided, state) => ({
          ...provided,
          backgroundColor: 'transparent',
          border: state.isFocused ? '1px solid #6366f1' : '1px solid rgb(var(--border))',
          borderRadius: '0.5rem',
          boxShadow: state.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none',
          '&:hover': {
            cursor: 'pointer',
          },
          height: 'max-content',
          minHeight: '2.5rem',
        }),
        option: (provided, state) => {
          const isActive = state.isSelected || state.isFocused;
          const bgColor = isActive ? '#6366f1' : 'transparent';
          const textColor = isActive ? '#fff' : 'inherit';

          return {
            ...provided,
            backgroundColor: bgColor,
            color: textColor,
            fontSize: '12px',
          };
        },
        placeholder: (provided) => ({
          ...provided,
          fontSize: '12px',
        }),
        singleValue: (provided) => ({
          ...provided,
          fontSize: '12px',
        }),
        indicatorsContainer: (provided) => ({
          ...provided,
          padding: '0px',
        }),
        dropdownIndicator: (provided) => ({
          ...provided,
          padding: '4px',
        }),
      }}
    />
  );
}
