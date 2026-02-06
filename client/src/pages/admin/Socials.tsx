import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSocialSchema, type InsertSocial, type Social } from "@shared/schema";
import { useSocials, useCreateSocial, useUpdateSocial, useDeleteSocial } from "@/hooks/use-content";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Loader2, Github, Linkedin, Twitter, Mail, Globe } from "lucide-react";

export default function AdminSocials() {
  const { data: socials, isLoading } = useSocials();
  const createMutation = useCreateSocial();
  const updateMutation = useUpdateSocial();
  const deleteMutation = useDeleteSocial();
  const [editingSocial, setEditingSocial] = useState<Social | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<InsertSocial>({
    resolver: zodResolver(insertSocialSchema),
    defaultValues: {
      platform: "github",
      url: "",
      icon: "",
      active: true,
    },
  });

  const onSubmit = (data: InsertSocial) => {
    if (editingSocial) {
      updateMutation.mutate(
        { id: editingSocial.id, ...data },
        { onSuccess: () => { setIsDialogOpen(false); resetForm(); } }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => { setIsDialogOpen(false); resetForm(); }
      });
    }
  };

  const resetForm = () => {
    setEditingSocial(null);
    form.reset({
      platform: "github",
      url: "",
      icon: "",
      active: true,
    });
  };

  const handleEdit = (social: Social) => {
    setEditingSocial(social);
    form.reset({
      platform: social.platform,
      url: social.url,
      icon: social.icon || "",
      active: social.active || true,
    });
    setIsDialogOpen(true);
  };

  const platforms = ["github", "linkedin", "twitter", "email", "website"];

  const getIcon = (platform: string) => {
    switch(platform) {
      case 'github': return <Github className="w-5 h-5" />;
      case 'linkedin': return <Linkedin className="w-5 h-5" />;
      case 'twitter': return <Twitter className="w-5 h-5" />;
      case 'email': return <Mail className="w-5 h-5" />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Social Links</h1>
          <p className="text-muted-foreground">Manage your contact information.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Add Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSocial ? "Edit Link" : "Add New Link"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {platforms.map(p => (
                            <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Visible</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Show this link on your portfolio
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value ?? true}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    editingSocial ? "Update Link" : "Add Link"
                  )}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {socials?.map((social) => (
          <Card key={social.id} className="border-border/50">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/50 rounded-full">
                  {getIcon(social.platform)}
                </div>
                <div>
                  <h3 className="font-bold capitalize">{social.platform}</h3>
                  <p className="text-xs text-muted-foreground truncate max-w-[150px]">{social.url}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" onClick={() => handleEdit(social)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => deleteMutation.mutate(social.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
