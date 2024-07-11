export const addUniqueToSet = (
	set: Set<number | string>,
	value: number | string
) => {
	if (value) set.add(value);
};
