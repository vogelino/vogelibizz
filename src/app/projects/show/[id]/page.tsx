"use client";

import { useNavigation, useOne, useResource, useShow } from "@refinedev/core";

export default function ProjectShow() {
  const { edit, list } = useNavigation();
  const { id } = useResource();
  const { queryResult } = useShow({
    meta: {
      select: "*",
    },
  });
  const { data } = queryResult;

  const record = data?.data;

  return (
    <div style={{ padding: "16px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1>{"Show"}</h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => list("projects")}>{"List"}</button>
          <button onClick={() => edit("projects", id ?? "")}>{"Edit"}</button>
        </div>
      </div>
      <div>
        <div style={{ marginTop: "6px" }}>
          <h5>{"ID"}</h5>
          <div>{record?.id ?? ""}</div>
        </div>
        <div style={{ marginTop: "6px" }}>
          <h5>{"Name"}</h5>
          <div>{record?.name}</div>
        </div>
        <div style={{ marginTop: "6px" }}>
          <h5>{"Status"}</h5>
          <div>{record?.status}</div>
        </div>
        <div style={{ marginTop: "6px" }}>
          <h5>{"Created at"}</h5>
          <div>
            {new Date(record?.createdAt).toLocaleString(undefined, {
              timeZone: "UTC",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
