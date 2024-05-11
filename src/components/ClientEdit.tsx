"use client";

import env from "@/env";
import useClient from "@/utility/data/useClient";
import useClientCreate from "@/utility/data/useClientCreate";
import useClientEdit from "@/utility/data/useClientEdit";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function ClientEdit({
	id,
	formId,
}: { id?: number | undefined; formId: string }) {
	const router = useRouter();
	const { data } = useClient(id);
	const editMutation = useClientEdit();
	const createMutation = useClientCreate();
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
			onSubmit={handleSubmit((values) => {
				const client = { ...values, name: values.name ?? "" };
				if (id) editMutation.mutate({ ...client, id });
				else createMutation.mutate([client]);

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
