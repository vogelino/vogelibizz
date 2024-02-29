import { DevtoolsProvider } from '@providers/devtools'
import { Refine } from '@refinedev/core'
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar'
import routerProvider from '@refinedev/nextjs-router'
import { Metadata } from 'next'
import React, { Suspense } from 'react'

import { authProvider } from '@providers/auth-provider'
import { dataProvider } from '@providers/data-provider'
import '@styles/global.css'
import { cn } from '@utility/classNames'
import { fungis, lobular } from '@utility/fonts'

export const metadata: Metadata = {
	title: 'Vogelibizz',
	description: 'Daily business by vogelino',
	icons: {
		icon: '/favicon.ico',
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html
			lang="en"
			className={cn(lobular.variable, fungis.variable, 'font-sans')}
			data-applied-mode="light"
		>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: `
              function loadUserPrefTheme() {
                const userPref = localStorage.getItem('theme')
                const userPreference =
                  userPref ||
                  (matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light')
                document.documentElement.dataset.appliedMode = userPreference
                userPref && localStorage.setItem('theme', userPreference)
              }
              loadUserPrefTheme()`,
					}}
				></script>
			</head>
			<body>
				<Suspense>
					<RefineKbarProvider>
						<DevtoolsProvider>
							<Refine
								routerProvider={routerProvider}
								authProvider={authProvider}
								dataProvider={dataProvider}
								resources={[
									{
										name: 'projects',
										list: '/projects',
										create: '/projects/create',
										edit: '/projects/edit/:id',
										show: '/projects/show/:id',
										meta: {
											canDelete: true,
										},
									},
									{
										name: 'clients',
										list: '/clients',
										create: '/clients/create',
										edit: '/clients/edit/:id',
										show: '/clients/show/:id',
										meta: {
											canDelete: true,
										},
									},
								]}
								options={{
									syncWithLocation: true,
									warnWhenUnsavedChanges: true,
									useNewQueryKeys: true,
									projectId: 'KAIuDr-qfjUWD-4P0y94',
								}}
							>
								{children}
								<RefineKbar />
							</Refine>
						</DevtoolsProvider>
					</RefineKbarProvider>
				</Suspense>
			</body>
		</html>
	)
}
