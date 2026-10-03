export enum ManagedReferenceResource {
	STATIONS = "stations",
	AGENCIES = "agencies",
	PORTS = "ports",
	BERTHS = "berths",
	SIDINGS = "sidings",
	VESSELS = "vessels",
	SHIPPING_COMPANIES = "shippingCompanies",
}

export const MANAGED_REFERENCE_RESOURCES = Object.values(
	ManagedReferenceResource,
);
