import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import type { Profile, Skill, Project, Social } from "@shared/schema";

// Helper to map DB snake_case to app camelCase
const mapProject = (p: any): Project => ({
  id: p.id,
  title: p.title,
  description: p.description,
  techStack: p.tech_stack || [],
  projectUrl: p.project_url,
  repoUrl: p.repo_url,
  imageUrl: p.image_url,
  displayOrder: p.display_order
});

const mapProfile = (p: any): Profile => ({
  id: p.id,
  name: p.name,
  bio: p.bio,
  tagline: p.tagline,
  avatarUrl: p.avatar_url,
  resumeUrl: p.resume_url
});

// === PROFILE ===
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
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return mapProfile(data);
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: any) => {
      // Map back to snake_case
      const dbData = {
        name: data.name,
        bio: data.bio,
        tagline: data.tagline,
        avatar_url: data.avatarUrl,
        resume_url: data.resumeUrl
      };

      // Check if profile exists
      const { count } = await supabase.from("profile").select("*", { count: 'exact', head: true });

      let result;
      if (count === 0) {
        result = await supabase.from("profile").insert(dbData).select().single();
      } else {
        // Assume ID 1 or update any
        // Better to get ID from current profile but for single profile:
        // We'll update the first one found or we need to know the ID.
        // We can just update "all" if we assume 1, but RLS might restrict.
        // Let's use ID from data if present, else ...?
        // Actually, we can fetch, then update.
        // Or upsert?
        // Supabase upsert requires primary key or unique constraint.
        // 'id' is PK.
        // If we don't know ID, we might struggle.
        // But useProfile fetches it.
        // Let's assume we pass ID or use upsert on a known ID if we enforce it.
        // Or simpler: Update where id > 0?
        // Let's try upsert with a hardcoded ID if we want singleton? No.
        // We'll do: Select ID, then update.
        const { data: existing } = await supabase.from("profile").select("id").limit(1).single();
        if (existing) {
          result = await supabase.from("profile").update(dbData).eq("id", existing.id).select().single();
        } else {
          result = await supabase.from("profile").insert(dbData).select().single();
        }
      }

      if (result.error) throw result.error;
      return mapProfile(result.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({ title: "Success", description: "Profile updated successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

// === SKILLS ===
export function useSkills() {
  return useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .order("id");
      if (error) throw error;
      // Skills map 1:1 mostly, need to check Schema
      // Schema: name, category, proficiency, icon. DB: same.
      // visible? Schema has visible? shared/schema.ts: "icon: text" ... 
      // DB has "visible".
      // We process as is, casting to Skill.
      return (data || []) as Skill[];
    },
  });
}

export function useCreateSkill() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: any) => {
      const { data: created, error } = await supabase
        .from("skills")
        .insert(data) // assumes keys match
        .select()
        .single();
      if (error) throw error;
      return created as Skill;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      toast({ title: "Skill added" });
    },
  });
}

export function useUpdateSkill() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & any) => {
      const { data: updated, error } = await supabase
        .from("skills")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return updated as Skill;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      toast({ title: "Skill updated" });
    },
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("skills").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      toast({ title: "Skill deleted" });
    },
  });
}

// === PROJECTS ===
export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data || []).map(mapProject);
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: any) => {
      const dbData = {
        title: data.title,
        description: data.description,
        tech_stack: data.techStack,
        project_url: data.projectUrl,
        repo_url: data.repoUrl,
        image_url: data.imageUrl,
        display_order: data.displayOrder || 0
      };

      const { data: created, error } = await supabase
        .from("projects")
        .insert(dbData)
        .select()
        .single();
      if (error) throw error;
      return mapProject(created);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Project created" });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & any) => {
      const dbData: any = {};
      if (data.title) dbData.title = data.title;
      if (data.description) dbData.description = data.description;
      if (data.techStack) dbData.tech_stack = data.techStack;
      if (data.projectUrl) dbData.project_url = data.projectUrl;
      if (data.repoUrl) dbData.repo_url = data.repoUrl;
      if (data.imageUrl) dbData.image_url = data.imageUrl;
      if (data.displayOrder !== undefined) dbData.display_order = data.displayOrder;

      const { data: updated, error } = await supabase
        .from("projects")
        .update(dbData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return mapProject(updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Project updated" });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Project deleted" });
    },
  });
}

// === SOCIALS ===
export function useSocials() {
  return useQuery({
    queryKey: ["socials"],
    queryFn: async () => {
      const { data, error } = await supabase.from("socials").select("*");
      if (error) throw error;
      return (data || []) as Social[];
    },
  });
}

export function useCreateSocial() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: any) => {
      const { data: created, error } = await supabase
        .from("socials")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return created as Social;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socials"] });
      toast({ title: "Social link created" });
    },
  });
}

export function useUpdateSocial() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & any) => {
      const { data: updated, error } = await supabase
        .from("socials")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return updated as Social;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socials"] });
      toast({ title: "Social link updated" });
    },
  });
}

export function useDeleteSocial() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("socials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socials"] });
      toast({ title: "Social link deleted" });
    },
  });
}
