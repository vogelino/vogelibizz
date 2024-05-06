"use client";

import env from "@/env";
import useClientCreate from "@/utility/data/useClientCreate";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function ClientCreate() {
	const router = useRouter()
	const createMutation = useClientCreate()
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({});

	return (
		<form onSubmit={handleSubmit(({ name }) => {
			createMutation.mutate({ name, last_modified: new Date().toISOString() });
			router.push(`${env.client.NEXT_PUBLIC_BASE_URL}/clients`);
		})} id={`client-create-form`}>
			<div className="flex flex-col gap-4">
				<label className="flex flex-col gap-2">
					<span className="text-grayDark">Name</span>
					<input
						type="text"
						{...register("name", {
							required: "This field is required",
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
