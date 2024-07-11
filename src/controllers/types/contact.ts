export type TContactIdentifyResult = {
	contact: {
		primaryContactId: number;
		emails: string[];
		phoneNumbers: string[];
		secondaryContactIds: number[];
	};
};

export type TContactResultWithSet = {
	contact: {
		primaryContactId: number;
		emails: Set<string>;
		phoneNumbers: Set<string>;
		secondaryContactIds: Set<number>;
	};
};
