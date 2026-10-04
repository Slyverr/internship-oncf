import {
	GoodsType,
	OrderStatus,
	RegistrationStatus,
	Unit,
} from "@ecommand/shared";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import { relations } from "drizzle/relations";
import {
	agencies,
	berths,
	customers,
	goods,
	importers,
	orders,
	orderWagons,
	ports,
	representatives,
	shippingCompanies,
	sidings,
	stations,
	userCustomers,
	users,
	vessels,
	wagons,
	wagonTracking,
} from "drizzle/schema";
import { and, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { generateDocumentNumber } from "../../src/common/utils/document-number";

type TrackingDemoWagon = {
	number: string;
	externalId: string;
	status?: string;
	latitude?: string;
	longitude?: string;
	reportedHoursAgo?: number;
};

type TrackingDemoScenario = {
	remarks: string;
	goodsId: number;
	unitId: string;
	statusId: string;
	daysAgo: number;
	wagons: TrackingDemoWagon[];
};

async function seed() {
	dotenv.config();
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		console.error("DATABASE_URL is required to seed development fixtures");
		process.exitCode = 1;
		return;
	}

	const pool = new Pool({
		connectionString: databaseUrl,
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
		const seededBerthKeys = new Set(
			berthConfigs.flatMap(({ portName, names }) => {
				const port = portMap.find((entry) => entry.name === portName);
				return port ? names.map((name) => `${port.id}:${name}`) : [];
			}),
		);
		const existingBerths = await db
			.select({ id: berths.id, portId: berths.portId, name: berths.name })
			.from(berths)
			.orderBy(berths.id);
		const seenBerths = new Set<string>();
		const duplicateBerthIds: number[] = [];
		for (const berth of existingBerths) {
			const key = `${berth.portId}:${berth.name}`;
			if (!seededBerthKeys.has(key)) continue;
			if (seenBerths.has(key)) duplicateBerthIds.push(berth.id);
			else seenBerths.add(key);
		}
		if (duplicateBerthIds.length) {
			await db.delete(berths).where(inArray(berths.id, duplicateBerthIds));
		}

		for (const { portName, names } of berthConfigs) {
			const port = portMap.find((p) => p.name === portName);
			if (!port) continue;
			for (const name of names) {
				await db
					.insert(berths)
					.values({ portId: port.id, name, isActive: true })
					.onConflictDoNothing({ target: [berths.portId, berths.name] });
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
			{
				companyName: "ECommand Local Signup Test",
				address: "Local development only",
				city: "Casablanca",
				customerCode: "LOCAL-REG-TEST",
				ice: "000000000000000",
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
			const defaultName =
				GoodsType[gt.name as keyof typeof GoodsType] ??
				gt.name.replaceAll("_", " ");
			const legacyDefaultName = `${gt.name} (default)`;
			const legacyCode = `MRC-${gt.id}`;
			const [legacyDefaultGood] = await db
				.select({ id: goods.id })
				.from(goods)
				.where(
					and(eq(goods.goodsTypeId, gt.id), eq(goods.goodsCode, legacyCode)),
				)
				.limit(1);

			if (legacyDefaultGood) {
				await db
					.update(goods)
					.set({ goodsCode: generateDocumentNumber("MRC") })
					.where(eq(goods.id, legacyDefaultGood.id));
			}

			const [existingDefaultGood] = await db
				.select({ id: goods.id })
				.from(goods)
				.where(and(eq(goods.goodsTypeId, gt.id), eq(goods.name, defaultName)))
				.limit(1);

			if (existingDefaultGood) continue;

			const [legacyNamedDefaultGood] = await db
				.select({ id: goods.id })
				.from(goods)
				.where(
					and(eq(goods.goodsTypeId, gt.id), eq(goods.name, legacyDefaultName)),
				)
				.limit(1);

			if (legacyNamedDefaultGood) {
				await db
					.update(goods)
					.set({ name: defaultName })
					.where(
						and(
							eq(goods.id, legacyNamedDefaultGood.id),
							eq(goods.name, legacyDefaultName),
						),
					);
				continue;
			}

			await db
				.insert(goods)
				.values({
					name: defaultName,
					goodsTypeId: gt.id,
					goodsCode: generateDocumentNumber("MRC"),
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
		const clientCustomer = await db.query.customers.findFirst({
			where: { customerCode: "CLI009" },
		});

		if (!clientCustomer) {
			throw new Error("Customer CLI009 is required for the client fixture");
		}

		const usersData = [
			{
				email: "admin@oncf.ma",
				password: hashed,
				lastName: "Admin",
				firstName: "System",
				employeeCode: "EMP-000001",
				type: "internal",
				roleName: "ADMIN",
			},
			{
				email: "client@oncf.ma",
				password: hashed,
				lastName: "Client",
				firstName: "Representative",
				employeeCode: null,
				type: "external",
				roleName: "CLIENT_REPRESENTATIVE",
			},
			{
				email: "agent@oncf.ma",
				password: hashed,
				lastName: "Commercial",
				firstName: "Agent",
				employeeCode: "EMP-000002",
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

			const userValues = {
				email: userData.email,
				password: userData.password,
				lastName: userData.lastName,
				firstName: userData.firstName,
				employeeCode: userData.employeeCode,
				type: userData.type,
				roleId: role.id,
				isActive: true,
				...(userData.roleName === "CLIENT_REPRESENTATIVE" && {
					customerId: clientCustomer.id,
				}),
			};

			await db
				.insert(users)
				.values(userValues)
				.onConflictDoUpdate({
					target: users.email,
					set: {
						password: userData.password,
						lastName: userData.lastName,
						firstName: userData.firstName,
						employeeCode: userData.employeeCode,
						type: userData.type,
						roleId: role.id,
						registrationStatus: RegistrationStatus.APPROVED,
						isActive: true,
						failedLoginAttempts: 0,
						accountLockedUntil: null,
						...(userData.roleName === "CLIENT_REPRESENTATIVE" && {
							customerId: clientCustomer.id,
						}),
					},
				});
		}

		const agent = await db.query.users.findFirst({
			where: { email: "agent@oncf.ma" },
			columns: { id: true },
		});
		const agentCustomers = await db.query.customers.findMany({
			where: { customerCode: { in: ["CLI009", "CLI010"] } },
			columns: { id: true },
		});
		if (agent) {
			for (const customer of agentCustomers) {
				await db
					.insert(userCustomers)
					.values({ userId: agent.id, customerId: customer.id })
					.onConflictDoNothing();
			}
		}

		const client = await db.query.users.findFirst({
			where: { email: "client@oncf.ma" },
			columns: { id: true },
		});
		const [demoGood, demoUnit, inProgressStatus] = await Promise.all([
			db.query.goods.findFirst({ where: { name: GoodsType.CEREALS } }),
			db.query.units.findFirst({
				where: { name: { in: [Unit.TONNES, "TONNES"] } },
			}),
			db.query.orderStatus.findFirst({
				where: { name: OrderStatus.IN_PROGRESS },
			}),
		]);
		if (!client || !demoGood || !demoUnit || !inProgressStatus) {
			throw new Error(
				"Tracking demo requires the seeded client, cereals, tonnes, and IN_PROGRESS status",
			);
		}

		const trackingDemoRemarks =
			"LOCAL DEMO: synthetic wagon assignments and positions for tracking preview; not live GPS data.";
		let demoOrder = await db.query.orders.findFirst({
			where: { remarks: trackingDemoRemarks },
			columns: { id: true },
		});
		if (!demoOrder) {
			const [createdOrder] = await db
				.insert(orders)
				.values({
					goodsId: demoGood.id,
					customerId: clientCustomer.id,
					createdByUserId: client.id,
					statusId: inProgressStatus.id,
					orderNumber: generateDocumentNumber("ORD"),
					quantityDemanded: "20",
					unitId: demoUnit.id,
					orderDate: new Date().toISOString(),
					remarks: trackingDemoRemarks,
				})
				.returning({ id: orders.id });
			demoOrder = createdOrder;
		}

		const demoWagonRows = await db
			.insert(wagons)
			.values([
				{
					externalId: "LOCAL-DEMO-WAGON-001",
					wagonNumber: "DEMO-WGN-001",
					type: "Freight wagon",
					capacity: "10.000",
					isActive: true,
				},
				{
					externalId: "LOCAL-DEMO-WAGON-002",
					wagonNumber: "DEMO-WGN-002",
					type: "Freight wagon",
					capacity: "10.000",
					isActive: true,
				},
			])
			.onConflictDoUpdate({
				target: wagons.wagonNumber,
				set: { isActive: true },
			})
			.returning({ id: wagons.id, wagonNumber: wagons.wagonNumber });
		const existingAssignments = await db.query.orderWagons.findMany({
			where: { orderId: demoOrder.id },
			columns: { wagonId: true },
		});
		for (const [index, wagon] of demoWagonRows.entries()) {
			if (
				!existingAssignments.some(
					(assignment) => assignment.wagonId === wagon.id,
				)
			) {
				await db.insert(orderWagons).values({
					orderId: demoOrder.id,
					wagonId: wagon.id,
					quantityLoaded: "10",
				});
			}

			const existingPosition = await db.query.wagonTracking.findFirst({
				where: { wagonId: wagon.id },
				columns: { id: true },
			});
			if (!existingPosition) {
				await db.insert(wagonTracking).values({
					wagonId: wagon.id,
					latitude: index === 0 ? "34.2610" : "33.5731",
					longitude: index === 0 ? "-6.5802" : "-7.5898",
					status: index === 0 ? "In transit" : "At Casablanca freight yard",
					recordedAt: new Date(
						Date.now() - (1 - index) * 30 * 60_000,
					).toISOString(),
				});
			}
		}

		const [containersGood, containerUnit, approvedStatus] = await Promise.all([
			db.query.goods.findFirst({ where: { name: GoodsType.CONTAINERS_TC } }),
			db.query.units.findFirst({ where: { name: Unit.TC20 } }),
			db.query.orderStatus.findFirst({ where: { name: OrderStatus.APPROVED } }),
		]);
		if (!containersGood || !containerUnit || !approvedStatus) {
			throw new Error(
				"Tracking scenarios require Containers (TC), TC20, and APPROVED reference data",
			);
		}

		const trackingScenarios: TrackingDemoScenario[] = [
			{
				remarks:
					"LOCAL DEMO: containers moving from Tangier; synthetic position sample.",
				goodsId: containersGood.id,
				unitId: containerUnit.id,
				statusId: approvedStatus.id,
				daysAgo: 3,
				wagons: [
					{
						number: "DEMO-WGN-101",
						externalId: "LOCAL-DEMO-WAGON-101",
						status: "At Tangier freight yard",
						latitude: "35.7806",
						longitude: "-5.8136",
						reportedHoursAgo: 3,
					},
					{
						number: "DEMO-WGN-102",
						externalId: "LOCAL-DEMO-WAGON-102",
						status: "In transit",
						latitude: "34.2610",
						longitude: "-6.5802",
						reportedHoursAgo: 1,
					},
				],
			},
			{
				remarks:
					"LOCAL DEMO: long consist for tracking list scroll preview; synthetic positions.",
				goodsId: demoGood.id,
				unitId: demoUnit.id,
				statusId: inProgressStatus.id,
				daysAgo: 7,
				wagons: Array.from({ length: 12 }, (_, index) => ({
					number: `DEMO-WGN-${String(index + 201).padStart(3, "0")}`,
					externalId: `LOCAL-DEMO-WAGON-${String(index + 201).padStart(3, "0")}`,
					status:
						index % 3 === 0
							? "In transit"
							: index % 3 === 1
								? "At Kenitra freight yard"
								: "Awaiting inspection",
					latitude: index % 2 === 0 ? "34.2610" : "33.5731",
					longitude: index % 2 === 0 ? "-6.5802" : "-7.5898",
					reportedHoursAgo: index * 2 + 1,
				})),
			},
			{
				remarks:
					"LOCAL DEMO: assigned wagon without a position report; tracking pending state.",
				goodsId: demoGood.id,
				unitId: demoUnit.id,
				statusId: inProgressStatus.id,
				daysAgo: 12,
				wagons: [
					{
						number: "DEMO-WGN-301",
						externalId: "LOCAL-DEMO-WAGON-301",
					},
				],
			},
		];

		for (const scenario of trackingScenarios) {
			let scenarioOrder = await db.query.orders.findFirst({
				where: { remarks: scenario.remarks },
				columns: { id: true },
			});
			if (!scenarioOrder) {
				const [createdOrder] = await db
					.insert(orders)
					.values({
						goodsId: scenario.goodsId,
						customerId: clientCustomer.id,
						createdByUserId: client.id,
						statusId: scenario.statusId,
						orderNumber: generateDocumentNumber("ORD"),
						quantityDemanded: String(scenario.wagons.length * 10),
						unitId: scenario.unitId,
						orderDate: new Date(
							Date.now() - scenario.daysAgo * 24 * 60 * 60_000,
						).toISOString(),
						remarks: scenario.remarks,
					})
					.returning({ id: orders.id });
				scenarioOrder = createdOrder;
			}

			const scenarioWagons = await db
				.insert(wagons)
				.values(
					scenario.wagons.map((wagon) => ({
						externalId: wagon.externalId,
						wagonNumber: wagon.number,
						type: "Freight wagon",
						capacity: "10.000",
						isActive: true,
					})),
				)
				.onConflictDoUpdate({
					target: wagons.wagonNumber,
					set: { isActive: true },
				})
				.returning({ id: wagons.id, wagonNumber: wagons.wagonNumber });
			const scenarioAssignments = await db.query.orderWagons.findMany({
				where: { orderId: scenarioOrder.id },
				columns: { wagonId: true },
			});

			for (const [index, wagon] of scenarioWagons.entries()) {
				if (
					!scenarioAssignments.some(
						(assignment) => assignment.wagonId === wagon.id,
					)
				) {
					await db.insert(orderWagons).values({
						orderId: scenarioOrder.id,
						wagonId: wagon.id,
						quantityLoaded: "10",
					});
				}

				const wagonScenario = scenario.wagons.find(
					(entry) => entry.number === wagon.wagonNumber,
				);
				if (!wagonScenario?.latitude || !wagonScenario.longitude) continue;

				const existingPosition = await db.query.wagonTracking.findFirst({
					where: { wagonId: wagon.id },
					columns: { id: true },
				});
				if (!existingPosition) {
					await db.insert(wagonTracking).values({
						wagonId: wagon.id,
						latitude: wagonScenario.latitude,
						longitude: wagonScenario.longitude,
						status: wagonScenario.status,
						recordedAt: new Date(
							Date.now() -
								(wagonScenario.reportedHoursAgo ?? index) * 60 * 60_000,
						).toISOString(),
					});
				}
			}
		}

		console.log(
			"Dev fixtures and users seeded successfully (tracking samples are synthetic, not live GPS data)",
		);
	} catch (error) {
		console.error("Error seeding dev fixtures:", error);
		process.exitCode = 1;
	} finally {
		await pool.end();
	}
}

seed();
