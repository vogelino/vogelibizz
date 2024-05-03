import { supabaseClient } from "@/utility/supabase-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";

const ClientZodSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: z.string(),
  last_modified: z.string(),
});

function useClients() {
  const queryKey = ["clients"];
  const { data, isPending, error } = useSuspenseQuery({
    queryKey,
    queryFn: async () => {
      const clientsRes = await supabaseClient.from("clients").select("*");

      if (clientsRes.error) throw new Error(clientsRes.error.message);

      if (clientsRes.status !== 200) throw new Error(clientsRes.statusText);

      const parsedClients = z.array(ClientZodSchema).parse(clientsRes.data);

      return parsedClients;
    },
  });

  return {
    data,
    isPending,
    error,
  };
}

export default useClients;
