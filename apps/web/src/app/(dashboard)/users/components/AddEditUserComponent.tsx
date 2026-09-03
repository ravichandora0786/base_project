'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import LoadingButton from '@/components/ui/loadingButton';
import RenderFields from '@/components/ui/renderFields';
import { apiClient } from '@/lib/api/client';
import {
  GENDER_OPTIONS,
  PHONE_REGEX,
  PHONE_ERROR,
  EMAIL_GMAIL_REGEX,
  EMAIL_GMAIL_ERROR,
  PASSWORD_REGEX,
  PASSWORD_ERROR,
} from '@/lib/constants';
import { FiArrowLeft, FiCamera, FiSave } from 'react-icons/fi';
import { getInitials } from '@/lib/utils';

interface AddEditUserComponentProps {
  userId?: string | null;
  isEdit: boolean;
}

export default function AddEditUserComponent({ userId, isEdit }: AddEditUserComponentProps) {
  const router = useRouter();
  const [roleOptions, setRoleOptions] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(isEdit ? true : false);
  const [btnLoading, setBtnLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile image local upload state
  const [selectedImgFile, setSelectedImgFile] = useState<File | null>(null);
  const [selectedImgPreview, setSelectedImgPreview] = useState<string | null>(null);

  const [initialValues, setInitialValues] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    role_id: '',
    about: '',
    date_of_birth: null as Date | null,
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
    },
    password: '',
    confirmPassword: '',
    profile_image: '',
    is_active: true,
  });

  // Fetch Roles List
  const fetchRoles = async () => {
    try {
      const response = await apiClient.get('/roles');
      const options = response.data.map((role: any) => ({
        label: role.name.charAt(0).toUpperCase() + role.name.slice(1),
        value: role.id,
      }));
      setRoleOptions(options);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load roles');
    }
  };

  // Fetch User Details (only for Edit mode)
  const fetchUserDetails = async (id: string) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/users/${id}`);
      const user = response.data;

      const addr = user.address || {};
      const simpleAddressObj = {
        street: addr.street || '',
        city: addr.city || '',
        state: addr.state || '',
        country: addr.country || '',
        postal_code: addr.postal_code || '',
      };

      setInitialValues({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        role_id: user.role?.id || '',
        about: user.about || '',
        date_of_birth: user.date_of_birth ? new Date(user.date_of_birth) : null,
        address: simpleAddressObj,
        password: '',
        confirmPassword: '',
        profile_image: user.profile_image || '',
        is_active: user.is_active ?? true,
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load user details');
      router.push('/users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    if (isEdit && userId) {
      fetchUserDetails(userId);
    }
  }, [userId, isEdit]);

  // Form Fields Configuration (except Address and Password)
  const fields = [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      required: true,
    },
    {
      name: 'gender',
      label: 'Gender',
      type: 'select',
      required: false,
      options: [...GENDER_OPTIONS],
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      disabled: isEdit,
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'text',
      required: false,
      maxLength: 10,
      placeholder: '9000000000',
      onKeyDown: (e: any) => {
        // Allow: backspace, delete, tab, escape, enter
        if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
          // Allow: Ctrl+A, Command+A
          (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
          // Allow: home, end, left, right, down, up
          (e.keyCode >= 35 && e.keyCode <= 40)) {
          return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
          e.preventDefault();
        }
      }
    },
    {
      name: 'date_of_birth',
      label: 'Date of Birth (DOB)',
      type: 'date',
      required: false,
    },
    {
      name: 'role_id',
      label: 'Role',
      type: 'select',
      required: true,
      options: roleOptions,
    },
    ...(!isEdit
      ? [
        {
          name: 'password',
          label: 'Password',
          type: 'password',
          required: true,
        },
        {
          name: 'confirmPassword',
          label: 'Confirm Password',
          type: 'password',
          required: true,
        },
      ]
      : []),
    {
      name: 'is_active',
      label: 'Status Active',
      type: 'toggle',
      required: false,
    },
    {
      name: 'about',
      label: 'Description / About',
      type: 'textarea',
      required: false,
      colSpan: 2,
    },
  ];

  // Address Fields
  const addressFields = [
    {
      name: 'address.street',
      label: 'Street / Address Line',
      type: 'text',
      required: false,
    },
    {
      name: 'address.city',
      label: 'City',
      type: 'text',
      required: false,
    },
    {
      name: 'address.state',
      label: 'State / Province',
      type: 'text',
      required: false,
    },
    {
      name: 'address.country',
      label: 'Country',
      type: 'text',
      required: false,
    },
    {
      name: 'address.postal_code',
      label: 'Postal Code',
      type: 'text',
      required: false,
    },
  ];

  // Validation Schema
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string()
      .matches(EMAIL_GMAIL_REGEX, EMAIL_GMAIL_ERROR)
      .required('Email is required'),
    role_id: Yup.string().required('Role is required'),
    phone: Yup.string()
      .nullable()
      .test('phone-test', PHONE_ERROR, (value) => {
        if (!value || value.trim() === '') return true;
        return PHONE_REGEX.test(value);
      }),
    address: Yup.object().shape({
      street: Yup.string().nullable(),
      city: Yup.string().nullable(),
      state: Yup.string().nullable(),
      country: Yup.string().nullable(),
      postal_code: Yup.string().nullable(),
    }),
    ...(!isEdit
      ? {
        password: Yup.string()
          .required('Password is required')
          .min(6, 'Password must be at least 6 characters')
          .matches(PASSWORD_REGEX, PASSWORD_ERROR),
        confirmPassword: Yup.string()
          .oneOf([Yup.ref('password')], 'Passwords do not match')
          .required('Confirm Password is required'),
      }
      : {}),
  });

  const handleSubmit = async (values: any) => {
    try {
      setBtnLoading(true);
      const selectedRole = roleOptions.find((r) => r.value === values.role_id);

      const payload: any = {
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        gender: values.gender || null,
        role_id: values.role_id,
        about: values.about || null,
        address: values.address || null,
        is_active: values.is_active,
        date_of_birth: values.date_of_birth || null,
      };

      let targetUserId = userId;

      if (isEdit && userId) {
        await apiClient.patch(`/users/${userId}`, payload);
      } else {
        payload.password = values.password;
        payload.role = selectedRole ? selectedRole.label.toLowerCase() : 'user';
        const res = await apiClient.post('/users', payload);
        targetUserId = res.data.id;
      }

      // Upload profile image on submit if selected
      if (selectedImgFile && targetUserId) {
        const formData = new FormData();
        formData.append('profile_image', selectedImgFile);
        await apiClient.patch(`/users/${targetUserId}/profile-image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      toast.success(isEdit ? 'User updated successfully' : 'User created successfully');
      router.push('/users');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setBtnLoading(false);
    }
  };

  // Image Selection handler (No direct upload)
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    setSelectedImgFile(file);
    const previewUrl = URL.createObjectURL(file);
    setSelectedImgPreview(previewUrl);
  };

  // Clean up object URL when component unmounts
  useEffect(() => {
    return () => {
      if (selectedImgPreview) {
        URL.revokeObjectURL(selectedImgPreview);
      }
    };
  }, [selectedImgPreview]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 flex-1 flex flex-col min-h-0">
      {/* Header with Back Button */}
      <div className="flex items-center space-x-4">
        <LoadingButton
          variant="secondary"
          onClick={() => router.push('/users')}
          className="p-2.5 border border-custom rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <FiArrowLeft className="w-4 h-4" />
        </LoadingButton>
        <div>
          <span className="text-xs text-custom-muted font-bold uppercase tracking-wider">User Directory</span>
          <h2 className="text-xl font-bold text-gray-955 dark:text-white">
            {isEdit ? 'Edit User Profile' : 'Add New User'}
          </h2>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-transparent flex-grow overflow-y-auto w-full">

        {/* Profile Picture Upload Section (for BOTH Add & Edit modes) */}
        <div className="flex flex-col items-center sm:flex-row gap-6 pb-6 mb-6 border-b border-custom">
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-custom-primary/10 text-custom-primary flex items-center justify-center text-3xl font-extrabold border border-custom-primary/20 overflow-hidden">
              {selectedImgPreview ? (
                <img src={selectedImgPreview} alt="Selected preview" className="w-full h-full object-cover" />
              ) : initialValues.profile_image ? (
                <img src={initialValues.profile_image} alt="User profile" className="w-full h-full object-cover" />
              ) : (
                getInitials(initialValues.name || 'U')
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 w-24 h-24 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              title="Select Profile Photo"
            >
              <FiCamera className="w-6 h-6 text-white" />
            </button>
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Profile Photo</h3>
            <p className="text-xs text-custom-muted mt-1">Click image to select. Maximum size 2MB (JPG, PNG, WEBP).</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize={true}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, setFieldValue, handleBlur }) => (
            <Form className="space-y-6">
              <RenderFields
                fields={fields}
                values={values}
                errors={errors}
                touched={touched}
                setFieldValue={setFieldValue}
                handleBlur={handleBlur}
                columns={2}
              />

              {/* Address Section */}
              <div className="pt-6 mt-6 border-t border-custom">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Address Specifications
                </h3>
                <RenderFields
                  fields={addressFields}
                  values={values}
                  errors={errors}
                  touched={touched}
                  setFieldValue={setFieldValue}
                  handleBlur={handleBlur}
                  columns={2}
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-custom">
                <LoadingButton
                  type="button"
                  variant="secondary"
                  onClick={() => router.push('/users')}
                  className="px-5 py-2.5 font-bold"
                >
                  Cancel
                </LoadingButton>
                <LoadingButton
                  type="submit"
                  isLoading={btnLoading}
                  variant="primary"
                  className="flex items-center gap-2 px-5 py-2.5 font-bold"
                >
                  <FiSave className="w-4 h-4" />
                  {isEdit ? 'Update Profile' : 'Save & Submit'}
                </LoadingButton>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
