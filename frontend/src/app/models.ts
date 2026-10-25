export interface Profile {
  name: string; title: string; tagline: string; summary: string; location: string;
  email: string; github: string; linkedin: string; education: string;
  languages: string[]; keywords: string[];
}
export interface Project {
  id: string; title: string; subtitle: string; category: string; period: string;
  summary: string; problem: string; highlights: string[]; stack: string[];
  repoUrl: string; liveUrl: string;
}
export interface Experience { role: string; org: string; period: string; description: string; points: string[]; }
export interface SkillGroup { name: string; items: string[]; }
export interface Portfolio {
  profile: Profile; projects: Project[]; experience: Experience[]; skills: SkillGroup[];
}
export interface ContactRequest { name: string; email: string; message: string; website: string; }
