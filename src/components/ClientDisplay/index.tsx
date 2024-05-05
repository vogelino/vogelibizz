"use client";
import useClient from "@/utility/data/useClient";

function ClientDisplay({ id }: { id: string }) {
	const { data, error, isPending } = useClient(+id);

	if (isPending) return <div>Loading...</div>;
	if (error) return <div>{error.message}</div>;
	if (!data) return <div>No project found</div>;

	const { name } = data;

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col">{name}</div>
		</div>
	);
}

export default ClientDisplay;
