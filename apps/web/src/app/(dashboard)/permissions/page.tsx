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

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .matches(/^[A-Za-z\s]+$/, 'Permission name can only contain alphabets and spaces')
    .required('Permission name is required'),
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

  const permissionFields = React.useMemo(() => {
    const isAssigned = !!editingPermission?.is_assigned;
    return [
      {
        name: 'name',
        label: 'Permission Name',
        type: 'text',
        required: true,
        placeholder: 'Enter Permission Name',
        onChange: (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: any) => {
          const lettersOnly = e.target.value.replace(/[^a-zA-Z\s]/g, '');
          setFieldValue('name', lettersOnly);
          const autoCode = lettersOnly
            .toLowerCase()
            .replace(/^\s+/, '')
            .replace(/\s+/g, '_');
          setFieldValue('code', autoCode);
        },
      },
      {
        name: 'code',
        label: 'Permission Code',
        type: 'text',
        required: true,
        disabled: true,
        placeholder: 'Generated automatically',
      },
      {
        name: 'is_active',
        label: 'Status Active',
        type: 'toggle',
        required: false,
        disabled: isAssigned && editingPermission?.is_active,
      },
    ];
  }, [editingPermission]);

  const permissionsArray: Permission[] = React.useMemo(() => {
    if (Array.isArray(permissionsData)) return permissionsData;
    if (Array.isArray(permissionsData?.data)) return permissionsData.data;
    if (Array.isArray(permissionsData?.items)) return permissionsData.items;
    return [];
  }, [permissionsData]);

  const totalRows: number = React.useMemo(() => {
    if (typeof permissionsData?.total === 'number') return permissionsData.total;
    if (typeof permissionsData?.pagination?.totalItems === 'number') return permissionsData.pagination.totalItems;
    return permissionsArray.length;
  }, [permissionsData, permissionsArray]);

  const fetchPermissions = React.useCallback(
    (page: number, pageSize: number, search?: string, status?: any) => {
      const params: any = {
        page,
        pageSize,
      };
      const activeSearch = search !== undefined ? search : searchQuery;
      const activeStatus = status !== undefined ? status : statusFilter;

      if (activeSearch && activeSearch.trim()) {
        params.search = activeSearch.trim();
      }
      if (activeStatus !== undefined && activeStatus !== null && activeStatus !== 'all') {
        params.is_active = activeStatus;
      }

      dispatch(getAllPermissions({ data: params }));
    },
    [dispatch, searchQuery, statusFilter]
  );

  const searchTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchPermissions(1, 10, '', 'all');

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      dispatch(setPermissionSearchData({ search: '', status: 'all' }));
      dispatch(setPermissionPagination({ pageIndex: 0, pageSize: 10 }));
    };
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
      const trimmedName = values.name.trim();
      const code = trimmedName.toLowerCase().replace(/\s+/g, '_');
      const payload = {
        name: trimmedName,
        code,
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
              fetchPermissions(pagination?.pageIndex ? pagination.pageIndex + 1 : 1, pagination?.pageSize || 10, searchQuery, statusFilter);
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
              fetchPermissions(pagination?.pageIndex ? pagination.pageIndex + 1 : 1, pagination?.pageSize || 10, searchQuery, statusFilter);
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

  const handleDelete = async (permission: Permission) => {
    if (permission.is_assigned) {
      toast.error(`Cannot delete permission '${permission.name}' because it is assigned to a role or module.`);
      return;
    }

    const isConfirmed = await confirm({
      title: 'Delete Permission?',
      message: `Are you sure you want to delete permission '${permission.name}'? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!isConfirmed) return;

    dispatch(
      deletePermission({
        id: permission.id,
        onSuccess: () => {
          toast.success('Permission deleted successfully');
          fetchPermissions(pagination?.pageIndex ? pagination.pageIndex + 1 : 1, pagination?.pageSize || 10, searchQuery, statusFilter);
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
          <span className="text-sm text-slate-700 dark:text-slate-300">
            {getValue() as string}
          </span>
        ),
      },
      {
        header: 'Status',
        accessorKey: 'is_active',
        cell: ({ row }) => {
          const isAssigned = !!row.original.is_assigned;
          const isDeactivateDisabled = row.original.is_active && isAssigned;
          const switchTitle = isDeactivateDisabled
            ? 'Cannot deactivate permission assigned to a role or module'
            : undefined;

          return (
            <CustomSwitch
              name={`status-${row.original.id}`}
              checked={row.original.is_active}
              disabled={isDeactivateDisabled}
              title={switchTitle}
              onChange={(e) => {
                const newVal = e.target.checked;
                if (!newVal && isAssigned) {
                  toast.error(
                    `Cannot deactivate permission '${row.original.name}' because it is assigned to a role or module.`
                  );
                  return;
                }
                dispatch(
                  updatePermission({
                    id: row.original.id,
                    data: { is_active: newVal },
                    onSuccess: () => {
                      toast.success('Permission status updated successfully');
                      fetchPermissions(pagination?.pageIndex ? pagination.pageIndex + 1 : 1, pagination?.pageSize || 10, searchQuery, statusFilter);
                      dispatch(checkAuthStart());
                    },
                    onFailure: (err: any) => {
                      toast.error(err.message || 'Failed to update status');
                    },
                  })
                );
              }}
            />
          );
        },
      },
      {
        header: () => <div className="text-right">Actions</div>,
        id: 'actions',
        cell: ({ row }) => {
          const isAssigned = !!row.original.is_assigned;
          return (
            <TableRowActions
              onEdit={() => handleOpenEdit(row.original)}
              onDelete={() => handleDelete(row.original)}
              deleteDisabled={isAssigned}
              deleteTitle={
                isAssigned
                  ? 'Cannot delete permission assigned to a role or module'
                  : 'Delete Permission'
              }
              editTitle="Edit Permission"
            />
          );
        },
      },
    ],
    [dispatch, fetchPermissions, pagination, searchQuery, statusFilter]
  );

  const handleSearchChange = (val: string) => {
    dispatch(setPermissionSearchData({ search: val, status: statusFilter }));
    const newPagination = { ...pagination, pageIndex: 0 };
    dispatch(setPermissionPagination(newPagination));
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      fetchPermissions(1, pagination?.pageSize || 10, val, statusFilter);
    }, 300);
  };

  const handleStatusChange = (val: any) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    dispatch(setPermissionSearchData({ search: searchQuery, status: val }));
    const newPagination = { ...pagination, pageIndex: 0 };
    dispatch(setPermissionPagination(newPagination));
    fetchPermissions(1, pagination?.pageSize || 10, searchQuery, val);
  };

  const handleRefresh = () => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    dispatch(setPermissionSearchData({ search: '', status: 'all' }));
    const newPagination = { pageIndex: 0, pageSize: 10 };
    dispatch(setPermissionPagination(newPagination));
    fetchPermissions(1, 10, '', 'all');
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
          data={permissionsArray}
          pagination={pagination}
          setPagination={(newPagination: any) => {
            const nextPag = typeof newPagination === 'function' ? newPagination(pagination) : newPagination;
            dispatch(setPermissionPagination(nextPag));
            fetchPermissions(nextPag.pageIndex + 1, nextPag.pageSize, searchQuery, statusFilter);
          }}
          totalRows={totalRows}
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
