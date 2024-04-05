import { Badge } from '@components/ui/badge'

function PageHeaderTitle({
	name = 'Edit expense',
	id,
}: {
	name?: string
	id?: string
}) {
	return (
		<span className="font-special font-light text-3xl antialiased flex items-center gap-4">
			<span>{name}</span>
			{id && (
				<Badge variant="outline" className="font-mono mt-1">
					{id}
				</Badge>
			)}
		</span>
	)
}

export default PageHeaderTitle
