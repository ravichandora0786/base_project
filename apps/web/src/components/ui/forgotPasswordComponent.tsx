'use client';

import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import LoadingButton from './loadingButton';
import RenderFields from './renderFields';

const fields = [
  {
    name: 'newPassword',
    label: 'New Password',
    type: 'password',
    required: true,
  },
  {
    name: 'confirmNewPassword',
    label: 'Confirm New Password',
    type: 'password',
    required: true,
  },
];

interface ForgotPasswordComponentProps {
  onSubmit: (values: any) => Promise<void>;
  onCancel?: () => void;
}

export default function ForgotPasswordComponent({ onSubmit, onCancel }: ForgotPasswordComponentProps) {
  const [buttonLoading, setButtonLoading] = useState(false);

  const initialValues = {
    newPassword: '',
    confirmNewPassword: '',
  };

  const validationSchema = Yup.object().shape({
    newPassword: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('New Password is required'),
    confirmNewPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], 'Passwords must match')
      .required('Confirm Password is required'),
  });

  const handleSubmitData = async (values: any) => {
    setButtonLoading(true);
    try {
      await onSubmit(values);
    } finally {
      setButtonLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 justify-start w-full mx-auto bg-custom-card border border-custom rounded-2xl p-6">
      <div className="flex flex-row justify-center items-center w-full min-h-[300px]">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize={true}
          onSubmit={handleSubmitData}
        >
          {({
            values,
            errors,
            touched,
            handleBlur,
            handleSubmit,
            setFieldValue,
            resetForm,
          }) => (
            <Form
              onSubmit={handleSubmit}
              className="w-full max-w-lg border border-custom p-6 rounded-2xl bg-custom-card"
            >
              <RenderFields
                fields={fields}
                values={values}
                errors={errors}
                touched={touched}
                setFieldValue={setFieldValue}
                handleBlur={handleBlur}
                columns={1}
              />
              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <LoadingButton
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    resetForm();
                    if (onCancel) onCancel();
                  }}
                >
                  Cancel
                </LoadingButton>
                <LoadingButton
                  type="submit"
                  isLoading={buttonLoading}
                  disabled={buttonLoading}
                >
                  Save & Submit
                </LoadingButton>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
