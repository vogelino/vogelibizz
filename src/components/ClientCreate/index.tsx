"use client";

import { useForm } from "react-hook-form";

export default function ClientCreate() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({});

	return (
		<form onSubmit={handleSubmit(console.log)} id={`client-create-form`}>
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
					<span style={{ color: "red" }}>
						{errors?.title?.message as string}
					</span>
				</label>
			</div>
		</form>
	);
}
