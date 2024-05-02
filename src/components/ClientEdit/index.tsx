"use client";

import { useForm } from "@refinedev/react-hook-form";

export default function ClientEdit({ id }: { id: string }) {
	const {
		refineCore: { onFinish },
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		refineCoreProps: {
			resource: "clients",
			id,
			meta: {
				select: "*",
			},
		},
	});

	return (
		<form onSubmit={handleSubmit(onFinish)} id={`client-edit-form-${id}`}>
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
							setValueAs: () => new Date().toISOString(),
						})}
					/>

					{errors?.title?.message as string}
				</label>
			</div>
		</form>
	);
}
