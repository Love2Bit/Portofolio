import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@shared/schema";

export function useProfile() {
    return useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("profile")
                .select("*")
                .limit(1)
                .single();

            if (error) {
                // If not found (200 but empty data or 406), return default or throw
                if (error.code === 'PGRST116') return null; // JSON object not found
                throw error;
            }

            // Map keys
            return {
                id: data.id,
                name: data.name,
                bio: data.bio,
                tagline: data.tagline,
                avatarUrl: data.avatar_url,
                resumeUrl: data.resume_url
            } as Profile;
        },
    });
}
