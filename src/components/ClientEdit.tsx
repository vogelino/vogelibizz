"use client";

import env from "@/env";
import useClient from "@/utility/data/useClient";
import useClientEdit from "@/utility/data/useClientEdit";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function ClientEdit({
	id,
	formId,
}: { id: number; formId: string }) {
	const router = useRouter();
	const { data } = useClient(id);
	const editMutation = useClientEdit();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		defaultValues: {
			name: data?.name,
		},
	});

	return (
		<form
			onSubmit={handleSubmit((client) => {
				editMutation.mutate({
					id,
					name: client.name ?? "",
				});
				router.push(`${env.client.NEXT_PUBLIC_BASE_URL}/clients`);
			})}
			id={formId}
		>
			<div className="flex flex-col gap-4">
				<label className="flex flex-col gap-2">
					<span className="text-grayDark">Name</span>
					<input
						type="text"
						{...register("name", {
							required: "This field is required",
						})}
						defaultValue={data?.name}
					/>
					{typeof errors.name?.message === "string" && errors.name.message}
				</label>
			</div>
		</form>
	);
}
