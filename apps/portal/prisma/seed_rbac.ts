const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { prisma } = require('./src/lib/prisma/client');

async function main() {
  console.log('Seeding Permissions...');
  
  const modules = {
    workshop: ['view', 'create', 'edit', 'delete', 'assign_technician', 'finalize'],
    job_card: ['view', 'create', 'edit', 'request_qc', 'approve_requisition', 'transition'],
    inventory: ['view', 'manage', 'approve_adjustment', 'purchase_order', 'issue', 'return'],
    finance: ['view', 'create_invoice', 'process_payment', 'approve_expense', 'credit_note'],
    qc: ['view', 'review', 'analytics'],
    crm: ['view', 'manage_segments', 'communication'],
    notifications: ['view', 'manage_triggers']
  };

  const resources = {
    workshop: 'workshop',
    job_card: 'job_cards',
    inventory: 'inventory',
    finance: 'finance',
    qc: 'qc_requests',
    crm: 'customers',
    notifications: 'notifications'
  };

  const permissionData = [];
  for (const [mod, actions] of Object.entries(modules)) {
    for (const action of actions) {
      permissionData.push({
        module: mod,
        action: action,
        resource: resources[mod] || mod,
        description: `Can ${action} ${mod}`
      });
    }
  }

  for (const p of permissionData) {
    await prisma.permissions.upsert({
      where: {
        module_action_resource: {
          module: p.module,
          action: p.action,
          resource: p.resource
        }
      },
      update: {},
      create: p
    });
  }

  console.log('Seeding System Roles...');
  const roles = [
    { name: 'super_admin', display_name: 'Super Admin', level: 100 },
    { name: 'dealer_owner', display_name: 'Dealer Owner', level: 90 },
    { name: 'service_manager', display_name: 'Service Manager', level: 80 },
    { name: 'technician', display_name: 'Technician', level: 50 },
    { name: 'accountant', display_name: 'Accountant', level: 70 },
    { name: 'floor_supervisor', display_name: 'Floor Supervisor', level: 75 }
  ];

  for (const r of roles) {
    await prisma.roles.upsert({
      where: { name: r.name },
      update: { display_name: r.display_name, level: r.level },
      create: { ...r, is_system_role: true }
    });
  }

  console.log('Assigning All Permissions to Super Admin...');
  const superAdminRole = await prisma.roles.findUnique({ where: { name: 'super_admin' } });
  const allPermissions = await prisma.permissions.findMany();

  if (superAdminRole) {
    for (const p of allPermissions) {
      await prisma.role_permissions.upsert({
        where: {
          role_id_permission_id: {
            role_id: superAdminRole.id,
            permission_id: p.id
          }
        },
        update: {},
        create: {
          role_id: superAdminRole.id,
          permission_id: p.id
        }
      });
    }
  }

  console.log('RBAC Seeding Completed!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });