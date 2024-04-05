'use client'
import ClientEdit from '@components/ClientEdit'
import PageHeaderTitle from '@components/PageHeaderTitle'
import { Button } from '@components/ui/button'
import { ResponsiveModal } from '@components/ui/responsive-dialog'
import { ClientType } from '@db/schema'
import { useShow } from '@refinedev/core'
import { SaveIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function ClientEditModalRoute({
	params: { id },
}: {
	params: { id: string }
}) {
	const router = useRouter()
	const pathname = usePathname()
	const { queryResult } = useShow({
		resource: 'clients',
		id,
		meta: { select: '*' },
	})
	const record = queryResult.data?.data as ClientType | undefined
	return (
		<ResponsiveModal
			open={pathname === `/clients/edit/${id}`}
			title={<PageHeaderTitle name={record?.name || 'Edit client'} id={id} />}
			description={'Edit Client'}
			onClose={() => router.push('/clients')}
			footer={
				<>
					<Button asChild variant="outline">
						<Link href={`/clients`}>Cancel</Link>
					</Button>
					{id && (
						<Button type="submit" form={`client-edit-form-${id}`}>
							<SaveIcon />
							{'Edit client'}
						</Button>
					)}
				</>
			}
		>
			<ClientEdit id={id} />
		</ResponsiveModal>
	)
}
