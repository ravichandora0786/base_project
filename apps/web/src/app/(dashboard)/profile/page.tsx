'use client';

import React, { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAppSelector, useAppDispatch } from '@/store';
import { checkAuthStart } from '@/features/auth/store/auth.slice';
import LoadingButton from '@/components/ui/loadingButton';
import GenericModal from '@/components/ui/genericModal';
import {
  FiEdit2, FiSave, FiLock, FiCamera, FiX, FiCheckCircle, FiXCircle,
} from 'react-icons/fi';
import {
  GENDER_OPTIONS,
  PHONE_REGEX, PHONE_ERROR,
  PASSWORD_REGEX, PASSWORD_ERROR,
} from '@/lib/constants';
import RenderFields from '@/components/ui/renderFields';
import { getInitials } from '@/lib/utils';

// Redux Imports
import { selectGlobalLoading } from '@/store/common/selector';
import {
  selectActiveTab,
  selectProfileData,
  selectEditingPersonal,
  selectEditingAddress,
  selectImgModalOpen,
  selectImgPreview,
  selectImgFile,
  selectImgUploading,
} from './store/selector';
import {
  setActiveTab,
  setEditingPersonal,
  setEditingAddress,
  setImgModalOpen,
  setImgPreview,
  setImgFile,
  getProfile,
  updateProfileData,
  changePassword,
  uploadProfileImage,
} from './store/slice';

// --- Schemas ------------------------------------------------------------------
const personalSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  phone: Yup.string()
    .nullable()
    .max(10, 'Max 10 digits')
    .test('phone-test', PHONE_ERROR, (value) => {
      if (!value || value.trim() === '') return true;
      return PHONE_REGEX.test(value);
    }),
  gender: Yup.string().nullable(),
});

const addressSchema = Yup.object({
  street: Yup.string().nullable(),
  city: Yup.string().nullable(),
  state: Yup.string().nullable(),
  country: Yup.string().nullable(),
  postal_code: Yup.string().nullable(),
});

const passwordSchema = Yup.object({
  oldPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(6, 'Min 6 characters')
    .matches(PASSWORD_REGEX, PASSWORD_ERROR)
    .required('Required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords do not match')
    .required('Required'),
});

// --- Helpers ------------------------------------------------------------------
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold text-custom-muted uppercase tracking-wider mb-1">
      {children}
    </label>
  );
}

