import { User } from '../types/index';

// Extending User type for internal use if needed, for now using shared type
export const MOCK_USERS: User[] = [
    {
        id: 'U1',
        name: 'Rafiq Ahmed',
        email: 'rafiq@royalconsortium.com',
        role: 'admin',
        avatar: 'https://i.pravatar.cc/150?u=U1'
    },
    {
        id: 'U2',
        name: 'Abdul Karim',
        email: 'karim@royalconsortium.com',
        role: 'technician',
        avatar: 'https://i.pravatar.cc/150?u=U2'
    },
    {
        id: 'U3',
        name: 'Sumon Khan',
        email: 'sumon@royalconsortium.com',
        role: 'manager',
        avatar: 'https://i.pravatar.cc/150?u=U3'
    }
];

export const MOCK_ROLES = [
    { id: 'admin', name: 'Administrator', permissions: ['all'] },
    { id: 'manager', name: 'Manager', permissions: ['view_dashboard', 'manage_inventory', 'manage_pos'] },
    { id: 'technician', name: 'Technician', permissions: ['view_workshop', 'update_job_card'] },
    { id: 'sales', name: 'Sales Representative', permissions: ['view_pos', 'create_invoice'] }
];
