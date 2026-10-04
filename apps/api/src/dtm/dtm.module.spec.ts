import { selectDtmGateway } from "./dtm.gateway";
import { DtmDisabledAdapter } from "./dtm-disabled.adapter";
import { DtmSimulatorAdapter } from "./dtm-simulator.adapter";

describe("selectDtmGateway", () => {
	it("selects the simulator only when explicitly configured", () => {
		const simulator = {} as DtmSimulatorAdapter;
		const disabled = {} as DtmDisabledAdapter;
		expect(selectDtmGateway("simulator", simulator, disabled)).toBe(simulator);
		expect(selectDtmGateway("disabled", simulator, disabled)).toBe(disabled);
		expect(selectDtmGateway(undefined, simulator, disabled)).toBe(disabled);
	});
});
