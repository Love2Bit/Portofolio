import { useAnalytics } from "@/hooks/use-analytics";
import { useProfile } from "@/hooks/use-content";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Briefcase, Eye, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: profile } = useProfile();
  const { data: analytics } = useAnalytics();

  const stats = [
    {
      title: "Total Projects",
      value: analytics?.projects.current || 0,
      growth: analytics?.projects.growth || 0,
      icon: Briefcase,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Skills Listed",
      value: analytics?.skills.current || 0,
      growth: analytics?.skills.growth || 0,
      icon: Code2,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      title: "Profile Views",
      value: analytics?.visits.current || 0,
      growth: analytics?.visits.growth || 0,
      icon: Eye,
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome back to your portfolio control center.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="hover:shadow-lg transition-all duration-300 border-border/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.growth >= 0 ? "+" : ""}{stat.growth}% from last month
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Link href="/admin/projects">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-accent/5 cursor-pointer transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium">Add New Project</p>
                      <p className="text-sm text-muted-foreground">Showcase your latest work</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>

              <Link href="/admin/profile">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-accent/5 cursor-pointer transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-accent/10 text-accent">
                      <Eye className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium">Update Bio</p>
                      <p className="text-sm text-muted-foreground">Keep your profile fresh</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-to-br from-card to-primary/5">
            <CardHeader>
              <CardTitle>Profile Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-border" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-2xl">?</span>
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg">{profile?.name || "Unnamed"}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{profile?.tagline || "No tagline set"}</p>
                </div>
              </div>
              <Link href="/">
                <Button className="w-full" variant="outline">
                  View Live Site <Eye className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
