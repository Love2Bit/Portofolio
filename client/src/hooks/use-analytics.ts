import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useRecordVisit() {
    return useMutation({
        mutationFn: async () => {
            // Simple check to prevent double counting in dev (optional, strict mode double invokes)
            const lastVisit = sessionStorage.getItem("last_visit");
            if (lastVisit && Date.now() - parseInt(lastVisit) < 1000 * 60 * 5) {
                return; // Ignore if visited in last 5 mins
            }

            const { error } = await supabase
                .from("site_visits")
                .insert({});

            if (error) throw error;

            sessionStorage.setItem("last_visit", Date.now().toString());
        },
    });
}

interface StatComparison {
    current: number;
    lastMonth: number;
    growth: number;
}

export function useAnalytics() {
    return useQuery({
        queryKey: ["analytics"],
        queryFn: async () => {
            const now = new Date();
            const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

            // Helper to get count before a date
            const getCount = async (table: string, beforeDate?: string) => {
                let query = supabase.from(table).select("*", { count: "exact", head: true });
                if (beforeDate) {
                    query = query.lt("created_at", beforeDate);
                }
                const { count, error } = await query;
                if (error) throw error;
                return count || 0;
            };

            // For site_visits, the column is visited_at
            const getVisitCount = async (beforeDate?: string) => {
                let query = supabase.from("site_visits").select("*", { count: "exact", head: true });
                if (beforeDate) {
                    query = query.lt("visited_at", beforeDate);
                }
                const { count, error } = await query;
                if (error) throw error;
                return count || 0;
            };

            const [
                projectsTotal, projectsLastMonth,
                skillsTotal, skillsLastMonth,
                visitsTotal, visitsLastMonth
            ] = await Promise.all([
                getCount("projects"), getCount("projects", firstDayCurrentMonth),
                getCount("skills"), getCount("skills", firstDayCurrentMonth),
                getVisitCount(), getVisitCount(firstDayCurrentMonth)
            ]);

            const calculateGrowth = (current: number, previous: number) => {
                if (previous === 0) return current > 0 ? 100 : 0;
                return Math.round(((current - previous) / previous) * 100);
            };

            return {
                projects: {
                    current: projectsTotal,
                    lastMonth: projectsLastMonth,
                    growth: calculateGrowth(projectsTotal, projectsLastMonth)
                },
                skills: {
                    current: skillsTotal,
                    lastMonth: skillsLastMonth,
                    growth: calculateGrowth(skillsTotal, skillsLastMonth)
                },
                visits: {
                    current: visitsTotal,
                    lastMonth: visitsLastMonth,
                    growth: calculateGrowth(visitsTotal, visitsLastMonth)
                }
            };
        }
    });
}
