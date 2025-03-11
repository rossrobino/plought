import { db } from "@/lib/db";

export const getStudyById = (id: string | number) => {
	return db.query.study.findFirst({
		where: (study, { eq }) => eq(study.id, Number(id)),
	});
};
