'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { toast } from 'react-toastify';
import LoadingButton from '@/components/ui/loadingButton';
import SelectDropDown from '@/components/ui/selectDropDown';
import { useAppDispatch } from '@/store';
import { checkAuthStart } from '@/features/auth/store/auth.slice';
import { FiSearch, FiRefreshCw, FiX } from 'react-icons/fi';
import { Role, AppModule, Permission } from '@/types/models';

interface RolePermissionMapping {
  id: string;
  role_id: string;
  module_id: string;
  permission_ids: string[];
}

export default function RolePermissionsClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const roleId = (params?.id as string) || searchParams.get('id') || searchParams.get('roleId') || '';

  const [roles, setRoles] = useState<Role[]>([]);
  const [role, setRole] = useState<Role | null>(null);
  const [modules, setModules] = useState<AppModule[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [mappings, setMappings] = useState<RolePermissionMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  // Selected permission IDs: Record<moduleId, permissionIds[]>
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, string[]>>({});

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesRes, roleRes, modulesRes, permissionsRes, mappingsRes] = await Promise.all([
        apiClient.get('/roles'),
        apiClient.get(`/roles/${roleId}`),
        apiClient.get('/modules'),
        apiClient.get('/permissions'),
        apiClient.get('/role-permissions'),
      ]);

      const allRoles = Array.isArray(rolesRes.data) ? rolesRes.data : (rolesRes.data?.data || []);
      setRoles(allRoles);
      setRole(roleRes.data);
      
      const allModulesRaw = Array.isArray(modulesRes.data) ? modulesRes.data : (modulesRes.data?.data || []);
      const allModules: AppModule[] = allModulesRaw.filter((m: any) => m.is_active);
      setModules(allModules);

      const allPermissionsRaw = Array.isArray(permissionsRes.data) ? permissionsRes.data : (permissionsRes.data?.data || []);
      const allPermissions: Permission[] = allPermissionsRaw.filter((p: any) => p.is_active);
      setPermissions(allPermissions);

      // Filter mappings for this specific role
      const roleMappings = (mappingsRes.data as any[])
        .filter((map) => map.role_id === roleId)
        .map((map) => ({
          id: map.id,
          role_id: map.role_id,
          module_id: map.module_id,
          permission_ids: Array.isArray(map.permission_ids) ? map.permission_ids : [],
        }));
      setMappings(roleMappings);

      // Initialize selected permissions map
      const initialSelection: Record<string, string[]> = {};
      allModules.forEach((m: AppModule) => {
        const matchedMapping = roleMappings.find((map) => map.module_id === m.id);
        initialSelection[m.id] = matchedMapping ? matchedMapping.permission_ids : [];
      });
      setSelectedPermissions(initialSelection);

    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load permissions configuration');
      router.push('/roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roleId) {
      loadData();
    }
  }, [roleId]);

  const handleCheckboxChange = (moduleId: string, permissionId: string, checked: boolean) => {
    setSelectedPermissions((prev) => {
      const current = prev[moduleId] || [];
      const updated = checked
        ? [...current, permissionId]
        : current.filter((id) => id !== permissionId);
      return { ...prev, [moduleId]: updated };
    });
  };

  const handleSelectAllRowChange = (moduleId: string, checked: boolean) => {
    setSelectedPermissions((prev) => ({
      ...prev,
      [moduleId]: checked ? permissions.map((p) => p.id) : [],
    }));
  };

  const handleSave = async () => {
    if (!role) return;
    try {
      setSaving(true);
      
      const rolePermissionsPayload = modules.map((m) => ({
        moduleId: m.id,
        permissionIds: selectedPermissions[m.id] || [],
      }));

      const payload = {
        roleId: role.id,
        rolePermissions: rolePermissionsPayload,
      };

      await apiClient.post('/role-permissions/bulk', payload);
      
      toast.success('Role permissions updated successfully');
      dispatch(checkAuthStart());
      router.push('/roles');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Filter modules by search query
  const filteredModules = modules.filter((m) =>
    m.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roleOptions = roles.map((r) => ({
    label: r.name.charAt(0).toUpperCase() + r.name.slice(1),
    value: r.id,
  }));

  const currentRoleOption = role ? { label: role.name.charAt(0).toUpperCase() + role.name.slice(1), value: role.id } : null;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 flex-1 flex flex-col min-h-0">
      {/* Toolbar Search, Selector and Refresh */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 mb-2.5">
        <div className="flex items-center gap-2 sm:gap-2.5 flex-grow max-w-full sm:max-w-md md:max-w-lg">
          <div className="relative flex-grow min-w-0">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-custom-muted pointer-events-none">
              <FiSearch className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search Module"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-8 text-sm bg-custom-card border border-custom hover:border-custom-primary/50 focus:border-custom-primary rounded-xl text-custom placeholder-custom-muted/70 focus:outline-none focus:ring-2 focus:ring-custom-primary/20 transition shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-custom-muted hover:text-custom transition cursor-pointer"
                title="Clear search"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="w-36 sm:w-48 shrink-0">
            <SelectDropDown
              name="role-select"
              options={roleOptions}
              value={currentRoleOption}
              onChange={(opt) => {
                if (opt && opt.value !== roleId) {
                  if (params?.id) {
                    router.push(`/roles/${opt.value}/permissions`);
                  } else {
                    router.push(`/roles/permissions?id=${opt.value}`);
                  }
                }
              }}
              isSearchable={false}
              isClearable={false}
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 shrink-0">
          <LoadingButton
            variant="custom"
            onClick={() => {
              setSearchQuery('');
              loadData();
            }}
            className="p-2.5 border border-custom rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 transition cursor-pointer flex items-center justify-center"
            title="Refresh Data"
          >
            <FiRefreshCw className="w-4 h-4 animate-hover-spin" />
          </LoadingButton>
        </div>
      </div>

      {/* Permission Grid Table */}
      <div className="bg-custom-card border border-custom rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="overflow-auto flex-grow min-h-0">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 z-10 bg-[#e6f4ea] dark:bg-emerald-950/80 border-b border-custom shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.1)] dark:shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.1)]">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider w-1/4">
                  Module Name
                </th>
                <th className="p-4 text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider text-center">
                  Select All
                </th>
                {permissions.map((p) => (
                  <th
                    key={p.id}
                    className="p-4 text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider text-center"
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-custom">
              {filteredModules.map((m) => {
                const isAllSelected = permissions.every((p) =>
                  (selectedPermissions[m.id] || []).includes(p.id)
                );
                return (
                  <tr key={m.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition">
                    <td className="p-4 font-bold text-gray-800 dark:text-white capitalize">
                      {m.display_name}
                    </td>
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={(e) => handleSelectAllRowChange(m.id, e.target.checked)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-4 h-4 cursor-pointer"
                      />
                    </td>
                    {permissions.map((p) => {
                      const isChecked = (selectedPermissions[m.id] || []).includes(p.id);
                      return (
                        <td key={p.id} className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleCheckboxChange(m.id, p.id, e.target.checked)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-4 h-4 cursor-pointer"
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {filteredModules.length === 0 && (
                <tr>
                  <td colSpan={permissions.length + 2} className="p-8 text-center text-custom-muted">
                    No Modules Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <LoadingButton
          variant="secondary"
          onClick={() => router.push('/roles')}
          disabled={saving}
          className="px-6 py-2.5"
        >
          Cancel
        </LoadingButton>
        <LoadingButton
          variant="primary"
          onClick={handleSave}
          isLoading={saving}
          className="px-6 py-2.5"
        >
          Save Changes
        </LoadingButton>
      </div>
    </div>
  );
}
