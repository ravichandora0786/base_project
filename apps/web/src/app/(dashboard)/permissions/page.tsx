'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { toast } from 'react-toastify';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import RenderFields from '@/components/ui/renderFields';
import LoadingButton from '@/components/ui/loadingButton';
import DataTableComponent from '@/components/ui/dataTableComponent';
import GenericModal from '@/components/ui/genericModal';
import { ColumnDef } from '@tanstack/react-table';

interface Permission {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
}

const permissionFields = [
  {
    name: 'name',
    label: 'Permission Name',
    type: 'text',
    required: true,
  },
  {
    name: 'code',
    label: 'Permission Code',
    type: 'text',
    required: true,
  },
  {
    name: 'is_active',
    label: 'Status Active',
    type: 'toggle',
    required: false,
  },
];

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Permission name is required'),
  code: Yup.string().required('Permission code is required'),
});

export default function PermissionsCRUDPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  
  // Local client-side pagination state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/permissions');
      setPermissions(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleOpenCreate = () => {
    setEditingPermission(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (permission: Permission) => {
    setEditingPermission(permission);
    setModalOpen(true);
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      if (editingPermission) {
        await apiClient.patch(`/permissions/${editingPermission.id}`, values);
        toast.success('Permission updated successfully');
      } else {
        await apiClient.post('/permissions', values);
        toast.success('Permission created successfully');
      }
      setModalOpen(false);
      fetchPermissions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this permission?')) return;
    try {
      await apiClient.delete(`/permissions/${id}`);
      toast.success('Permission deleted successfully');
      fetchPermissions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete permission');
    }
  };

  // Columns definition for DataTableComponent
  const columns = React.useMemo<ColumnDef<Permission>[]>(
    () => [
      {
        header: 'Permission Name',
        accessorKey: 'name',
        cell: ({ getValue }) => <span className="capitalize font-bold">{getValue() as string}</span>,
      },
      {
        header: 'Code',
        accessorKey: 'code',
        cell: ({ getValue }) => (
          <code className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-custom rounded-md text-red-500">
            {getValue() as string}
          </code>
        ),
      },
      {
        header: 'Status',
        accessorKey: 'is_active',
        cell: ({ getValue }) => {
          const isActive = getValue() as boolean;
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isActive
                  ? 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400'
              }`}
            >
              {isActive ? 'Active' : 'Inactive'}
            </span>
          );
        },
      },
      {
        header: () => <div className="text-right">Actions</div>,
        id: 'actions',
        cell: ({ row }) => (
          <div className="text-right space-x-2">
            <LoadingButton
              variant="custom"
              onClick={() => handleOpenEdit(row.original)}
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl transition inline-flex items-center"
              aria-label="Edit Permission"
            >
              <FiEdit2 className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="custom"
              onClick={() => handleDelete(row.original.id)}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition inline-flex items-center"
              aria-label="Delete Permission"
            >
              <FiTrash2 className="w-4 h-4" />
            </LoadingButton>
          </div>
        ),
      },
    ],
    [permissions]
  );

  // Client-side pagination slicing
  const slicedPermissions = React.useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return permissions.slice(start, end);
  }, [permissions, pagination]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">Permissions Management</h1>
          <p className="mt-1 text-sm text-custom-muted">Configure access rights and codes for custom middleware</p>
        </div>
        <LoadingButton
          onClick={handleOpenCreate}
          variant="custom"
          className="flex items-center space-x-2 px-4 py-2.5 bg-custom-primary hover:bg-custom-primary-hover text-white rounded-xl font-bold shadow-md transition"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add Permission</span>
        </LoadingButton>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <DataTableComponent
          columns={columns}
          data={slicedPermissions}
          pagination={pagination}
          setPagination={setPagination}
          totalRows={permissions.length}
        />
      )}

      {/* Modal Dialog using GenericModal & RenderFields */}
      <GenericModal
        showModal={modalOpen}
        closeModal={() => setModalOpen(false)}
        modalTitle={editingPermission ? 'Update Permission' : 'Create Permission'}
        modalBody={
          <Formik
            initialValues={{
              name: editingPermission ? editingPermission.name : '',
              code: editingPermission ? editingPermission.code : '',
              is_active: editingPermission ? editingPermission.is_active : true,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleBlur, setFieldValue, isSubmitting }) => (
              <Form className="space-y-4">
                <RenderFields
                  fields={permissionFields}
                  values={values}
                  errors={errors}
                  touched={touched}
                  setFieldValue={setFieldValue}
                  handleBlur={handleBlur}
                  columns={1}
                />

                <div className="flex space-x-3 pt-2">
                  <LoadingButton
                    type="button"
                    variant="secondary"
                    onClick={() => setModalOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </LoadingButton>
                  <LoadingButton
                    type="submit"
                    isLoading={isSubmitting}
                    variant="primary"
                    className="flex-1"
                  >
                    Save
                  </LoadingButton>
                </div>
              </Form>
            )}
          </Formik>
        }
      />
    </div>
  );
}
