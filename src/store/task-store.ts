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

export const useTaskStore = create<TaskStore>((set) => ({
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

    toggleTask: (projectId, taskId) => set((state) => ({
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
    })),

    deleteTask: (projectId, taskId) => set((state) => ({
        projects: state.projects.map((project) =>
            project.id === projectId
                ? {
                    ...project,
                    tasks: project.tasks.filter((task) => task.id !== taskId),
                }
                : project,
        ),
    })),

    updateProjectColor: (projectId, color) => set((state) => ({
        projects: state.projects.map((project) =>
            project.id === projectId
                ? {
                    ...project,
                    color,
                }
                : project,
        ),
    })),

    updateProjectName: (projectId, name) => set((state) => ({
        projects: state.projects.map((project) =>
            project.id === projectId
                ? {
                    ...project,
                    name,
                }
                : project,
        ),
    })),

    deleteProject: (projectId) => set((state) => ({
        projects: state.projects.filter(
            (project) => project.id !== projectId,
        ),
    })),

    reorderProjects: (event) => set((state) => ({
        projects: move(state.projects, event),
    })),

    reorderTasks: (event) => set((state) => {
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
        // const source = event.operation.source
        // const target = event.operation.target

        // if (!source || !target) return state 
        
        // const sourceProjectId = source.data?.projectId
        // const targetProjectId = target.data?.projectId

        // if (!sourceProjectId || !targetProjectId) return state

        // if (sourceProjectId === targetProjectId) {
        //     return {
        //         projects: state.projects.map((project) => 
        //             project.id === sourceProjectId
        //                 ? {
        //                     ...project,
        //                     tasks: move(project.tasks, event)
        //                 }
        //                 :project,
        //         ),
        //     }
        // }

        // const sourceProject = state.projects.find(
        //     (project) => project.id === sourceProjectId,
        // )
        // if (!sourceProject) return state

        // const task = sourceProject.tasks.find(
        //     (task) => task.id === source.id,
        // )
        // if (!task) return state

        // return {
        //     projects: state.projects.map((project) => {
        //         if ((project.id === sourceProjectId)) {
        //             return {
        //                 ...project,
        //                 tasks: project.tasks.filter(
        //                     (task) => task.id !== source.id,
        //                 ),
        //             }
        //         }
        //         if (project.id === targetProjectId) {
        //             return {
        //                 ...project,
        //                 tasks: [
        //                     ...project.tasks,
        //                     task,
        //                 ],
        //             }
        //         }
        //         return project
        //     })
        // }
    }),
}))