function FieldInput({ name, type = 'text', placeholder, disabled }: {
  name: string; type?: string; placeholder?: string; disabled?: boolean;
}) {
  return (
    <Field
      name={name}
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3.5 py-2.5 border border-custom rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition
        ${disabled ? 'bg-gray-50 dark:bg-gray-700/40 text-custom-muted cursor-not-allowed' : 'bg-white dark:bg-gray-800'}`}
    />
  );
}

function FieldError({ name }: { name: string }) {
  return (
    <ErrorMessage name={name}>
      {(msg: string) => <p className="text-xs text-red-500 mt-0.5">{msg}</p>}
    </ErrorMessage>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <span className="text-xs text-custom-muted font-semibold uppercase tracking-wider block">{label}</span>
      <span className="text-sm font-bold text-gray-900 dark:text-white mt-1 block">
        {value || <span className="italic font-normal text-custom-muted">Not specified</span>}
      </span>
    </div>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <div className="bg-custom-card border border-custom rounded-2xl shadow-sm overflow-hidden">{children}</div>;
}

// --- Types --------------------------------------------------------------------
type ActiveTabType = 'profile' | 'password';

interface AddressData {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
}

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  gender: string | null;
  profile_image: string | null;
  address?: AddressData | null;
  is_active: boolean;
  role: { id: string; name: string };
}

// --- Main Page ----------------------------------------------------------------
export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user: authUser } = useAppSelector((state) => state.auth);

  // Redux Selectors
  const activeTab = useAppSelector(selectActiveTab) as ActiveTabType;
  const profile = useAppSelector(selectProfileData) as ProfileData | null;
  const loading = useAppSelector(selectGlobalLoading);
  const editingPersonal = useAppSelector(selectEditingPersonal);
  const editingAddress = useAppSelector(selectEditingAddress);
  const imgModalOpen = useAppSelector(selectImgModalOpen);
  const imgPreview = useAppSelector(selectImgPreview);
  const imgFile = useAppSelector(selectImgFile);
  const imgUploading = useAppSelector(selectImgUploading);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const personalFields = [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      label: 'Email Address (read-only)',
      type: 'email',
      disabled: true,
      required: false,
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'text',
      required: false,
      maxLength: 10,
      placeholder: '9000000000',
    },
    {
      name: 'gender',
      label: 'Gender',
      type: 'select',
      required: false,
      options: [...GENDER_OPTIONS],
    },
  ];

  const addressFields = [
    {
      name: 'street',
      label: 'Street / Address Line',
      type: 'text',
      required: false,
    },
    {
      name: 'city',
      label: 'City',
      type: 'text',
      required: false,
    },
    {
      name: 'state',
      label: 'State / Province',
      type: 'text',
      required: false,
    },
    {
      name: 'country',
      label: 'Country',
      type: 'text',
      required: false,
    },
    {
      name: 'postal_code',
      label: 'Postal Code',
      type: 'text',
      required: false,
    },
  ];

  const passwordFields = [
    {
      name: 'oldPassword',
      label: 'Current Password',
      type: 'password',
      required: true,
      placeholder: 'Enter current password',
    },
    {
      name: 'newPassword',
      label: 'New Password',
      type: 'password',
      required: true,
      placeholder: 'Enter new password',
    },
    {
      name: 'confirmPassword',
      label: 'Confirm New Password',
      type: 'password',
      required: true,
      placeholder: 'Re-enter new password',
    },
  ];

  useEffect(() => {
    if (authUser?.id) {
      dispatch(getProfile({ id: authUser.id }));
    }
  }, [authUser?.id, dispatch]);

  // -- Save Personal Info ----------------------------------------------------
  const handleSavePersonal = (values: any, { setSubmitting }: any) => {
    if (!profile) return;
    dispatch(
      updateProfileData({
        data: {
          name: values.name,
          phone: values.phone || null,
          gender: values.gender || null,
        },
        onSuccess: () => {
          toast.success('Personal info updated');
          dispatch(setEditingPersonal(false));
          dispatch(getProfile({ id: profile.id }));
          dispatch(checkAuthStart());
        },
        onFailure: (err: any) => {
          toast.error(err.message || 'Failed to update');
        },
      })
    );
    setSubmitting(false);
  };

  // -- Save Address ----------------------------------------------------------
  const handleSaveAddress = (values: any, { setSubmitting }: any) => {
    if (!profile) return;
    dispatch(
      updateProfileData({
        data: {
          address: {
            street: values.street || null,
            city: values.city || null,
            state: values.state || null,
            country: values.country || null,
            postal_code: values.postal_code || null,
          },
        },
        onSuccess: () => {
          toast.success('Address updated');
          dispatch(setEditingAddress(false));
          dispatch(getProfile({ id: profile.id }));
        },
        onFailure: (err: any) => {
          toast.error(err.message || 'Failed to update address');
        },
      })
    );
    setSubmitting(false);
  };

  // -- Change Password -------------------------------------------------------
  const handleChangePassword = (values: any, { setSubmitting, resetForm }: any) => {
    dispatch(
      changePassword({
        data: {
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        },
        onSuccess: () => {
          toast.success('Password changed successfully');
          resetForm();
        },
        onFailure: (err: any) => {
          toast.error(err.message || 'Failed to change password');
        },
      })
    );
    setSubmitting(false);
  };

  // -- Image Upload ---------------------------------------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    dispatch(setImgFile(file));
    dispatch(setImgPreview(URL.createObjectURL(file)));
  };

  const handleImageUpload = () => {
    if (!imgFile || !profile) return;
    dispatch(
      uploadProfileImage({
        id: profile.id,
        file: imgFile,
        onSuccess: () => {
          toast.success('Profile image updated');
          dispatch(setImgModalOpen(false));
          dispatch(setImgPreview(null));
          dispatch(setImgFile(null));
          dispatch(getProfile({ id: profile.id }));
          dispatch(checkAuthStart());
        },
      })
    );
  };

  const navItems: { key: ActiveTabType; label: string; icon: React.ReactNode }[] = [
    { key: 'profile', label: 'My Profile', icon: <FiEdit2 className="w-4 h-4" /> },
    { key: 'password', label: 'Change Password', icon: <FiLock className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const addrData: AddressData = profile?.address || {};

  return (
    <div className="flex gap-6 flex-1 min-h-0">
      {/* -- Left Sidebar -- */}
      <div className="w-52 shrink-0">
        <SectionCard>
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                dispatch(setActiveTab(item.key));
                dispatch(setEditingPersonal(false));
                dispatch(setEditingAddress(false));
              }}
              className={[
                'w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold transition text-left border-b border-custom last:border-0',
                activeTab === item.key
                  ? 'bg-custom-primary/10 text-custom-primary'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40',
              ].join(' ')}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </SectionCard>
      </div>

      {/* -- Right Content -- */}
      <div className="flex-1 min-w-0 overflow-auto space-y-5">
        {/* --- MY PROFILE --- */}
        {activeTab === 'profile' && profile && (
          <>
            {/* -- Profile Header Card -- */}
            <SectionCard>
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-5">
                  {/* Avatar with pencil overlay */}
                  <div className="relative group">
                    <div className="w-16 h-16 rounded-2xl bg-custom-primary/10 text-custom-primary flex items-center justify-center text-2xl font-extrabold border border-custom-primary/20 overflow-hidden">
                      {profile.profile_image ? (
                        <img src={profile.profile_image} alt={profile.name} className="w-full h-full object-cover" />
                      ) : (
                        getInitials(profile.name)
                      )}
                    </div>
                    {/* Pencil overlay */}
                    <button
                      onClick={() => {
                        dispatch(setImgPreview(null));
                        dispatch(setImgFile(null));
                        dispatch(setImgModalOpen(true));
                      }}
                      className="absolute inset-0 w-16 h-16 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      title="Change Profile Picture"
                    >
                      <FiCamera className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">{profile.name}</h2>
                    <p className="text-sm text-custom-muted mt-0.5 capitalize">{profile.role?.name || 'User'}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {profile.is_active ? (
                        <>
                          <FiCheckCircle className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-xs font-bold text-green-600 dark:text-green-400">Active</span>
                        </>
                      ) : (
                        <>
                          <FiXCircle className="w-3.5 h-3.5 text-red-500" />
                          <span className="text-xs font-bold text-red-600 dark:text-red-400">Inactive</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* -- Personal Information Card -- */}
            <SectionCard>
              <div className="flex items-center justify-between px-6 py-4 border-b border-custom">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Personal Information</h3>
                {!editingPersonal && (
                  <button
                    onClick={() => {
                      dispatch(setEditingPersonal(true));
                      dispatch(setEditingAddress(false));
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-custom-primary hover:opacity-80 transition"
                  >
                    <FiEdit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {!editingPersonal ? (
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <InfoRow label="Full Name" value={profile.name} />
                  <InfoRow label="Email Address" value={profile.email} />
                  <InfoRow label="Phone Number" value={profile.phone} />
                  <InfoRow label="Gender" value={profile.gender} />
                </div>
              ) : (
                <Formik
                  initialValues={{ name: profile.name || '', phone: profile.phone || '', gender: profile.gender || '' }}
                  validationSchema={personalSchema}
                  onSubmit={handleSavePersonal}
                  enableReinitialize={true}
                >
                  {({ values, errors, touched, setFieldValue, handleBlur, isSubmitting }) => (
                    <Form className="p-6 space-y-4">
                      <RenderFields
                        fields={personalFields}
                        values={{ ...values, email: profile.email }}
                        errors={errors}
                        touched={touched}
                        setFieldValue={setFieldValue}
                        handleBlur={handleBlur}
                        columns={2}
                      />
                      <div className="flex justify-end gap-3 pt-3 border-t border-custom">
                        <LoadingButton
                          type="button"
                          variant="secondary"
                          onClick={() => dispatch(setEditingPersonal(false))}
                          className="px-5 py-2.5 font-bold"
                        >
                          Cancel
                        </LoadingButton>
                        <LoadingButton type="submit" isLoading={isSubmitting} variant="primary" className="flex items-center gap-2 px-5 py-2.5 font-bold">
                          <FiSave className="w-4 h-4" /> Save Changes
                        </LoadingButton>
                      </div>
                    </Form>
                  )}
                </Formik>
              )}
            </SectionCard>

            {/* -- Address Card -- */}
            <SectionCard>
              <div className="flex items-center justify-between px-6 py-4 border-b border-custom">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Address</h3>
                {!editingAddress && (
                  <button
                    onClick={() => {
                      dispatch(setEditingAddress(true));
                      dispatch(setEditingPersonal(false));
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-custom-primary hover:opacity-80 transition"
                  >
                    <FiEdit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {!editingAddress ? (
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <InfoRow label="Street / Address Line" value={addrData.street} />
                  <InfoRow label="City" value={addrData.city} />
                  <InfoRow label="State / Province" value={addrData.state} />
                  <InfoRow label="Country" value={addrData.country} />
                  <InfoRow label="Postal Code" value={addrData.postal_code} />
                </div>
              ) : (
                <Formik
                  initialValues={{
                    street: addrData.street || '',
                    city: addrData.city || '',
                    state: addrData.state || '',
                    country: addrData.country || '',
                    postal_code: addrData.postal_code || '',
                  }}
                  validationSchema={addressSchema}
                  onSubmit={handleSaveAddress}
                  enableReinitialize={true}
                >
                  {({ values, errors, touched, setFieldValue, handleBlur, isSubmitting }) => (
                    <Form className="p-6 space-y-4">
                      <RenderFields
                        fields={addressFields}
                        values={values}
                        errors={errors}
                        touched={touched}
                        setFieldValue={setFieldValue}
                        handleBlur={handleBlur}
                        columns={2}
                      />
                      <div className="flex justify-end gap-3 pt-3 border-t border-custom">
                        <LoadingButton
                          type="button"
                          variant="secondary"
                          onClick={() => dispatch(setEditingAddress(false))}
                          className="px-5 py-2.5 font-bold"
                        >
                          Cancel
                        </LoadingButton>
                        <LoadingButton type="submit" isLoading={isSubmitting} variant="primary" className="flex items-center gap-2 px-5 py-2.5 font-bold">
                          <FiSave className="w-4 h-4" /> Save Changes
                        </LoadingButton>
                      </div>
                    </Form>
                  )}
                </Formik>
              )}
            </SectionCard>
          </>
        )}

        {/* --- CHANGE PASSWORD --- */}
        {activeTab === 'password' && (
          <SectionCard>
            <div className="px-6 py-4 border-b border-custom">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Change Password</h3>
              <p className="text-sm text-custom-muted mt-0.5">Update your own account password only.</p>
            </div>
            <Formik
              initialValues={{ oldPassword: '', newPassword: '', confirmPassword: '' }}
              validationSchema={passwordSchema}
              onSubmit={handleChangePassword}
            >
              {({ values, errors, touched, setFieldValue, handleBlur, isSubmitting }) => (
                <Form className="p-6 space-y-5 max-w-md">
                  <RenderFields
                    fields={passwordFields}
                    values={values}
                    errors={errors}
                    touched={touched}
                    setFieldValue={setFieldValue}
                    handleBlur={handleBlur}
                    columns={1}
                  />
                  <div className="pt-4 border-t border-custom">
                    <LoadingButton type="submit" isLoading={isSubmitting} variant="primary" className="flex items-center gap-2 px-6 py-2.5 font-bold">
                      <FiLock className="w-4 h-4" /> Update Password
                    </LoadingButton>
                  </div>
                </Form>
              )}
            </Formik>
          </SectionCard>
        )}
      </div>

      {/* --- Image Upload Modal --- */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <GenericModal
        showModal={imgModalOpen}
        closeModal={() => {
          dispatch(setImgModalOpen(false));
          dispatch(setImgPreview(null));
          dispatch(setImgFile(null));
        }}
        modalTitle="Update Profile Picture"
        modalBody={
          <div className="space-y-5">
            {/* Preview area */}
            <div className="flex justify-center">
              <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-custom bg-gray-50 dark:bg-gray-800/40 flex items-center justify-center overflow-hidden">
                {imgPreview ? (
                  <img src={imgPreview} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <div className="text-center text-custom-muted">
                    <FiCamera className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <span className="text-xs">No image selected</span>
                  </div>
                )}
              </div>
            </div>

            {/* Choose button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 border border-custom rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Choose Image
              </button>
            </div>

            {imgFile && (
              <p className="text-xs text-center text-custom-muted truncate px-4">{imgFile.name}</p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-custom">
              <LoadingButton
                variant="secondary"
                onClick={() => {
                  dispatch(setImgModalOpen(false));
                  dispatch(setImgPreview(null));
                  dispatch(setImgFile(null));
                }}
              >
                Cancel
              </LoadingButton>
              <LoadingButton
                variant="primary"
                isLoading={imgUploading}
                onClick={handleImageUpload}
                className="flex items-center gap-2 font-bold"
              >
                Upload Image
              </LoadingButton>
            </div>
          </div>
        }
      />
    </div>
  );
}
