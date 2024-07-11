export enum RESPONSE_TYPE {
	SUCCESS = "SUCCESS",
	ERROR = "ERROR",
	INFO = "INFO",
}

export type TResponseCode = {
	code: number;
	message: string;
	type: RESPONSE_TYPE;
	statusCode: number;
};
