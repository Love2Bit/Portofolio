import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Social } from "@shared/schema";

export function useSocials() {
    return useQuery({
        queryKey: ["socials"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("socials")
                .select("*");

            if (error) throw error;
            return (data || []) as Social[];
        },
    });
}
