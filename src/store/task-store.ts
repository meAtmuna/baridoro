import { create } from 'zustand'
import { move } from '@dnd-kit/helpers'
import { supabase } from '@/lib/supabase'

export type Project = {
    id: string
    name: string
    color: string
    tasks: Task[]
}
export type Task = {
    id: string
    name: string
    description: string
    date: string
    completed: boolean
}

type TaskStore = {
    projects: Project[]
    setProjects: (projects: Project[]) => void
    fetchProjects:() => void
    addProject: (name: string) => void
    updateProjectColor: (projectId: string, color: string) => void
    updateProjectName: (projectId: string, name: string) => void
    deleteProject: (projectId: string) => void

    addTask: (
        projectId: string,
        task: {
            name: string
            description: string
            date: string
        },
    ) => void
    toggleTask: (projectId: string, taskId: string) => void 
    deleteTask: (projectId: string, taskId: string) => void 

    
    reorderProjects: (event: any) => void
    reorderTasks: (event: any) => void
}

export const useTaskStore = create<TaskStore>((set,get) => ({
    projects: [], 
    setProjects: (projects) => set({ projects }),

    addProject: async (name) => {
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        const {data,error} = await supabase.from("projects").insert([{name,color:randomColor}]).select().single();

        if(error) {
            console.error("Error adding project:",error);
            return;
        }
        if(data){
            set((state) => ({
                projects: [
                    ...state.projects,
                    {
                        ...data,
                        tasks: [],
                    },
                ],
            }))
        }
    },
    
    // addProject: (name) => set((state) => ({
    //     projects: [
    //         ...state.projects,
    //         {
    //             id: crypto.randomUUID(),
    //             name,
    //             color: '#ef4444',
    //             tasks: [],
    //         },
    //     ],
    // })),

    addTask: async (projectId, task) => { 
        const {data,error} = await supabase.from("tasks").insert([{project_id:projectId,name:task.name,description:task.description}]).select().single();

        if(error){
            console.error("Error adding task:",error);
            return;
        }

        if(data){
            set((state) => ({
                projects: state.projects.map((project) => 
                    project.id === projectId
                        ? {...project,tasks: [...project.tasks,data],} 
                        : project,
                ),
            }))
        }
    },
    
    // addTask: (projectId, task) => set((state) => ({
    //     projects: state.projects.map((project) => 
    //         project.id === projectId
    //             ? {
    //                 ...project,
    //                 tasks: [
    //                     ...project.tasks,
    //                     {
    //                         id: crypto.randomUUID(),
    //                         name: task.name,
    //                         description: task.description,
    //                         date: task.date,
    //                         completed: false,
    //                     },
    //                 ],
    //             } 
    //             : project,
    //     ),
    // })),

    fetchProjects: async () => {
        const {data,error} = await supabase.from("projects").select("*, tasks(*)");
        if(error) {
            console.error("Error fetching projects:", error);
            return;
        }
        if(data) set({projects: data});
    },

    toggleTask: async (projectId, taskId) => {
        const project = get().projects.find((p) => p.id === projectId);
        const task = project?.tasks.find((t) => t.id === taskId);

        if(!task) return;

        const nextStatus = !task.completed;

        const {error} = await supabase.from("tasks").update({completed:nextStatus}).eq("id",taskId);

        if(error){
            console.error("Error changing task completed status:",error);
        }
        set((state) => ({
            projects: state.projects.map((project) =>
                project.id === projectId
                    ? {
                        ...project,
                        tasks: project.tasks.map((task) =>
                            task.id === taskId
                                ? { ...task, completed: !task.completed }
                                : task,
                        ),
                    }
                    : project,
            ),
        }))
    },
        

    deleteTask: async (projectId, taskId) => {
        const {error} = await supabase.from("tasks").delete().eq("id",taskId);
        
        if(error) { 
            console.error("Error deleting task:",error);
            return;
        }

        set((state) => ({
            projects: state.projects.map((project) =>
                project.id === projectId
                    ? {
                        ...project,
                        tasks: project.tasks.filter((task) => task.id !== taskId),
                    }
                    : project,
            ),
        }))
    },
        

    updateProjectColor: async (projectId, color) => {
        const {error} = await supabase.from("projects").update({color:color}).eq("id",projectId);

        if(error){
            console.error("Error changing updating project color:",error);
        }

        set((state) => ({
            projects: state.projects.map((project) =>
                project.id === projectId
                    ? {
                        ...project,
                        color,
                    }
                    : project,
            ),
        }))
    },
    

    updateProjectName: async (projectId, name) => {
        const {error} = await supabase.from("projects").update({name:name}).eq("id",projectId);

        if(error){
            console.error("Error changing updating project name:",error);
        }

        set((state) => ({
            projects: state.projects.map((project) =>
                project.id === projectId
                    ? {
                        ...project,
                        name,
                    }
                    : project,
            ),
        }))
    },

    deleteProject: async (projectId) => {
        const {error} = await supabase.from("projects").delete().eq("id",projectId);

        if(error) {
            console.error("Error deleting project",error);
            return;
        }

        set((state) => ({
            projects: state.projects.filter(
                (project) => project.id !== projectId,
            ),
        })) 
    },

    reorderProjects: (event) => set((state) => ({
        projects: move(state.projects, event),
    })),

    reorderTasks: async (event) => {
        const source = event.operation.source;
        const target = event.operation.target;

        if(!source || !target) return;

        const sourceTaskId = source.id;
        const sourceProjectId = source.data?.projectId;

        const targetProjectId = target.data?.projectId || target.id;

        if(!sourceProjectId || !targetProjectId) return;

        set((state) => {
            const record = Object.fromEntries(
                state.projects.map((p) => [p.id, p.tasks]),
            )

            const next = move(record, event)

            return {
                projects: state.projects.map((p) => ({
                    ...p,
                    tasks: next[p.id] ?? p.tasks,
                })),
            }
        })

        if(sourceProjectId !== targetProjectId) {
            const {error} = await supabase.from("tasks").update({project_id: targetProjectId}).eq("id",sourceTaskId);

            if(error) {
                console.error("Error updating tasks project in supabase:",error);
            }
        }
    },
}))