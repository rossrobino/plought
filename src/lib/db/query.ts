import { db } from "@/lib/db";

export const getStudyById = (id: string | number) => {
	return db.query.study.findFirst({
		where: (study, { eq }) => eq(study.id, Number(id)),
	});
};

export const getStudiesPublic = () => {
	return db.query.study.findMany({
		where: (study, { eq }) => eq(study.public, true),
	});
};

export const getStudiesByUserId = (userId?: number) => {
	if (!userId) return [];

	return db.query.study.findMany({
		where: (study, { eq }) => eq(study.userId, userId),
	});
};
