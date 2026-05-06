// Local-only Projects: groups for conversations, persisted in localStorage.
// No backend dependency — maps conversation UUIDs to a user-defined project.

const PROJECTS_KEY = "nexagen.projects.v1";
const ASSIGN_KEY = "nexagen.projectAssignments.v1";

export interface Project {
  id: string;
  name: string;
  createdAt: string;
}

type Assignments = Record<string, string>; // conversationUuid -> projectId

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getProjects(): Project[] {
  return read<Project[]>(PROJECTS_KEY, []);
}

export function createProject(name: string): Project {
  const project: Project = {
    id: crypto.randomUUID(),
    name: name.trim() || "Untitled",
    createdAt: new Date().toISOString(),
  };
  const list = getProjects();
  list.unshift(project);
  write(PROJECTS_KEY, list);
  return project;
}

export function renameProject(id: string, name: string) {
  const list = getProjects().map((p) => (p.id === id ? { ...p, name: name.trim() || p.name } : p));
  write(PROJECTS_KEY, list);
}

export function deleteProject(id: string) {
  write(PROJECTS_KEY, getProjects().filter((p) => p.id !== id));
  const a = getAssignments();
  for (const k of Object.keys(a)) if (a[k] === id) delete a[k];
  write(ASSIGN_KEY, a);
}

export function getAssignments(): Assignments {
  return read<Assignments>(ASSIGN_KEY, {});
}

export function assignConversation(conversationUuid: string, projectId: string | null) {
  const a = getAssignments();
  if (projectId) a[conversationUuid] = projectId;
  else delete a[conversationUuid];
  write(ASSIGN_KEY, a);
}
