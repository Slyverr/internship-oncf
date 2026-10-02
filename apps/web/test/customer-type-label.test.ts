import assert from "node:assert/strict";
import { createTranslator, DEFAULT_LOCALE } from "../src/i18n";
import { getCustomerTypeLabel } from "../src/lib/customer-type-label";

const t = createTranslator(DEFAULT_LOCALE);

assert.equal(getCustomerTypeLabel("INDUSTRIAL", t), "Industrial");
assert.equal(getCustomerTypeLabel("FREIGHT_FORWARDER", t), "Freight forwarder");
assert.equal(
	getCustomerTypeLabel("LOCAL_CUSTOMER_TYPE", t),
	"Local Customer Type",
);
assert.equal(getCustomerTypeLabel(null, t), undefined);

console.log("Customer type label checks passed.");
