import { RESPONSE_TYPE } from "../../types/global.types";

export const CONTACT_E_0001 = {
	code: "CONTACT_E_0001",
	message: "Error occured while identifyng the contact",
	type: RESPONSE_TYPE.ERROR,
	statusCode: 500,
};

export const CONTACT_S_0001 = {
	code: "CONTACT_S_0001",
	message: "Contact identified successfully",
	type: RESPONSE_TYPE.SUCCESS,
	statusCode: 200,
};

export const CONTACT_S_0002 = {
	code: "CONTACT_S_0002",
	message: "Primary contact has been added successfully",
	type: RESPONSE_TYPE.SUCCESS,
	statusCode: 200,
};
