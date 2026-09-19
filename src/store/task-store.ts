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
}

type TaskStore = {
    projects: Project[]
    addProject: (name: string) => void

    addTask: (
        projectId: string,
        task: {
            name: string
            description: string
        },
    ) => void

    reorderProjects: (event: any) => void
    reorderTasks: (event: any) => void
}

export const useTaskStore = create<TaskStore>((set) => ({
    projects: [], 

    fetchProjects: async () => {
        const {data,error} = await supabase.from("projects").select("*, tasks(*)");
        if(error) {
            console.error("Error fetching projects:", error);
            return;
        }
        if(data) set({projects: data});
    },

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

    reorderProjects: (event) => set((state) => ({
        projects: move(state.projects, event),
    })),

    reorderTasks: (event) => set((state) => {
        const source = event.operation.source
        const target = event.operation.target

        if (!source || !target) return state 
        
        const sourceProjectId = source.data?.projectId
        const targetProjectId = target.data?.projectId

        if (!sourceProjectId || !targetProjectId) return state

        if (sourceProjectId === targetProjectId) {
            return {
                projects: state.projects.map((project) => 
                    project.id === sourceProjectId
                        ? {
                            ...project,
                            tasks: move(project.tasks, event)
                        }
                        :project,
                ),
            }
        }

        return state
    }),
}))