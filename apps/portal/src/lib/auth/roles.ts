export const ROLES = {
    SUPER_ADMIN: 'super_admin',

    // Showroom
    SHOWROOM_ADMIN: 'showroom_admin',
    SELL_SHOWROOM_ADMIN: 'sell_showroom_admin',
    SELLS_STUFF: 'sells_stuff',

    // Service
    SERVICE_ADMIN: 'service_admin',
    SELL_SERVICE_ADMIN: 'sell_service_admin',
    SERVICE_STUFF: 'service_stuff',

    // Dealer
    DEALER_OWNER: 'dealer_owner',
    DEALER_MANAGER: 'dealer_manager',
    DEALER_STAFF: 'dealer_staff',
    SUB_DEALER: 'sub_dealer',
    DEALER: 'dealer',

    // General Admin
    SUPPORT: 'support',
    ACCOUNTANT: 'accountant',
    ADMIN: 'admin',

    // Others
    SALES_ADMIN: 'sales_admin',
    CUSTOMER: 'customer'
};

export const ROLE_GROUPS = {
    SHOWROOM: [
        ROLES.SHOWROOM_ADMIN,
        ROLES.SELL_SHOWROOM_ADMIN,
        ROLES.SELLS_STUFF
    ],
    SERVICE: [
        ROLES.SERVICE_ADMIN,
        ROLES.SELL_SERVICE_ADMIN,
        ROLES.SERVICE_STUFF
    ],
    GENERAL_ADMIN: [
        ROLES.SUPPORT,
        ROLES.ACCOUNTANT,
        ROLES.ADMIN
    ],
    DEALER: [
        ROLES.DEALER_OWNER,
        ROLES.DEALER_MANAGER,
        ROLES.DEALER_STAFF,
        ROLES.SUB_DEALER,
        ROLES.DEALER
    ]
};
