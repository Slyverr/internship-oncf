-- Roles
INSERT INTO roles (name, description, is_active) VALUES
('ADMIN', 'System administrator with full rights', TRUE),
('CLIENT_REPRESENTATIVE', 'Customer representative', TRUE),
('AGENT_COMMERCIAL', 'Commercial agent', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Permissions
INSERT INTO permissions (name, description, is_active) VALUES
('users:create', 'Create users', TRUE),
('users:read', 'View users', TRUE),
('users:update', 'Update users', TRUE),
('users:delete', 'Delete users', TRUE),
('orders:create', 'Create orders', TRUE),
('orders:read', 'View orders', TRUE),
('orders:update', 'Update orders', TRUE),
('orders:delete', 'Delete orders', TRUE),
('orders:approve', 'Approve orders', TRUE),
('orders:reject', 'Reject orders', TRUE),
('orders:execute', 'Execute orders', TRUE),
('customers:create', 'Create customers', TRUE),
('customers:read', 'View customers', TRUE),
('customers:update', 'Update customers', TRUE),
('customers:delete', 'Delete customers', TRUE),
('claims:create', 'Create claims', TRUE),
('claims:read', 'View claims', TRUE),
('claims:update', 'Update claims', TRUE),
('claims:close', 'Close claims', TRUE),
('claims:delete', 'Delete claims', TRUE),
('tracking:read', 'View wagon/train tracking', TRUE),
('tracking:update', 'Update tracking', TRUE),
('reports:read', 'View reports', TRUE),
('reports:export', 'Export data', TRUE),
('roles:manage', 'Manage roles', TRUE),
('permissions:manage', 'Manage permissions', TRUE),
('logs:read', 'View system logs', TRUE),
('profile:update', 'Update own profile', TRUE),
('archival:manage', 'Trigger manual archival operations', TRUE),
('archival:read', 'View archival execution logs', TRUE),
('programs:create', 'Create forecast programs', TRUE),
('programs:read', 'View forecast programs', TRUE),
('programs:approve', 'Approve forecast programs', TRUE),
('programs:send', 'Send program to DTM', TRUE),
('programs:execute', 'Record daily program executions', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Role permissions
-- ADMIN: all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r CROSS JOIN permissions p
WHERE r.name = 'ADMIN'
ON CONFLICT DO NOTHING;

-- CLIENT_REPRESENTATIVE: limited to own data
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r CROSS JOIN permissions p
WHERE r.name = 'CLIENT_REPRESENTATIVE'
AND p.name IN (
  'orders:create', 'orders:read',
  'claims:create', 'claims:read',
  'tracking:read',
  'profile:update',
  'programs:read'
)
ON CONFLICT DO NOTHING;

-- AGENT_COMMERCIAL: broader but not admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r CROSS JOIN permissions p
WHERE r.name = 'AGENT_COMMERCIAL'
AND p.name IN (
  'orders:create', 'orders:read', 'orders:update', 'orders:execute',
  'customers:read', 'customers:update',
  'claims:read', 'claims:update', 'claims:delete',
  'tracking:read',
  'reports:read',
  'profile:update',
  'programs:create', 'programs:read', 'programs:approve', 'programs:send', 'programs:execute'
)
ON CONFLICT DO NOTHING;

-- Customer types
INSERT INTO customer_types (name, is_active) VALUES
('Industrial', TRUE),
('Commercial', TRUE),
('Agricultural', TRUE),
('Mining', TRUE),
('Petroleum', TRUE),
('Freight Forwarder', TRUE),
('Other', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Goods types
INSERT INTO goods_types (name, is_active) VALUES
('Cereals', TRUE),
('Containers (TC)', TRUE),
('Phosphate', TRUE),
('Hydrocarbons', TRUE),
('Ores', TRUE),
('Chemicals', TRUE),
('Building Materials', TRUE),
('Agricultural Products', TRUE),
('Other', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Attributes
INSERT INTO attributes (name, data_type, is_active) VALUES
('Cereal type', 'string', TRUE),
('Weight', 'decimal', TRUE),
('Container type', 'string', TRUE),
('Origin port', 'string', TRUE),
('Destination port', 'string', TRUE),
('Booking number', 'string', TRUE),
('Shipping company', 'string', TRUE),
('Vessel', 'string', TRUE),
('Importer', 'string', TRUE),
('Cargo', 'string', TRUE),
('Berthing date', 'date', TRUE),
('TC 20 ft', 'boolean', TRUE),
('TC 20 count', 'number', TRUE),
('TC 40 ft', 'boolean', TRUE),
('TC 40 count', 'number', TRUE),
('Vessel name', 'string', TRUE),
('Expeditor customer code', 'string', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Parametrization (required attributes per goods type)
INSERT INTO parametrization (goods_type_id, attribute_id, is_required)
SELECT gt.id, a.id, TRUE
FROM goods_types gt
CROSS JOIN attributes a
WHERE gt.name = 'Cereals'
AND a.name IN ('Cereal type', 'Cargo', 'Berthing date', 'Importer', 'Vessel', 'Vessel name', 'Expeditor customer code')
ON CONFLICT DO NOTHING;

INSERT INTO parametrization (goods_type_id, attribute_id, is_required)
SELECT gt.id, a.id, TRUE
FROM goods_types gt
CROSS JOIN attributes a
WHERE gt.name = 'Containers (TC)'
AND a.name IN ('Container type', 'Origin port', 'Destination port')
ON CONFLICT DO NOTHING;

-- Order status
INSERT INTO order_status (name, is_active) VALUES
('DRAFT', TRUE),
('SUBMITTED', TRUE),
('APPROVED', TRUE),
('REJECTED', TRUE),
('IN_PROGRESS', TRUE),
('PARTIALLY_EXECUTED', TRUE),
('COMPLETED', TRUE),
('CANCELLED', TRUE),
('SENT_TO_DTM', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Program status
INSERT INTO program_status (name, description, is_active) VALUES
('DRAFT', 'Draft - being created', TRUE),
('PENDING_APPROVAL', 'Awaiting approval', TRUE),
('APPROVED', 'Approved', TRUE),
('SENT_TO_DTM', 'Sent to DTM', TRUE),
('CONFIRMED', 'Confirmed by DTM', TRUE),
('IN_PROGRESS', 'In execution', TRUE),
('COMPLETED', 'Completed', TRUE),
('CANCELLED', 'Cancelled', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Claim types
INSERT INTO claim_types (name, is_active) VALUES
('Delivery delay', TRUE),
('Damaged goods', TRUE),
('Incorrect quantity', TRUE),
('Non-compliant quality', TRUE),
('Billing issue', TRUE),
('Documentation problem', TRUE),
('Customer service', TRUE),
('Other', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Claim status
INSERT INTO claim_status (name, is_active) VALUES
('NEW', TRUE),
('IN_PROGRESS', TRUE),
('AWAITING_INFO', TRUE),
('IN_TREATMENT', TRUE),
('RESOLVED', TRUE),
('CLOSED', TRUE),
('REJECTED', TRUE),
('SENT_TO_DTM', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Movement types
INSERT INTO movement_types (name, description, is_active) VALUES
('IMPORT', 'Import of goods into Morocco', TRUE),
('EXPORT', 'Export of goods from Morocco', TRUE),
('EMPTY', 'Empty container movement', TRUE),
('FULL_TRAIN', 'Full train movement', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Pickup location types
INSERT INTO pickup_location_types (name, description, is_active) VALUES
('SIDING', 'Private customer siding', TRUE),
('DOMICILE', 'Customer premises', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Dispatch types
INSERT INTO dispatch_types (name, description, is_active) VALUES
('PORT_DUE', 'Payment on delivery', TRUE),
('PORT_PAID', 'Payment on dispatch', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Rejection reasons
INSERT INTO rejection_reasons (name, is_active) VALUES
('Insufficient capacity', TRUE),
('Incomplete documentation', TRUE),
('Incorrect information', TRUE),
('Unauthorized customer', TRUE),
('Unauthorized goods', TRUE),
('Payment issue', TRUE),
('Operational constraints', TRUE),
('Other', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Notification types
INSERT INTO notification_types (name, description, is_active) VALUES
('PROGRAM_PREVISIONNEL', 'Forecast program notification', TRUE),
('ORDER_STATUS_CHANGE', 'Order status change', TRUE),
('ORDER_APPROVED', 'Order approved', TRUE),
('ORDER_REJECTED', 'Order rejected', TRUE),
('ORDER_ASSIGNED', 'Order assigned', TRUE),
('EXECUTION_COMPLETED', 'Execution completed', TRUE),
('DTM_RESPONSE', 'DTM response', TRUE),
('MATERIAL_AVAILABLE', 'Material available', TRUE),
('CLAIM_CREATED', 'New claim created', TRUE),
('CLAIM_UPDATED', 'Claim updated', TRUE),
('ORDER_CREATED', 'New order created by customer', TRUE),
('ORDER_MODIFIED', 'Order modified by customer', TRUE),
('SUB_ORDER_CREATED', 'Sub-order created by agent for customer', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Notification channels
INSERT INTO notification_channels (name, is_active) VALUES
('EMAIL', TRUE),
('SMS', TRUE),
('IN_APP', TRUE),
('PUSH', TRUE)
ON CONFLICT (name) DO NOTHING;

-- DTM request types
INSERT INTO dtm_request_types (name, description, is_active) VALUES
('SEND_PROGRAM', 'Send forecast program to DTM', TRUE),
('GET_AVAILABILITY', 'Get material availability', TRUE),
('SEND_ORDER', 'Send order to DTM', TRUE),
('GET_TRACKING', 'Get tracking data', TRUE),
('UPDATE_STATUS', 'Update status', TRUE),
('GET_TRAINS', 'Get train information', TRUE),
('GET_WAGONS', 'Get wagon information', TRUE),
('SYNC_DATA', 'Data synchronization', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Accessory operations
INSERT INTO accessory_operations (name, is_active) VALUES
('Weighing', TRUE),
('Wagon push', TRUE),
('Scanning', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Units (active only)
INSERT INTO units (name, is_active) VALUES
('Tonnes', TRUE),
('TC20', TRUE),
('TC40', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Deactivate legacy units (if they exist)
UPDATE units SET is_active = FALSE
WHERE name IN ('Tonne', 'Kilogramme', 'Wagon', 'Conteneur', 'Palette', 'Mètre cube', 'Litre');

-- One default goods per type (for seeding)
INSERT INTO goods (name, goods_type_id, goods_code, is_active)
SELECT CONCAT(gt.name, ' (default)'), gt.id, CONCAT('MRC-', gt.id), TRUE
FROM goods_types gt
WHERE gt.is_active = TRUE
ON CONFLICT (goods_code) DO NOTHING;
