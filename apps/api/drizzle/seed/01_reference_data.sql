-- Roles
INSERT INTO roles (name, description, is_active) VALUES
('ADMIN', 'System administrator with full rights', TRUE),
('CLIENT_REPRESENTATIVE', 'Customer representative', TRUE),
('AGENT_COMMERCIAL', 'Commercial agent', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Permissions
INSERT INTO permissions (name, description, is_active) VALUES
('create_user', 'Create users', TRUE),
('view_user', 'View users', TRUE),
('update_user', 'Update users', TRUE),
('delete_user', 'Delete users', TRUE),
('create_order', 'Create orders', TRUE),
('view_order', 'View orders', TRUE),
('update_order', 'Update orders', TRUE),
('delete_order', 'Delete orders', TRUE),
('approve_order', 'Approve orders', TRUE),
('reject_order', 'Reject orders', TRUE),
('execute_order', 'Execute orders', TRUE),
('create_customer', 'Create customers', TRUE),
('view_customer', 'View customers', TRUE),
('update_customer', 'Update customers', TRUE),
('delete_customer', 'Delete customers', TRUE),
('create_claim', 'Create claims', TRUE),
('view_claim', 'View claims', TRUE),
('update_claim', 'Update claims', TRUE),
('close_claim', 'Close claims', TRUE),
('delete_claim', 'Delete claims', TRUE),
('view_tracking', 'View wagon/train tracking', TRUE),
('update_tracking', 'Update tracking', TRUE),
('view_reports', 'View reports', TRUE),
('export_data', 'Export data', TRUE),
('manage_roles', 'Manage roles', TRUE),
('manage_permissions', 'Manage permissions', TRUE),
('view_logs', 'View system logs', TRUE),
('update_profile', 'Update own profile', TRUE),
('MANAGE_ARCHIVAL', 'Trigger manual archival operations', TRUE),
('VIEW_ARCHIVAL_LOGS', 'View archival execution logs', TRUE),
('create_program', 'Create forecast programs', TRUE),
('view_program', 'View forecast programs', TRUE),
('approve_program', 'Approve forecast programs', TRUE),
('send_program_to_dtm', 'Send program to DTM', TRUE),
('record_execution', 'Record daily program executions', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Role permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r CROSS JOIN permissions p
WHERE r.name = 'ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r CROSS JOIN permissions p
WHERE r.name = 'CLIENT_REPRESENTATIVE'
AND p.name IN ('create_order', 'view_order', 'create_claim', 'view_claim', 'view_tracking', 'update_profile', 'view_program')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r CROSS JOIN permissions p
WHERE r.name = 'AGENT_COMMERCIAL'
AND p.name IN ('create_order', 'view_order', 'update_order', 'view_customer', 'update_customer',
               'view_claim', 'view_tracking', 'view_reports', 'update_profile', 'execute_order',
               'update_claim', 'delete_claim', 'create_program', 'view_program', 'approve_program',
               'send_program_to_dtm', 'record_execution')
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
