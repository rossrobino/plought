import * as table from "@/lib/db/table";
import {
	createInsertSchema,
	createUpdateSchema,
	createSelectSchema,
} from "drizzle-zod";

export const user = {
	Insert: createInsertSchema(table.user),
	Update: createUpdateSchema(table.user),
	Select: createSelectSchema(table.user),
};

export const session = {
	Insert: createInsertSchema(table.session),
	Update: createUpdateSchema(table.session),
	Select: createSelectSchema(table.session),
};

export const study = {
	Insert: createInsertSchema(table.study),
	Update: createUpdateSchema(table.study),
	Select: createSelectSchema(table.study),
};

export const instrument = {
	Insert: createInsertSchema(table.instrument),
	Update: createUpdateSchema(table.instrument),
	Select: createSelectSchema(table.instrument),
};

export const studyInstrument = {
	Insert: createInsertSchema(table.studyInstrument),
	Update: createUpdateSchema(table.studyInstrument),
	Select: createSelectSchema(table.studyInstrument),
};

export const response = {
	Insert: createInsertSchema(table.response),
	Update: createUpdateSchema(table.response),
	Select: createSelectSchema(table.response),
};
