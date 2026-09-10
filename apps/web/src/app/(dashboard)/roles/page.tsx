'use client';

import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { FiLock } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
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
import { Role } from '@/types/models';

// Redux Imports
import {
  selectAllRoleDataList,
  selectRolePagination,
  selectRoleSearchData,
  selectRoleModalOpen,
  selectEditingRole,
} from './store/selector';
import {
  getAllRoles,
  setRolePagination,
  setRoleSearchData,
  setModalOpen,
  setEditingRole,
  createRole,
  updateRole,
  deleteRole,
} from './store/slice';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Role name is required'),
});

export default function RolesCRUDPage() {
  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  const router = useRouter();

  // Redux Selectors
  const rolesData = useAppSelector(selectAllRoleDataList);
  const pagination = useAppSelector(selectRolePagination);
  const { search: searchQuery, status: statusFilter } = useAppSelector(selectRoleSearchData);
  const modalOpen = useAppSelector(selectRoleModalOpen);
  const editingRole = useAppSelector(selectEditingRole);

  const rolesArray: Role[] = React.useMemo(() => {
    if (Array.isArray(rolesData)) return rolesData;
    if (Array.isArray(rolesData?.data)) return rolesData.data;
    if (Array.isArray(rolesData?.items)) return rolesData.items;
    return [];
  }, [rolesData]);

  const totalRows: number = React.useMemo(() => {
    if (typeof rolesData?.total === 'number') return rolesData.total;
    if (typeof rolesData?.pagination?.totalItems === 'number') return rolesData.pagination.totalItems;
    return rolesArray.length;
  }, [rolesData, rolesArray]);

  const fetchRoles = React.useCallback(
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

      dispatch(getAllRoles({ data: params }));
    },
    [dispatch, searchQuery, statusFilter]
  );

  useEffect(() => {
    fetchRoles(pagination?.pageIndex ? pagination.pageIndex + 1 : 1, pagination?.pageSize || 10, searchQuery, statusFilter);
  }, [dispatch]);

  const handleOpenCreate = () => {
    dispatch(setEditingRole(null));
    dispatch(setModalOpen(true));
  };

  const handleOpenEdit = (role: Role) => {
    dispatch(setEditingRole(role));
    dispatch(setModalOpen(true));
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      const isAdmin = editingRole?.name?.toLowerCase() === 'admin';
      const payload = {
        name: isAdmin ? 'admin' : values.name,
        is_active: isAdmin ? true : values.is_active,
      };

      if (editingRole) {
        dispatch(
          updateRole({
            id: editingRole.id,
            data: payload,
            onSuccess: () => {
              toast.success('Role updated successfully');
              dispatch(setModalOpen(false));
              fetchRoles(pagination?.pageIndex ? pagination.pageIndex + 1 : 1, pagination?.pageSize || 10, searchQuery, statusFilter);
              dispatch(checkAuthStart());
            },
            onFailure: (err: any) => {
              toast.error(err.message || 'Update failed');
            },
          })
        );
      } else {
        dispatch(
          createRole({
            data: payload,
            onSuccess: () => {
              toast.success('Role created successfully');
              dispatch(setModalOpen(false));
              fetchRoles(pagination?.pageIndex ? pagination.pageIndex + 1 : 1, pagination?.pageSize || 10, searchQuery, statusFilter);
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
      title: 'Delete Role?',
      message: 'Are you sure you want to delete this role? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!isConfirmed) return;

    dispatch(
      deleteRole({
        id,
        onSuccess: () => {
          toast.success('Role deleted successfully');
          fetchRoles(pagination?.pageIndex ? pagination.pageIndex + 1 : 1, pagination?.pageSize || 10, searchQuery, statusFilter);
          dispatch(checkAuthStart());
        },
        onFailure: (err: any) => {
          toast.error(err.message || 'Failed to delete role');
        },
      })
    );
  };

  // Columns definition for DataTableComponent
  const columns = React.useMemo<ColumnDef<Role>[]>(
    () => [
      {
        header: 'Role Name',
        accessorKey: 'name',
        cell: ({ getValue }) => {
          const val = getValue() as string;
          return <span className="font-bold capitalize">{val}</span>;
        },
      },
      {
        header: 'Status',
        accessorKey: 'is_active',
        cell: ({ row }) => {
          const isAdmin = row.original.name?.toLowerCase() === 'admin';
          return (
            <CustomSwitch
              name={`role-status-${row.original.id}`}
              checked={row.original.is_active}
              disabled={isAdmin}
              title={isAdmin ? 'Admin role cannot be deactivated' : undefined}
              onChange={(e) => {
                if (isAdmin) {
                  toast.error('Admin role cannot be deactivated');
                  return;
                }
                const newVal = e.target.checked;
                dispatch(
                  updateRole({
                    id: row.original.id,
                    data: { name: row.original.name, is_active: newVal },
                    onSuccess: () => {
                      toast.success('Role status updated successfully');
                      fetchRoles(pagination?.pageIndex ? pagination.pageIndex + 1 : 1, pagination?.pageSize || 10, searchQuery, statusFilter);
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
          const isAdmin = row.original.name?.toLowerCase() === 'admin';
          return (
            <TableRowActions
              extraActions={
                <LoadingButton
                  variant="custom"
                  onClick={() => router.push(`/roles/${row.original.id}/permissions`)}
                  className="w-8 h-8 rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/40 transition inline-flex items-center justify-center shadow-2xs"
                  aria-label="Edit Role Permissions"
                  title="Manage Permissions"
                >
                  <FiLock className="w-4 h-4" />
                </LoadingButton>
              }
              onEdit={() => handleOpenEdit(row.original)}
              onDelete={!isAdmin ? () => handleDelete(row.original.id) : undefined}
              editTitle="Edit Role"
              deleteTitle="Delete Role"
            />
          );
        },
      },
    ],
    [dispatch, router, fetchRoles, pagination, searchQuery, statusFilter]
  );

  const currentRoleFields = React.useMemo(() => {
    const isAdmin = editingRole?.name?.toLowerCase() === 'admin';
    return [
      {
        name: 'name',
        label: 'Role Name',
        type: 'text',
        required: true,
        disabled: isAdmin,
      },
      {
        name: 'is_active',
        label: 'Status Active',
        type: 'toggle',
        required: false,
        disabled: isAdmin,
      },
    ];
  }, [editingRole]);

  const searchTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (val: string) => {
    dispatch(setRoleSearchData({ search: val, status: statusFilter }));
    const newPagination = { ...pagination, pageIndex: 0 };
    dispatch(setRolePagination(newPagination));
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      fetchRoles(1, pagination?.pageSize || 10, val, statusFilter);
    }, 300);
  };

  const handleStatusChange = (val: any) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    dispatch(setRoleSearchData({ search: searchQuery, status: val }));
    const newPagination = { ...pagination, pageIndex: 0 };
    dispatch(setRolePagination(newPagination));
    fetchRoles(1, pagination?.pageSize || 10, searchQuery, val);
  };

  const handleRefresh = () => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    dispatch(setRoleSearchData({ search: '', status: 'all' }));
    const newPagination = { pageIndex: 0, pageSize: 10 };
    dispatch(setRolePagination(newPagination));
    fetchRoles(1, 10, '', 'all');
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
        createTooltip="Create Role"
      />

      <div className="flex-1 flex flex-col min-h-0">
        <DataTableComponent
          columns={columns}
          data={rolesArray}
          pagination={pagination}
          setPagination={(newPagination: any) => {
            const nextPag = typeof newPagination === 'function' ? newPagination(pagination) : newPagination;
            dispatch(setRolePagination(nextPag));
            fetchRoles(nextPag.pageIndex + 1, nextPag.pageSize, searchQuery, statusFilter);
          }}
          totalRows={totalRows}
        />
      </div>

      {/* Modal Dialog using GenericModal & RenderFields */}
      <GenericModal
        showModal={modalOpen}
        closeModal={() => dispatch(setModalOpen(false))}
        modalTitle={editingRole ? 'Update Role' : 'Create Role'}
        modalBody={
          <Formik
            initialValues={{
              name: editingRole ? editingRole.name : '',
              is_active: editingRole ? editingRole.is_active : true,
            }}
            validationSchema={validationSchema}
            enableReinitialize={true}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleBlur, setFieldValue, isSubmitting }) => (
              <Form className="space-y-4">
                <RenderFields
                  fields={currentRoleFields}
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
