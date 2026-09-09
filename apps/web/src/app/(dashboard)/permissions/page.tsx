'use client';

import React, { useEffect } from 'react';
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
import { useAppDispatch, useAppSelector } from '@/store';
import { checkAuthStart } from '@/features/auth/store/auth.slice';
import { STATUS_FILTER_OPTIONS } from '@/lib/constants';
import { useConfirm } from '@/components/ui/confirmationModal';

// Redux Imports
import {
  selectAllPermissionDataList,
  selectPermissionPagination,
  selectPermissionSearchData,
  selectPermissionModalOpen,
  selectEditingPermission,
} from './store/selector';
import {
  getAllPermissions,
  setPermissionPagination,
  setPermissionSearchData,
  setModalOpen,
  setEditingPermission,
  createPermission,
  updatePermission,
  deletePermission,
} from './store/slice';

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

  // Redux Selectors
  const permissionsData = useAppSelector(selectAllPermissionDataList);
  const pagination = useAppSelector(selectPermissionPagination);
  const { search: searchQuery, status: statusFilter } = useAppSelector(selectPermissionSearchData);
  const modalOpen = useAppSelector(selectPermissionModalOpen);
  const editingPermission = useAppSelector(selectEditingPermission);

  useEffect(() => {
    dispatch(getAllPermissions({}));
  }, [dispatch]);

  const handleOpenCreate = () => {
    dispatch(setEditingPermission(null));
    dispatch(setModalOpen(true));
  };

  const handleOpenEdit = (permission: Permission) => {
    dispatch(setEditingPermission(permission));
    dispatch(setModalOpen(true));
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      const payload = {
        name: values.name,
        code: values.code,
        is_active: values.is_active,
      };

      if (editingPermission) {
        dispatch(
          updatePermission({
            id: editingPermission.id,
            data: payload,
            onSuccess: () => {
              toast.success('Permission updated successfully');
              dispatch(setModalOpen(false));
              dispatch(getAllPermissions({}));
              dispatch(checkAuthStart());
            },
            onFailure: (err: any) => {
              toast.error(err.message || 'Update failed');
            },
          })
        );
      } else {
        dispatch(
          createPermission({
            data: payload,
            onSuccess: () => {
              toast.success('Permission created successfully');
              dispatch(setModalOpen(false));
              dispatch(getAllPermissions({}));
              dispatch(checkAuthStart());
            },
            onFailure: (err: any) => {
              toast.error(err.message || 'Creation failed');
            },
          })
        );
      }
    } catch (error: any) {
      toast.error('Action failed');
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

    dispatch(
      deletePermission({
        id,
        onSuccess: () => {
          toast.success('Permission deleted successfully');
          dispatch(getAllPermissions({}));
          dispatch(checkAuthStart());
        },
        onFailure: (err: any) => {
          toast.error(err.message || 'Failed to delete permission');
        },
      })
    );
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
            onChange={(e) => {
              const newVal = e.target.checked;
              dispatch(
                updatePermission({
                  id: row.original.id,
                  data: { is_active: newVal },
                  onSuccess: () => {
                    toast.success('Permission status updated successfully');
                    dispatch(getAllPermissions({}));
                    dispatch(checkAuthStart());
                  },
                  onFailure: (err: any) => {
                    toast.error(err.message || 'Failed to update status');
                  },
                })
              );
            }}
          />
        ),
      },
      {
        header: () => <div className="text-right">Actions</div>,
        id: 'actions',
        cell: ({ row }) => (
          <div className="text-right space-x-1.5">
            <LoadingButton
              variant="custom"
              onClick={() => handleOpenEdit(row.original)}
              className="w-8 h-8 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-transparent hover:border-blue-100 dark:hover:border-blue-900/40 transition inline-flex items-center justify-center shadow-2xs"
              aria-label="Edit Permission"
              title="Edit Permission"
            >
              <FiEdit2 className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="custom"
              onClick={() => handleDelete(row.original.id)}
              className="w-8 h-8 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border border-transparent hover:border-red-100 dark:hover:border-red-900/40 transition inline-flex items-center justify-center shadow-2xs"
              aria-label="Delete Permission"
              title="Delete Permission"
            >
              <FiTrash2 className="w-4 h-4" />
            </LoadingButton>
          </div>
        ),
      },
    ],
    [dispatch]
  );

  // Fetch permissions with server-side filtering
  const fetchWithFilters = (search: string, status: any) => {
    const params: any = {};
    if (search) params.search = search;
    if (status !== 'all') params.is_active = status;
    dispatch(getAllPermissions({ data: params }));
  };

  // Client-side pagination slicing (data already filtered by server)
  const permissionsArray: Permission[] = Array.isArray(permissionsData) ? permissionsData : [];

  const slicedPermissions = React.useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return permissionsArray.slice(start, end);
  }, [permissionsArray, pagination]);

  return (
    <div className="space-y-4 flex-1 flex flex-col min-h-0">
      {/* Toolbar Search, Status Filter and Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div className="flex items-center space-x-3 flex-grow max-w-md">
          <div className="relative flex-grow">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <FiSearch className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by Name"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                dispatch(setPermissionSearchData({ search: val, status: statusFilter }));
                fetchWithFilters(val, statusFilter);
              }}
              className="w-full pl-10 pr-4 py-2 border border-custom hover:border-primary rounded-xl text-sm bg-white dark:bg-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>

          <div className="w-40 shrink-0">
            <SelectDropDown
              name="status-filter"
              options={STATUS_FILTER_OPTIONS as any}
              value={STATUS_FILTER_OPTIONS.find((opt) => opt.value === statusFilter) as any}
              onChange={(opt: any) => {
                if (opt) {
                  dispatch(setPermissionSearchData({ search: searchQuery, status: opt.value }));
                  fetchWithFilters(searchQuery, opt.value);
                }
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
              dispatch(setPermissionSearchData({ search: '', status: 'all' }));
              dispatch(getAllPermissions({}));
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
        <DataTableComponent
          columns={columns}
          data={slicedPermissions}
          pagination={pagination}
          setPagination={(newPag: any) => dispatch(setPermissionPagination(newPag))}
          totalRows={permissionsArray.length}
        />
      </div>

      {/* Modal Dialog using GenericModal & RenderFields */}
      <GenericModal
        showModal={modalOpen}
        closeModal={() => dispatch(setModalOpen(false))}
        modalTitle={editingPermission ? 'Update Permission' : 'Create Permission'}
        modalBody={
          <Formik
            initialValues={{
              name: editingPermission ? editingPermission.name : '',
              code: editingPermission ? editingPermission.code : '',
              is_active: editingPermission ? editingPermission.is_active : true,
            }}
            validationSchema={validationSchema}
            enableReinitialize={true}
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
                    onClick={() => dispatch(setModalOpen(false))}
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
