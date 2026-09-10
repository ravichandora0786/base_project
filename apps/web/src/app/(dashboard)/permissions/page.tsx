'use client';

import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import RenderFields from '@/components/ui/renderFields';
import LoadingButton from '@/components/ui/loadingButton';
import DataTableComponent from '@/components/ui/dataTableComponent';
import GenericModal from '@/components/ui/genericModal';
import TableToolbar from '@/components/common/TableToolbar';
import TableRowActions from '@/components/common/TableRowActions';
import { ColumnDef } from '@tanstack/react-table';
import CustomSwitch from '@/components/ui/customSwitch';
import { useAppDispatch, useAppSelector } from '@/store';
import { checkAuthStart } from '@/features/auth/store/auth.slice';
import { useConfirm } from '@/components/ui/confirmationModal';
import { Permission } from '@/types/models';

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
            name={`status-${row.original.id}`}
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
          <TableRowActions
            onEdit={() => handleOpenEdit(row.original)}
            onDelete={() => handleDelete(row.original.id)}
            editTitle="Edit Permission"
            deleteTitle="Delete Permission"
          />
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

  const searchTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (val: string) => {
    dispatch(setPermissionSearchData({ search: val, status: statusFilter }));
    dispatch(setPermissionPagination({ ...pagination, pageIndex: 0 }));
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      fetchWithFilters(val, statusFilter);
    }, 300);
  };

  const handleStatusChange = (val: any) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    dispatch(setPermissionSearchData({ search: searchQuery, status: val }));
    dispatch(setPermissionPagination({ ...pagination, pageIndex: 0 }));
    fetchWithFilters(searchQuery, val);
  };

  const handleRefresh = () => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    dispatch(setPermissionSearchData({ search: '', status: 'all' }));
    dispatch(setPermissionPagination({ pageIndex: 0, pageSize: 10 }));
    dispatch(getAllPermissions({}));
  };

  return (
    <div className="space-y-4 flex-1 flex flex-col min-h-0">
      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        onRefresh={handleRefresh}
        onCreate={handleOpenCreate}
        createTooltip="Create Permission"
      />

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
