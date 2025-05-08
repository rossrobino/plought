import { db } from "@/lib/db";

export const studyById = (id: string | number) => {
	return db.query.study.findFirst({
		where: (study, { eq }) => eq(study.id, Number(id)),
	});
};

export const studiesPublic = () => {
	return db.query.study.findMany({
		where: (study, { eq }) => eq(study.public, true),
	});
};

export const studiesByUserId = (userId?: number) => {
	if (!userId) return [];

	return db.query.study.findMany({
		where: (study, { eq }) => eq(study.userId, userId),
	});
};

export const instrumentsAll = () => {
	return db.query.instrument.findMany();
};
