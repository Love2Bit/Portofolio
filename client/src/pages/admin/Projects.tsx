import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema, type InsertProject, type Project } from "@shared/schema";
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from "@/hooks/use-content";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ExternalLink, Github, Loader2 } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { useEffect } from "react";

function TechStackInput({ value, onChange }: { value: string[], onChange: (val: string[]) => void }) {
  const [str, setStr] = useState(value.join(", "));

  // Sync internal string when external value changes (e.g. on load/reset), 
  // but avoid overriding user typing if they are roughly in sync.
  // We'll trust the form reset to trigger a full re-render with new key or we check strict equality?
  // Actually, form.reset() updates 'value'.
  // We need to update 'str' only if 'value' changes significantly and it's NOT just from our own onChange.
  // But since we are controlled, 'value' updates every time we call onChange.
  // So we need to decouple.

  // Strategy: 
  // 1. Keep local string `str`.
  // 2. On change, update `str`, AND parse it to call `onChange`.
  // 3. But don't update `str` from `value` prop unless it's a completely new array reference from outside?
  // React-hook-form fields are stable.
  // Let's use a ref to track if the update came from us.

  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    setStr(value.join(", "));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setStr(newVal);
    isInternalUpdate.current = true;

    // Parse: split by comma or semicolon, trim
    // We keep empty strings? No, filter boolean locally for the array value, 
    // but the string state keeps the text as is.
    const arr = newVal.split(/[,;]/).map(s => s.trim()).filter(Boolean);
    onChange(arr);
  };

  return (
    <Input
      placeholder="React, Node.js, TypeScript"
      value={str}
      onChange={handleChange}
    />
  );
}


export default function AdminProjects() {
  const { data: projects, isLoading } = useProjects();
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<InsertProject>({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      projectUrl: "",
      repoUrl: "",
      techStack: [],
      displayOrder: 0,
    },
  });

  const onSubmit = (data: InsertProject) => {
    if (editingProject) {
      updateMutation.mutate(
        { id: editingProject.id, ...data },
        { onSuccess: () => { setIsDialogOpen(false); resetForm(); } }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => { setIsDialogOpen(false); resetForm(); }
      });
    }
  };

  const resetForm = () => {
    setEditingProject(null);
    form.reset({
      title: "",
      description: "",
      imageUrl: "",
      projectUrl: "",
      repoUrl: "",
      techStack: [],
      displayOrder: 0,
    });
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    form.reset({
      title: project.title,
      description: project.description,
      imageUrl: project.imageUrl || "",
      projectUrl: project.projectUrl || "",
      repoUrl: project.repoUrl || "",
      techStack: project.techStack || [],
      displayOrder: project.displayOrder || 0,
    });
    setIsDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your portfolio showcase.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProject ? "Edit Project" : "Add New Project"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Textarea className="resize-none h-24" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Image</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value || ""}
                          onChange={field.onChange}
                          disabled={createMutation.isPending || updateMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="projectUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Live URL</FormLabel>
                        <FormControl><Input placeholder="https://..." {...field} value={field.value || ''} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="repoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub URL</FormLabel>
                        <FormControl><Input placeholder="https://..." {...field} value={field.value || ''} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="techStack"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tech Stack (Comma/Semicolon separated)</FormLabel>
                      <FormControl>
                        <TechStackInput
                          value={field.value || []}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    editingProject ? "Update Project" : "Create Project"
                  )}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-64 bg-card/50 animate-pulse rounded-xl" />)
        ) : (
          projects?.map((project: Project) => (
            <Card key={project.id} className="group overflow-hidden border-border/50 hover:border-primary/50 transition-colors">
              <div className="aspect-video bg-secondary relative">
                {project.imageUrl && (
                  <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                )}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" onClick={() => handleEdit(project)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => {
                      if (confirm("Are you sure?")) deleteMutation.mutate(project.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2">{project.title}</h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{project.description}</p>
                <div className="flex gap-2">
                  {project.projectUrl && <a href={project.projectUrl} target="_blank" className="text-xs flex items-center gap-1 hover:underline"><ExternalLink className="w-3 h-3" /> Live</a>}
                  {project.repoUrl && <a href={project.repoUrl} target="_blank" className="text-xs flex items-center gap-1 hover:underline"><Github className="w-3 h-3" /> Code</a>}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
