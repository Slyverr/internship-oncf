-- Agencies
INSERT INTO agencies (name, city, address, phone, email, is_active) VALUES
('Agency Casa', 'Casablanca', 'Casablanca', '0522000001', 'casa@oncf.ma', TRUE),
('Agency Tanger', 'Tanger', 'Tanger', '0522000002', 'tanger@oncf.ma', TRUE),
('Agency Kenitra', 'Kenitra', 'Kenitra', '0522000003', 'kenitra@oncf.ma', TRUE),
('Agency Nador', 'Nador', 'Nador', '0522000004', 'nador@oncf.ma', TRUE),
('Agency Marrakech', 'Marrakech', 'Marrakech', '0522000005', 'marrakech@oncf.ma', TRUE),
('Agency Fez', 'Fes', 'Fes', '0522000006', 'fez@oncf.ma', TRUE),
('Agency Oujda', 'Oujda', 'Oujda', '0522000007', 'oujda@oncf.ma', TRUE),
('Agency Jorf Lasfar', 'Jorf Lasfar', 'Jorf Lasfar', '0522000008', 'jorflasfar@oncf.ma', TRUE);

-- Sync agencies to stations
INSERT INTO stations (name, city, address, station_code, is_active)
SELECT a.name, a.city, a.address, CONCAT('STN_', a.id), a.is_active
FROM agencies a
WHERE a.name IS NOT NULL AND TRIM(a.name) <> ''
ON CONFLICT (name) DO NOTHING;

-- Ports
INSERT INTO ports (name, type, city, is_active) VALUES
('Casa', 'normal', 'Casablanca', TRUE),
('Jorf Lasfar', 'normal', 'El Jadida', TRUE),
('Mita', 'sec', 'Casablanca', TRUE),
('Port Casa', 'sec', 'Casablanca', TRUE),
('MARRAKECH SIDI GHANEM', 'sec', 'MARRAKECH', TRUE),
('Nador', 'normal', 'Nador', TRUE),
('Safi', 'normal', 'Safi', TRUE),
('Port TM', 'normal', 'Tanger', TRUE),
('FES BENSOUDA', 'sec', 'Fes', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Berths
INSERT INTO berths (port_id, name, is_active)
SELECT p.id, 'Sossipo', TRUE FROM ports p WHERE p.name = 'Casa'
UNION ALL
SELECT p.id, 'Mass', TRUE FROM ports p WHERE p.name = 'Casa'
UNION ALL
SELECT p.id, 'Marsa', TRUE FROM ports p WHERE p.name = 'Casa'
UNION ALL
SELECT p.id, 'Mass', TRUE FROM ports p WHERE p.name = 'Jorf Lasfar'
UNION ALL
SELECT p.id, 'Sossipo', TRUE FROM ports p WHERE p.name = 'Safi'
UNION ALL
SELECT p.id, 'Sossipo', TRUE FROM ports p WHERE p.name = 'Nador';

-- Sidings
INSERT INTO sidings (name, city, is_active) VALUES
('SDM', 'Casablanca', TRUE),
('Ceralog', 'Berrechid', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Customers (no unique constraint on company_name)
INSERT INTO customers (company_name, address, city, phone, email, type_id, customer_code, is_active) VALUES
('Maersk', 'Port de Casablanca', 'Casablanca', '0522080801', 'contact@maersk.com', 1, 'CLI009', TRUE),
('CMA CGM', 'Port de Casablanca', 'Casablanca', '0522080802', 'contact@cma-cgm.com', 1, 'CLI010', TRUE),
('Finalog', 'Zone logistique Zenata', 'Casablanca', '0522080803', 'contact@finalog.ma', 1, 'CLI011', TRUE),
('Somia', 'Zone industrielle Mohammedia', 'Mohammedia', '0522080804', 'contact@somia.ma', 1, 'CLI012', TRUE),
('ALF Maroc', 'Route de Rabat', 'Rabat', '0522080805', 'contact@alfmaroc.ma', 1, 'CLI013', TRUE),
('Ceralog', 'Zone logistique Tanger Med', 'Tanger', '0522080806', 'contact@ceralog.ma', 1, 'CLI014', TRUE);

-- Admin user (password: 'password123')
INSERT INTO users (email, password, last_name, first_name, employee_id, type, role_id, is_active)
SELECT 'admin@oncf.ma', '$2b$10$E2dqNoISzVAup22rRyZ.2u5xzIJsLElJgqLOWnGQV99g0J2K1muTm',
       'Admin', 'System', 'ADMIN001', 'internal', r.id, TRUE
FROM roles r WHERE r.name = 'ADMIN'
ON CONFLICT (email) DO NOTHING;

-- Client representative user (password: 'password123')
INSERT INTO users (email, password, last_name, first_name, employee_id, type, role_id, is_active)
SELECT 'client@oncf.ma', '$2b$10$E2dqNoISzVAup22rRyZ.2u5xzIJsLElJgqLOWnGQV99g0J2K1muTm',
       'Client', 'Representative', 'CLI001', 'external', r.id, TRUE
FROM roles r WHERE r.name = 'CLIENT_REPRESENTATIVE'
ON CONFLICT (email) DO NOTHING;

-- Commercial agent user (password: 'password123')
INSERT INTO users (email, password, last_name, first_name, employee_id, type, role_id, is_active)
SELECT 'agent@oncf.ma', '$2b$10$E2dqNoISzVAup22rRyZ.2u5xzIJsLElJgqLOWnGQV99g0J2K1muTm',
       'Commercial', 'Agent', 'AGT001', 'internal', r.id, TRUE
FROM roles r WHERE r.name = 'AGENT_COMMERCIAL'
ON CONFLICT (email) DO NOTHING;

-- Vessels
INSERT INTO vessels (name) VALUES
('CMA CGM TOPAZ'),
('NAVIOS AZURE'),
('DIANE A'),
('X-PRESS SOUSSE'),
('PANDA 005'),
('VENTO DI GRECALE')
ON CONFLICT (name) DO NOTHING;

-- Importers
INSERT INTO importers (name) VALUES
('ALI MAROC'),
('UMPC'),
('CASA GRAINS'),
('GRADERCO'),
('GROMIC')
ON CONFLICT (name) DO NOTHING;

-- Representatives
INSERT INTO representatives (name) VALUES
('Ahmed El Mansouri'),
('Youssef Benani'),
('Mustapha Chaker'),
('Hassan Jabri'),
('Rachid Alami')
ON CONFLICT (name) DO NOTHING;

-- Shipping companies
INSERT INTO shipping_companies (name) VALUES
('Maersk Line'),
('CMA CGM'),
('MSC'),
('Hapag-Lloyd')
ON CONFLICT (name) DO NOTHING;
