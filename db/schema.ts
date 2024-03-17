import { relations } from 'drizzle-orm'
import {
	pgTable,
	timestamp,
	serial,
	text,
	pgEnum,
	primaryKey,
	date,
} from 'drizzle-orm/pg-core'

export type ResourceType = 'projects' | 'clients'

export const projectStatusEnum = pgEnum('project_status', [
	'todo',
	'active',
	'paused',
	'done',
	'cancelled',
	'negotiating',
	'waiting_for_feedback',
])

export const projects = pgTable('projects', {
	id: serial('id').primaryKey(),
	name: text('name').notNull().unique(),
	created_at: timestamp('created_at').defaultNow().notNull(),
	last_modified: timestamp('last_modified').defaultNow().notNull(),
	description: text('description'),
	status: projectStatusEnum('status').default('todo').notNull(),
})

export type ProjectType = typeof projects.$inferSelect

export const projectsRelations = relations(projects, ({ many }) => ({
	projectsToClients: many(projectsToClients),
	projectsToInvoices: many(projectsToInvoices),
	projectsToQuotes: many(projectsToQuotes),
}))

export const clients = pgTable('clients', {
	id: serial('id').primaryKey(),
	name: text('name').notNull().unique(),
	created_at: timestamp('created_at').defaultNow().notNull(),
	last_modified: timestamp('last_modified').defaultNow().notNull(),
})

export type ClientType = typeof clients.$inferSelect

export const clientsRelations = relations(clients, ({ many }) => ({
	projectsToClients: many(projectsToClients),
}))

export const projectsToClients = pgTable(
	'projects_to_clients',
	{
		projectId: serial('project_id').references(() => projects.id, {
			onDelete: 'cascade',
		}),
		clientId: serial('client_id').references(() => clients.id, {
			onDelete: 'cascade',
		}),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.projectId, t.clientId] }),
	}),
)

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
)

export const invoices = pgTable('invoices', {
	id: serial('id').primaryKey(),
	created_at: timestamp('created_at').defaultNow().notNull(),
	last_modified: timestamp('last_modified'),
	date: date('date').notNull().defaultNow(),
	name: text('name').notNull().unique(),
})

export const invoicesRelations = relations(invoices, ({ many }) => ({
	projectsToInvoices: many(projectsToInvoices),
}))

export const projectsToInvoices = pgTable(
	'projects_to_invoices',
	{
		projectId: serial('project_id').references(() => projects.id, {
			onDelete: 'cascade',
		}),
		invoiceId: serial('invoice_id').references(() => invoices.id, {
			onDelete: 'cascade',
		}),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.projectId, t.invoiceId] }),
	}),
)

export const projectsToInvoicesRelations = relations(
	projectsToInvoices,
	({ one }) => ({
		project: one(projects, {
			fields: [projectsToInvoices.projectId],
			references: [projects.id],
		}),
		invoice: one(invoices, {
			fields: [projectsToInvoices.invoiceId],
			references: [invoices.id],
		}),
	}),
)

export const quotes = pgTable('quotes', {
	id: serial('id').primaryKey(),
	created_at: timestamp('created_at').defaultNow().notNull(),
	last_modified: timestamp('last_modified').defaultNow().notNull(),
	date: date('date').notNull().defaultNow(),
	name: text('name').notNull().unique(),
})

export const quotesRelations = relations(quotes, ({ many }) => ({
	projectsToQuotes: many(projectsToQuotes),
}))

export const projectsToQuotes = pgTable(
	'projects_to_quotes',
	{
		projectId: serial('project_id').references(() => projects.id, {
			onDelete: 'cascade',
		}),
		quoteId: serial('quote_id').references(() => quotes.id, {
			onDelete: 'cascade',
		}),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.projectId, t.quoteId] }),
	}),
)

export const projectsToQuotesRelations = relations(
	projectsToQuotes,
	({ one }) => ({
		project: one(projects, {
			fields: [projectsToQuotes.projectId],
			references: [projects.id],
		}),
		quote: one(quotes, {
			fields: [projectsToQuotes.quoteId],
			references: [quotes.id],
		}),
	}),
)
