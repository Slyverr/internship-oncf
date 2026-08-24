import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import { relations } from "drizzle/relations";
import {
	agencies,
	berths,
	customers,
	goods,
	importers,
	ports,
	representatives,
	shippingCompanies,
	sidings,
	stations,
	users,
	vessels,
} from "drizzle/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

async function seed() {
	dotenv.config();

	const pool = new Pool({
		connectionString: process.env.DATABASE_URL,
	});
	const db = drizzle({ client: pool, relations: relations });

	try {
		// Agencies
		const agenciesData = [
			{
				name: "Agency Casa",
				city: "Casablanca",
				address: "Casablanca",
				phone: "0522000001",
				email: "casa@oncf.ma",
			},
			{
				name: "Agency Tanger",
				city: "Tanger",
				address: "Tanger",
				phone: "0522000002",
				email: "tanger@oncf.ma",
			},
			{
				name: "Agency Kenitra",
				city: "Kenitra",
				address: "Kenitra",
				phone: "0522000003",
				email: "kenitra@oncf.ma",
			},
			{
				name: "Agency Nador",
				city: "Nador",
				address: "Nador",
				phone: "0522000004",
				email: "nador@oncf.ma",
			},
			{
				name: "Agency Marrakech",
				city: "Marrakech",
				address: "Marrakech",
				phone: "0522000005",
				email: "marrakech@oncf.ma",
			},
			{
				name: "Agency Fez",
				city: "Fes",
				address: "Fes",
				phone: "0522000006",
				email: "fez@oncf.ma",
			},
			{
				name: "Agency Oujda",
				city: "Oujda",
				address: "Oujda",
				phone: "0522000007",
				email: "oujda@oncf.ma",
			},
			{
				name: "Agency Jorf Lasfar",
				city: "Jorf Lasfar",
				address: "Jorf Lasfar",
				phone: "0522000008",
				email: "jorflasfar@oncf.ma",
			},
		];

		for (const data of agenciesData) {
			await db
				.insert(agencies)
				.values({ ...data, isActive: true })
				.onConflictDoNothing({ target: agencies.name });
		}

		// Sync agencies to stations
		const agencyList = await db.query.agencies.findMany();
		for (const agency of agencyList) {
			await db
				.insert(stations)
				.values({
					name: agency.name,
					city: agency.city,
					address: agency.address,
					stationCode: `STN_${agency.id}`,
					isActive: agency.isActive,
				})
				.onConflictDoNothing({ target: stations.name });
		}

		// Ports
		const portsData = [
			{ name: "Casa", type: "normal", city: "Casablanca" },
			{ name: "Jorf Lasfar", type: "normal", city: "El Jadida" },
			{ name: "Mita", type: "dry", city: "Casablanca" },
			{ name: "Port Casa", type: "dry", city: "Casablanca" },
			{ name: "MARRAKECH SIDI GHANEM", type: "dry", city: "MARRAKECH" },
			{ name: "Nador", type: "normal", city: "Nador" },
			{ name: "Safi", type: "normal", city: "Safi" },
			{ name: "Port TM", type: "normal", city: "Tanger" },
			{ name: "FES BENSOUDA", type: "dry", city: "Fes" },
		];

		for (const data of portsData) {
			await db
				.insert(ports)
				.values({ ...data, isActive: true })
				.onConflictDoNothing({ target: ports.name });
		}

		// Berths
		const portMap = await db.query.ports.findMany();
		const berthConfigs = [
			{ portName: "Casa", names: ["Sossipo", "Mass", "Marsa"] },
			{ portName: "Jorf Lasfar", names: ["Mass"] },
			{ portName: "Safi", names: ["Sossipo"] },
			{ portName: "Nador", names: ["Sossipo"] },
		];

		for (const { portName, names } of berthConfigs) {
			const port = portMap.find((p) => p.name === portName);
			if (!port) continue;
			for (const name of names) {
				await db
					.insert(berths)
					.values({ portId: port.id, name, isActive: true })
					.onConflictDoNothing();
			}
		}

		// Sidings
		const sidingsData = [
			{ name: "SDM", city: "Casablanca" },
			{ name: "Ceralog", city: "Berrechid" },
		];

		for (const data of sidingsData) {
			await db
				.insert(sidings)
				.values({ ...data, isActive: true })
				.onConflictDoNothing({ target: sidings.name });
		}

		// Customers
		const customersData = [
			{
				companyName: "Maersk",
				address: "Port de Casablanca",
				city: "Casablanca",
				phone: "0522080801",
				email: "contact@maersk.com",
				customerCode: "CLI009",
			},
			{
				companyName: "CMA CGM",
				address: "Port de Casablanca",
				city: "Casablanca",
				phone: "0522080802",
				email: "contact@cma-cgm.com",
				customerCode: "CLI010",
			},
			{
				companyName: "Finalog",
				address: "Zone logistique Zenata",
				city: "Casablanca",
				phone: "0522080803",
				email: "contact@finalog.ma",
				customerCode: "CLI011",
			},
			{
				companyName: "Somia",
				address: "Zone industrielle Mohammedia",
				city: "Mohammedia",
				phone: "0522080804",
				email: "contact@somia.ma",
				customerCode: "CLI012",
			},
			{
				companyName: "ALF Maroc",
				address: "Route de Rabat",
				city: "Rabat",
				phone: "0522080805",
				email: "contact@alfmaroc.ma",
				customerCode: "CLI013",
			},
			{
				companyName: "Ceralog",
				address: "Zone logistique Tanger Med",
				city: "Tanger",
				phone: "0522080806",
				email: "contact@ceralog.ma",
				customerCode: "CLI014",
			},
		];

		const customerType = await db.query.customerTypes.findFirst({
			where: { name: "Industrial" },
		});

		for (const data of customersData) {
			await db
				.insert(customers)
				.values({
					...data,
					typeId: customerType?.id || null,
					isActive: true,
				})
				.onConflictDoNothing({ target: customers.customerCode });
		}

		// Default goods per type
		const goodsTypeList = await db.query.goodsTypes.findMany();
		for (const gt of goodsTypeList) {
			await db
				.insert(goods)
				.values({
					name: `${gt.name} (default)`,
					goodsTypeId: gt.id,
					goodsCode: `MRC-${gt.id}`,
					isActive: true,
				})
				.onConflictDoNothing({ target: goods.goodsCode });
		}

		// Vessels
		const vesselsData = [
			"CMA CGM TOPAZ",
			"NAVIOS AZURE",
			"DIANE A",
			"X-PRESS SOUSSE",
			"PANDA 005",
			"VENTO DI GRECALE",
		];

		for (const name of vesselsData) {
			await db
				.insert(vessels)
				.values({ name, isActive: true })
				.onConflictDoNothing({ target: vessels.name });
		}

		// Importers
		const importersData = [
			"ALI MAROC",
			"UMPC",
			"CASA GRAINS",
			"GRADERCO",
			"GROMIC",
		];

		for (const name of importersData) {
			await db
				.insert(importers)
				.values({ name, isActive: true })
				.onConflictDoNothing({ target: importers.name });
		}

		// Representatives
		const repsData = [
			"Ahmed El Mansouri",
			"Youssef Benani",
			"Mustapha Chaker",
			"Hassan Jabri",
			"Rachid Alami",
		];

		for (const name of repsData) {
			await db
				.insert(representatives)
				.values({ name, isActive: true })
				.onConflictDoNothing({ target: representatives.name });
		}

		// Shipping companies
		const shippingData = ["Maersk Line", "CMA CGM", "MSC", "Hapag-Lloyd"];

		for (const name of shippingData) {
			await db
				.insert(shippingCompanies)
				.values({ name, isActive: true })
				.onConflictDoNothing({ target: shippingCompanies.name });
		}

		// Users (admin, client, agent)
		const PASSWORD = "password123";
		const hashed = await bcrypt.hash(PASSWORD, 10);

		const usersData = [
			{
				email: "admin@oncf.ma",
				password: hashed,
				lastName: "Admin",
				firstName: "System",
				employeeId: "ADMIN001",
				type: "internal",
				roleName: "ADMIN",
			},
			{
				email: "client@oncf.ma",
				password: hashed,
				lastName: "Client",
				firstName: "Representative",
				employeeId: "CLI001",
				type: "external",
				roleName: "CLIENT_REPRESENTATIVE",
			},
			{
				email: "agent@oncf.ma",
				password: hashed,
				lastName: "Commercial",
				firstName: "Agent",
				employeeId: "AGT001",
				type: "internal",
				roleName: "AGENT_COMMERCIAL",
			},
		];

		for (const userData of usersData) {
			const role = await db.query.roles.findFirst({
				where: { name: userData.roleName },
			});

			if (!role) {
				console.error(
					`Role ${userData.roleName} not found, skipping user ${userData.email}`,
				);
				continue;
			}

			await db
				.insert(users)
				.values({
					email: userData.email,
					password: userData.password,
					lastName: userData.lastName,
					firstName: userData.firstName,
					employeeId: userData.employeeId,
					type: userData.type,
					roleId: role.id,
					isActive: true,
				})
				.onConflictDoNothing({ target: users.email });
		}

		console.log("Dev fixtures and users seeded successfully");
	} catch (error) {
		console.error("Error seeding dev fixtures:", error);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

seed();
