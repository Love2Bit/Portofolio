import { motion } from "framer-motion";
import { useProfile, useSkills, useProjects, useSocials } from "@/hooks/use-content";
import { useAuth } from "@/hooks/use-auth";
import type { Project } from "@shared/schema";
import { Github, Linkedin, Mail, Twitter, ExternalLink, Code2, ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import ParticlesBackground from "@/components/ParticlesBackground";
import { useRecordVisit } from "@/hooks/use-analytics";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: profile } = useProfile();
  const { mutate: recordVisit } = useRecordVisit();

  useEffect(() => {
    recordVisit();
  }, [recordVisit]);

  const { data: skills } = useSkills();
  const { data: projects } = useProjects();
  const { data: socials } = useSocials();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const groupedSkills = skills?.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  const getIcon = (iconName: string | null) => {
    if (!iconName) return <ExternalLink className="w-5 h-5" />;

    // Normalize string to match common FontAwesome brand names
    const name = iconName.toLowerCase().replace(/\s+/g, '');

    // Map of common overrides/aliases
    const aliases: Record<string, string> = {
      'email': 'envelope',
      'website': 'globe',
      'c++': 'cplusplus',
      'c#': 'csharp',
      'next.js': 'react',
      'express': 'node-js',
      'internetofthings': 'robot',
      'iot': 'robot',
      'artificialintelligence': 'brain',
      'ai': 'brain',
      'machinelearning': 'brain',
      'ml': 'brain',
      'photography': 'camera',
      'photo': 'camera',
      'cooking': 'utensils',
      'cook': 'utensils',
      'chef': 'utensils',
      'writing': 'pen-nib',
      'writer': 'pen-nib',
      'design': 'palette',
      'art': 'palette',
      'gaming': 'gamepad',
      'game': 'gamepad',
      'music': 'music',
      'video': 'video',
      'film': 'film',
      'editing': 'photo-video',
      'code': 'code',
      'coding': 'code',
      'programming': 'code',
      'dev': 'code',
      'database': 'database',
      'db': 'database',
      'sql': 'database',
      'server': 'server',
      'backend': 'server',
      'cloud': 'cloud',
      'aws': 'cloud',
      'azure': 'cloud',
      'deploy': 'rocket',
      'deployment': 'rocket',
    };

    const faName = aliases[name] || name;

    // Check if it's likely a brand or a solid icon
    // 'envelope', 'robot', 'brain', 'globe' are solid icons
    const solidIcons = [
      'envelope', 'robot', 'brain', 'globe', 'server', 'database', 'cloud',
      'camera', 'utensils', 'pen-nib', 'palette', 'gamepad', 'music',
      'video', 'film', 'photo-video', 'code', 'rocket'
    ];
    const prefix = solidIcons.includes(faName) ? 'fa-solid' : 'fa-brands';

    return <i className={`${prefix} fa-${faName} text-xl`} />;
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Welcome!</h1>
          <p className="text-muted-foreground text-lg">The site is ready, but needs some content.</p>
          <Link href="/login">
            <Button>Go to Admin Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Navigation */}
      <nav
        className={`fixed z-50 transition-all duration-500 ease-in-out flex items-center justify-between px-6 
        ${isScrolled
            ? "top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl h-16 rounded-full border border-white/10 bg-black/60 backdrop-blur-md shadow-2xl shadow-primary/10"
            : "top-0 left-1/2 -translate-x-1/2 w-full h-16 bg-transparent border-transparent"
          }`}
      >
        <div className="w-full h-full flex items-center justify-between">
          <div className="text-xl font-display font-bold gradient-text">
            {profile.name}
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
            <a href="#about" className="hover:text-primary transition-colors">About</a>
            <a href="#skills" className="hover:text-primary transition-colors">Skills</a>
            <a href="#projects" className="hover:text-primary transition-colors">Projects</a>
            <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
          </div>
          {user && (
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden md:flex">Admin</Button>
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="about" className="pt-32 pb-20 px-4 md:pt-48 md:pb-32 relative overflow-hidden">
        <ParticlesBackground />
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-lg font-medium text-accent mb-4">Hello, I'm</h2>
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
              {profile.name}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-lg">
              {profile.tagline}
            </p>
            <p className="text-muted-foreground mb-8 max-w-lg leading-relaxed">
              {profile.bio}
            </p>

            <div className="flex flex-wrap gap-4">
              {socials?.filter(s => s.active).map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-secondary/50 hover:bg-secondary text-foreground transition-all hover:-translate-y-1"
                >
                  {getIcon(social.platform)}
                </a>
              ))}
              {profile.resumeUrl && (
                <Button className="rounded-full gap-2 px-6">
                  <Download className="w-4 h-4" />
                  Download CV
                </Button>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative hidden md:block"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl rounded-full -z-10" />
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-80 h-80 md:w-96 md:h-96 object-cover rounded-2xl rotate-3 hover:rotate-0 transition-all duration-500 shadow-2xl border border-white/10 mx-auto"
              />
            ) : (
              <div className="w-80 h-80 md:w-96 md:h-96 bg-secondary/30 rounded-2xl rotate-3 mx-auto flex items-center justify-center border border-white/5">
                <span className="text-6xl">👋</span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 bg-secondary/5">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Technical Skills</h2>
            <div className="h-1 w-20 bg-primary rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {groupedSkills && Object.entries(groupedSkills).map(([category, items]) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-colors"
              >
                <h3 className="text-xl font-bold mb-6 capitalize flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-accent" />
                  {category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {items.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant="secondary"
                      className="px-3 py-1 text-sm bg-secondary/50 hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {skill.icon ? (
                        <i className={`${skill.icon} text-lg mr-2`} />
                      ) : (
                        <span className="mr-2">{getIcon(skill.name)}</span>
                      )}
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Featured Projects</h2>
            <div className="h-1 w-20 bg-primary rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects?.map((project: Project, index: number) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="aspect-video bg-secondary/30 overflow-hidden relative">
                  {project.imageUrl ? (
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary/50">
                      No Image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-sm">
                    {project.repoUrl && (
                      <a href={project.repoUrl} target="_blank" rel="noreferrer" className="p-3 bg-white rounded-full text-black hover:scale-110 transition-transform">
                        <Github className="w-5 h-5" />
                      </a>
                    )}
                    {project.projectUrl && (
                      <a href={project.projectUrl} target="_blank" rel="noreferrer" className="p-3 bg-white rounded-full text-black hover:scale-110 transition-transform">
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                  <p className="text-muted-foreground mb-4 line-clamp-3 text-sm leading-relaxed">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {project.techStack?.slice(0, 4).map((tech: string) => (
                      <span key={tech} className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground font-mono">
                        {tech}
                      </span>
                    ))}
                    {(project.techStack?.length || 0) > 4 && (
                      <span className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground font-mono">
                        +{(project.techStack?.length || 0) - 4}
                      </span>
                    )}
                  </div>
                </CardContent>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Let's Work Together</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              I'm always interested in new projects and opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!
            </p>
            <a href={`mailto:${socials?.find(s => s.platform === 'email')?.url || ''}`}>
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40">
                Say Hello <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border">
        <p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
      </footer>
    </div>
  );
}
