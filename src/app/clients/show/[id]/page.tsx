import FormPageLayout from '@components/FormPageLayout'
import ClientDisplay from '@components/ClientDisplay'
import { Button } from '@components/ui/button'
import { PencilIcon } from 'lucide-react'
import Link from 'next/link'

export default function ClientShow({
	params: { id },
}: {
	params: { id: string }
}) {
	return (
		<FormPageLayout
			id={id}
			title="Client details"
			allLink="/clients"
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link href={`/clients`}>
							<span>{'Cancel'}</span>
						</Link>
					</Button>
					{id && (
						<Button asChild>
							<Link href={`/clients/edit/${id}`}>
								<PencilIcon />
								{'Edit client'}
							</Link>
						</Button>
					)}
				</>
			}
		>
			<ClientDisplay id={id} />
		</FormPageLayout>
	)
}
