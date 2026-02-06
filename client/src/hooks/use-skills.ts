import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Skill } from "@shared/schema";

export function useSkills() {
    return useQuery({
        queryKey: ["skills"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("skills")
                .select("*")
                .order("id");

            if (error) throw error;
            return (data || []) as Skill[];
        },
    });
}
