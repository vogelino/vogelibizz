import { relations } from 'drizzle-orm'
import {
	date,
	doublePrecision,
	pgEnum,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
} from 'drizzle-orm/pg-core'

export type ResourceType = 'projects' | 'clients' | 'expenses'

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
	content: text('content').default(''),
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

export const expenseCategory = pgEnum('expense_category', [
	'Essentials',
	'Home',
	'Domain',
	'Health & Wellbeing',
	'Entertainment',
	'Charity',
	'Present',
	'Services',
	'Hardware',
	'Software',
	'Hobby',
	'Savings',
	'Transport',
	'Travel',
])

export const expenseType = pgEnum('expense_type', ['Personal', 'Freelance'])

export const expenseRate = pgEnum('expense_rate', [
	'Monthly',
	'Daily',
	'Hourly',
	'Weekly',
	'Yearly',
	'Quarterly',
	'Semester',
	'Bi-Weekly',
	'Bi-Monthly',
	'Bi-Yearly',
	'One-time',
])

export const currency = pgEnum('currency', [
	'CLF',
	'CLP',
	'EUR',
	'CHF',
	'USD',
	'JPY',
	'GBP',
	'CNY',
	'AUD',
	'CAD',
	'HKD',
	'SGD',
	'SEK',
	'KRW',
	'NOK',
	'NZD',
	'INR',
	'MXN',
	'TWD',
	'ZAR',
	'BRL',
	'DKK',
	'PLN',
	'THB',
	'ILS',
	'IDR',
	'CZK',
	'AED',
	'TRY',
	'HUF',
	'SAR',
	'PHP',
	'MYR',
	'COP',
	'RUB',
	'RON',
	'PEN',
	'BHD',
	'BGN',
	'ARS',
])

export const expenses = pgTable('expenses', {
	id: serial('id').primaryKey(),
	created_at: timestamp('created_at').defaultNow().notNull(),
	last_modified: timestamp('last_modified').defaultNow().notNull(),
	name: text('name').notNull().unique(),
	category: expenseCategory('category').notNull().default('Software'),
	type: expenseType('type').notNull().default('Personal'),
	rate: expenseRate('rate').notNull().default('Monthly'),
	price: doublePrecision('price').notNull().default(0.0),
	original_currency: currency('original_currency').notNull().default('CLP'),
})

export type ExpenseType = typeof expenses.$inferSelect

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
