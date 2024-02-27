"use client";

import { useNavigation, useSelect } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { statusList } from "@utility/statusUtil";

const RESOURCE_NAME = "projects";

export default function ProjectCreate() {
  const { list } = useNavigation();

  const {
    refineCore: { onFinish },
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({});

  return (
    <div style={{ padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Create</h1>
        <div>
          <button onClick={() => list(RESOURCE_NAME)}>List</button>
        </div>
      </div>
      <form onSubmit={handleSubmit(onFinish)}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <label>
            <span style={{ marginRight: "8px" }}>Name</span>
            <input
              type="text"
              {...register("name", {
                required: "This field is required",
              })}
            />
            <span style={{ color: "red" }}>
              {(errors as any)?.title?.message as string}
            </span>
          </label>
          <label>
            <span style={{ marginRight: "8px" }}>Status</span>
            <select
              defaultValue={"draft"}
              {...register("status", {
                required: "This field is required",
              })}
            >
              {statusList.map(({ label, value }) => (
                <option key={value} value={label}>
                  {label}
                </option>
              ))}
            </select>
            <span style={{ color: "red" }}>
              {(errors as any)?.status?.message as string}
            </span>
          </label>
          <div>
            <input type="submit" value="save" />
          </div>
        </div>
      </form>
    </div>
  );
}
