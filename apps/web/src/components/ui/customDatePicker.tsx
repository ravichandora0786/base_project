import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface CustomDatePickerProps {
  dateMode?: 'single' | 'range';
  name?: string;
  value?: string | null;
  onChange?: (date: string | null) => void;
  startDate?: string | null;
  endDate?: string | null;
  setStartDate?: (date: string) => void;
  setEndDate?: (date: string) => void;
  placeholderText?: string;
  isClearable?: boolean;
  dateFormat?: string;
  className?: string;
  minDate?: Date;
  disabled?: boolean;
  touched?: boolean;
  error?: string;
}

const CustomDatePicker = (props: CustomDatePickerProps) => {
  const {
    dateMode = 'single',
    name,
    value,
    onChange,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    placeholderText = dateMode === 'single'
      ? 'Select Date'
      : 'Select Date Range',
    isClearable = true,
    dateFormat = 'dd-MMM-yyyy',
    className = '',
    minDate,
    disabled,
    touched,
    error,
  } = props;

  const classes = `h-10 w-full rounded-md border text-base bg-white dark:bg-gray-800 px-3 py-2 
          placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 
          disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
            touched && error
              ? 'border-red-500 hover:border-red-500 focus-visible:ring-red-500'
              : 'border-custom hover:border-indigo-500 focus-visible:ring-indigo-500'
          } ${className}`;

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`; // ✅ YYYY-MM-DD
  };

  const parseDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-');
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  // Single Date Handler
  const handleSingleChange = (date: Date | null) => {
    if (onChange) {
      onChange(date ? formatDate(date) : null);
    }
  };

  // Range Date Handler
  const handleRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    if (setStartDate) setStartDate(start ? formatDate(start) : '');
    if (setEndDate) setEndDate(end ? formatDate(end) : '');
  };

  return dateMode === 'single' ? (
    <div>
      <DatePicker
        name={name}
        selected={parseDate(value)}
        onChange={handleSingleChange}
        placeholderText={placeholderText}
        className={classes}
        isClearable={isClearable}
        dateFormat={dateFormat}
        minDate={minDate}
        disabled={disabled || false}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
      />
      {touched && error && (
        <div className="mt-1 text-xs text-red-500 font-semibold">{error}</div>
      )}
    </div>
  ) : (
    <DatePicker
      selected={parseDate(startDate)}
      onChange={handleRangeChange}
      startDate={parseDate(startDate)}
      endDate={parseDate(endDate)}
      selectsRange
      placeholderText={placeholderText}
      className={classes}
      isClearable={isClearable}
      dateFormat={dateFormat}
      disabled={disabled || false}
    />
  );
};

export default CustomDatePicker;
