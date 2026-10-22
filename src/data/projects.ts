// Typed accessors over assets/projects.json (the committed content model).
// One place to read projects so components don't each re-import the raw JSON.
import data from "../../assets/projects.json";

export interface ProjectMetric {
  value: string;
  label: string;
}

export interface Project {
  id: string;
  track: "professional" | "opensource" | "cooking";
  featured?: boolean;
  status: string;
  title: string;
  category: string;
  icon: string;
  github?: string;
  description: string;
  metrics: ProjectMetric[];
  highlights: string[];
  tech: string[];
  tags: string[];
  group?: string;
}

export interface Group {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export const GROUPS = data.groups as Group[];
export const PROJECTS = data.projects as Project[];

export const byId = (id: string): Project | undefined =>
  PROJECTS.find((p) => p.id === id);

export const byIds = (ids: string[]): Project[] =>
  ids.map(byId).filter((p): p is Project => Boolean(p));

export const byTrack = (track: Project["track"]): Project[] =>
  PROJECTS.filter((p) => p.track === track);

export const groupLabel = (id?: string): string =>
  GROUPS.find((g) => g.id === id)?.label ?? "Lab";
