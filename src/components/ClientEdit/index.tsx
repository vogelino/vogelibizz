"use client";

import useClient from "@/utility/data/useClient";
import { useForm } from "react-hook-form";

export default function ClientEdit({ id }: { id: string }) {
	const { data } = useClient(+id);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		defaultValues: {
			name: data?.name,
			last_modified: new Date().toISOString(),
		},
	});

	return (
		<form onSubmit={handleSubmit(console.log)} id={`client-edit-form-${id}`}>
			<div className="flex flex-col gap-4">
				<label className="flex flex-col gap-2">
					<span className="text-grayDark">Name</span>
					<input
						type="text"
						{...register("name", {
							required: "This field is required",
						})}
					/>
					<input
						type="hidden"
						{...register("last_modified", {
							required: "This field is required",
						})}
					/>

					{errors?.name?.message}
				</label>
			</div>
		</form>
	);
}
