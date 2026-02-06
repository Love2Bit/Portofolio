import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Project } from "@shared/schema";

export function useProjects() {
    return useQuery({
        queryKey: ["projects"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("projects")
                .select("*")
                .order("display_order", { ascending: true });

            if (error) throw error;
            // Map Supabase snake_case to camelCase if needed, OR adjust schema types.
            // Supabase returns what is in DB. I created DB cols as snake_case in SQL?
            // SQL: tech_stack, project_url, repo_url, image_url, display_order...
            // Schema.ts: techStack, projectUrl, repoUrl...
            // I need to map it or update types. 
            // Supabase client can return typed data if I generate types, but here manual map.
            return (data || []).map((p: any): Project => ({
                id: p.id,
                title: p.title,
                description: p.description,
                techStack: p.tech_stack || [],
                projectUrl: p.project_url,
                repoUrl: p.repo_url,
                imageUrl: p.image_url,
                displayOrder: p.display_order
            }));
        },
    });
}
