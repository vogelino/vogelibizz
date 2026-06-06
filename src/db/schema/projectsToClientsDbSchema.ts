import { relations } from "drizzle-orm";
import { integer, primaryKey, sqliteTable } from "drizzle-orm/sqlite-core";
import { clients } from "./clientsDbSchema";
import { projects } from "./projectsDbSchema";

export const projectsToClients = sqliteTable(
	"projects_to_clients",
	{
		projectId: integer("project_id").references(() => projects.id, {
			onDelete: "cascade",
		}),
		clientId: integer("client_id").references(() => clients.id, {
			onDelete: "cascade",
		}),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.projectId, t.clientId] }),
	}),
);

export const projectsToClientsRelations = relations(
	projectsToClients,
	({ one }) => ({
		project: one(projects, {
			fields: [projectsToClients.projectId],
			references: [projects.id],
			relationName: "projectToClient",
		}),
		client: one(clients, {
			fields: [projectsToClients.clientId],
			references: [clients.id],
			relationName: "clientToProject",
		}),
	}),
);
