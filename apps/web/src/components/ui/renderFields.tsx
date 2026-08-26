import React, { useState } from 'react';
import CustomDatePicker from './customDatePicker';
import CustomSwitch from './customSwitch';
import InputBox from './inputBox';
import SelectDropDown from './selectDropDown';
import { getIn } from 'formik';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

interface RenderFieldsProps {
  fields: any[];
  values: any;
  errors: any;
  touched: any;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  handleBlur: any;
  columns?: number;
}

const RenderFields = ({
  fields,
  values,
  errors,
  touched,
  setFieldValue,
  handleBlur,
  columns = 4,
}: RenderFieldsProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const variantClasses: Record<number, string> = {
    4: 'lg:grid-cols-4',
    3: 'lg:grid-cols-3',
    2: 'lg:grid-cols-2 md:grid-cols-2',
    1: 'lg:grid-cols-1 md:grid-cols-1',
  };
  return (
    <div className={`grid grid-cols-1 ${variantClasses[columns] || 'lg:grid-cols-4'} gap-4`}>
      {fields.map(
        ({
          name,
          label,
          type,
          required,
          options,
          disabled,
          isMulti = false,
          selectOnChange,
          dateMode = 'single',
          onChange,
          onKeyDown,
          maxLength,
          minDate,
        }) => {
          const fieldValue = getIn(values, name);
          const fieldError = getIn(errors, name);
          const fieldTouched = getIn(touched, name);
          return (
            <div key={name}>
              {type !== 'toggle' && type !== 'file' && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {label} {required && <span className="text-red-500">*</span>}
                </label>
              )}

              {/* Render Input or Select based on type */}
              {type === 'select' ? (
                <SelectDropDown
                  name={name}
                  options={options}
                  value={
                    isMulti
                      ? options?.filter((opt: any) =>
                          fieldValue?.includes(opt.value)
                        )
                      : options?.find((opt: any) => opt.value === fieldValue) || null
                  }
                  onChange={(option: any) => {
                    if (typeof selectOnChange === 'function') {
                      selectOnChange(option, setFieldValue, values);
                      return;
                    } else {
                      if (isMulti) {
                        setFieldValue(
                          name,
                          option ? option?.map((opt: any) => opt.value) : []
                        );
                      } else {
                        setFieldValue(name, option ? option.value : undefined);
                      }
                    }
                  }}
                  placeholder={`Select ${label}`}
                  onBlur={handleBlur}
                  isSearchable={true}
                  isClearable={true}
                  touched={fieldTouched}
                  error={fieldError}
                  disabled={disabled}
                  isMulti={isMulti}
                />
              ) : type === 'toggle' ? (
                <div className="w-full flex flex-row justify-between items-center py-2">
                  <div className="flex flex-col justify-between">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {label}{' '}
                      {required && <span className="text-red-500">*</span>}
                    </label>
                    <span className="text-gray-400 text-xs">
                      Toggle active status
                    </span>
                  </div>
                  <div>
                    <CustomSwitch
                      name={name}
                      disabled={disabled}
                      checked={!!fieldValue}
                      onChange={(event) => {
                        setFieldValue(name, event.target.checked);
                      }}
                    />
                  </div>
                </div>
              ) : type === 'date' ? (
                <CustomDatePicker
                  dateMode={dateMode}
                  name={name}
                  value={fieldValue}
                  onChange={(date) => {
                    if (typeof onChange === 'function') {
                      onChange(date, setFieldValue, values);
                      return;
                    } else {
                      setFieldValue(name, date);
                    }
                  }}
                  placeholderText="DD/MM/YYYY"
                  isClearable={true}
                  dateFormat="dd MMM yyyy"
                  minDate={minDate}
                  error={fieldError}
                  touched={fieldTouched}
                  disabled={disabled}
                />
              ) : type === 'password' ? (
                <div className="relative">
                  <span className="absolute left-3 top-[10px] text-gray-400">
                    <FiLock className="w-5 h-5" />
                  </span>
                  <InputBox
                    id={name}
                    name={name}
                    type={showPassword ? 'text' : 'password'}
                    className="pl-10 pr-10 w-full"
                    value={fieldValue || ''}
                    onChange={(e) => setFieldValue(name, e.target.value)}
                    placeholder={`Enter ${label}`}
                    error={fieldError}
                    touched={fieldTouched}
                    disabled={disabled}
                    onBlur={handleBlur}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[10px] text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-5 h-5" />
                    ) : (
                      <FiEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              ) : ['text', 'email', 'number', 'textarea'].includes(type) ? (
                <InputBox
                  type={type}
                  name={name}
                  value={fieldValue || ''}
                  onChange={(e) => {
                    if (typeof onChange === 'function') {
                      onChange(e, setFieldValue, values);
                    } else {
                      setFieldValue(name, e.target.value);
                    }
                  }}
                  placeholder={`Enter ${label}`}
                  error={fieldError}
                  touched={fieldTouched}
                  disabled={disabled}
                  onBlur={handleBlur}
                  onKeyDown={onKeyDown}
                  maxLength={maxLength}
                />
              ) : null}
            </div>
          );
        }
      )}
    </div>
  );
};

export default RenderFields;
