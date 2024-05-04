import { relations } from "drizzle-orm";
import { pgTable, primaryKey, serial } from "drizzle-orm/pg-core";
import { clients } from "./clientsDbSchema";
import { projects } from "./projectsDbSchema";

export const projectsToClients = pgTable(
	"projects_to_clients",
	{
		projectId: serial("project_id").references(() => projects.id, {
			onDelete: "cascade",
		}),
		clientId: serial("client_id").references(() => clients.id, {
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
		}),
		client: one(clients, {
			fields: [projectsToClients.clientId],
			references: [clients.id],
		}),
	}),
);
