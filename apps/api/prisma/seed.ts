import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { 
  DEFAULT_ROLES, 
  DEFAULT_USERS, 
  DEFAULT_PERMISSIONS, 
  DEFAULT_MODULES,
  DEFAULT_ROLE_PERMISSIONS
} from './seed-data';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting full dynamic seeding from seed-data.ts configuration...');

  // 1. Create Roles
  const createdRoles: Record<string, any> = {};
  for (const r of DEFAULT_ROLES) {
    const roleRecord = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: {
        name: r.name,
        is_active: true,
      },
    });
    createdRoles[r.name] = roleRecord;
  }
  console.log('Roles seeded successfully.');

  // 2. Create Permissions
  const permissions: any[] = [];
  for (const p of DEFAULT_PERMISSIONS) {
    const perm = await prisma.permission.upsert({
      where: { name: p.name },
      update: {},
      create: {
        name: p.name,
        code: p.code,
        is_active: true,
      },
    });
    permissions.push(perm);
  }
  console.log('Permissions seeded successfully.');

  // 3. Create Modules
  const modules: any[] = [];
  for (const m of DEFAULT_MODULES) {
    const mod = await prisma.module.upsert({
      where: { name: m.name },
      update: {
        display_name: m.display_name,
        route: m.route,
        icon: m.icon,
        sort_order: m.sort_order,
      },
      create: {
        name: m.name,
        display_name: m.display_name,
        route: m.route,
        icon: m.icon,
        sort_order: m.sort_order,
        is_active: true,
      },
    });
    modules.push(mod);
  }
  
  // Cleanup stale modules
  const defaultModuleNames = DEFAULT_MODULES.map((m) => m.name);
  await prisma.module.deleteMany({
    where: {
      name: { notIn: defaultModuleNames },
    },
  });
  
  console.log('Modules seeded successfully.');

  // 4. Create Default Users
  console.log('Seeding Default Users...');
  for (const u of DEFAULT_USERS) {
    const userRole = createdRoles[u.roleName];
    if (!userRole) {
      console.warn(`Warning: Role "${u.roleName}" not found for user "${u.email}". Skipping user creation.`);
      continue;
    }

    const hashedPassword = await argon2.hash(u.password);
    const userName = u.name || u.email.split('@')[0];
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        role_id: userRole.id,
      },
      create: {
        name: userName,
        email: u.email,
        password: hashedPassword,
        role_id: userRole.id,
        is_active: true,
      },
    });
  }
  console.log('Default Users seeded successfully.');

  // 5. Map Permissions to Roles
  console.log('Mapping permissions to roles from seed-data.ts...');
  for (const mapping of DEFAULT_ROLE_PERMISSIONS) {
    const roleRecord = createdRoles[mapping.roleName];
    if (!roleRecord) {
      console.warn(`Warning: Role "${mapping.roleName}" not found during seeding. Skipping mapping.`);
      continue;
    }

    // Filter modules based on wildcard
    const targetModules = mapping.moduleName === '*'
      ? modules
      : modules.filter((m) => m.name === mapping.moduleName);

    if (targetModules.length === 0) {
      console.warn(`Warning: Module "${mapping.moduleName}" not found during seeding. Skipping mapping.`);
      continue;
    }

    // Resolve permission IDs based on wildcard
    const resolvedPermissionIds = mapping.permissions.includes('*')
      ? permissions.map((p) => p.id)
      : mapping.permissions
          .map((permName) => permissions.find((p) => p.name === permName)?.id)
          .filter((id): id is string => !!id);

    // Apply mappings
    for (const m of targetModules) {
      const rpName = `${mapping.roleName}_${m.name}_mapping`;
      await prisma.rolePermission.upsert({
        where: { name: rpName },
        update: {
          permission_ids: resolvedPermissionIds,
        },
        create: {
          name: rpName,
          role_id: roleRecord.id,
          module_id: m.id,
          permission_ids: resolvedPermissionIds,
        },
      });
    }
  }
  console.log('Seed Mapping complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
