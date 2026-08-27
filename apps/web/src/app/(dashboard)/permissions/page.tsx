'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { toast } from 'react-toastify';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiRefreshCw } from 'react-icons/fi';
import RenderFields from '@/components/ui/renderFields';
import LoadingButton from '@/components/ui/loadingButton';
import DataTableComponent from '@/components/ui/dataTableComponent';
import GenericModal from '@/components/ui/genericModal';
import SelectDropDown from '@/components/ui/selectDropDown';
import { ColumnDef } from '@tanstack/react-table';
import CustomSwitch from '@/components/ui/customSwitch';
import { useAppDispatch } from '@/store';
import { checkAuthStart } from '@/features/auth/store/auth.slice';
import { STATUS_FILTER_OPTIONS } from '@/lib/constants';
import { useConfirm } from '@/components/ui/confirmationModal';

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
  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | boolean>('all');
  
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
      dispatch(checkAuthStart());
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: 'Delete Permission?',
      message: 'Are you sure you want to delete this permission? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!isConfirmed) return;
    try {
      await apiClient.delete(`/permissions/${id}`);
      toast.success('Permission deleted successfully');
      fetchPermissions();
      dispatch(checkAuthStart());
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
        cell: ({ row }) => (
          <CustomSwitch
            name={`perm-status-${row.original.id}`}
            checked={row.original.is_active}
            onChange={async (e) => {
              const newVal = e.target.checked;
              try {
                await apiClient.patch(`/permissions/${row.original.id}`, {
                  is_active: newVal,
                });
                toast.success('Permission status updated successfully');
                fetchPermissions();
                dispatch(checkAuthStart());
              } catch (err: any) {
                toast.error(err.response?.data?.message || 'Failed to update status');
              }
            }}
          />
        ),
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
              title="Edit"
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

  // Client-side filtering
  const filteredPermissions = React.useMemo(() => {
    return permissions.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ? true : p.is_active === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [permissions, searchQuery, statusFilter]);

  // Client-side pagination slicing
  const slicedPermissions = React.useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredPermissions.slice(start, end);
  }, [filteredPermissions, pagination]);

  return (
    <div className="space-y-4 flex-1 flex flex-col min-h-0">
      {/* Toolbar Search, Status Filter and Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3 flex-grow max-w-md">
          <div className="relative flex-grow">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <FiSearch className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-custom hover:border-primary rounded-xl text-sm bg-white dark:bg-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>
          
          <div className="w-40 shrink-0">
            <SelectDropDown
              name="status-filter"
              options={STATUS_FILTER_OPTIONS as any}
              value={STATUS_FILTER_OPTIONS.find((opt) => opt.value === statusFilter) as any}
              onChange={(opt: any) => {
                if (opt) setStatusFilter(opt.value);
              }}
              isSearchable={false}
              isClearable={false}
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <LoadingButton
            variant="custom"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              fetchPermissions();
            }}
            className="p-2.5 border border-custom rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 transition"
            title="Refresh Data"
          >
            <FiRefreshCw className="w-4 h-4 animate-hover-spin" />
          </LoadingButton>

          <LoadingButton
            onClick={handleOpenCreate}
            variant="custom"
            className="flex items-center space-x-2 px-4 py-2.5 bg-custom-primary hover:bg-custom-primary-hover text-white rounded-xl font-bold shadow-md transition"
          >
            <FiPlus className="w-4 h-4" />
          </LoadingButton>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
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
            totalRows={filteredPermissions.length}
          />
        )}
      </div>

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

                 <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
                  <LoadingButton
                    type="button"
                    variant="secondary"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </LoadingButton>
                  <LoadingButton
                    type="submit"
                    isLoading={isSubmitting}
                    variant="primary"
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
