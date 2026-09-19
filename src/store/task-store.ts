import { create } from 'zustand'
import { move } from '@dnd-kit/helpers'

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
    updateProjectColor: (projectId: string, color: string) => void
    updateProjectName: (projectId: string, name: string) => void
    deleteProject: (projectId: string) => void

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

    addProject: (name) => set((state) => ({
        projects: [
            ...state.projects,
            {
                id: crypto.randomUUID(),
                name,
                color: '#ef4444',
                tasks: [],
            },
        ],
    })),
    
    addTask: (projectId, task) => set((state) => ({
        projects: state.projects.map((project) => 
            project.id === projectId
                ? {
                    ...project,
                    tasks: [
                        ...project.tasks,
                        {
                            id: crypto.randomUUID(),
                            name: task.name,
                            description: task.description,
                        },
                    ],
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

        const sourceProject = state.projects.find(
            (project) => project.id === sourceProjectId,
        )
        if (!sourceProject) return state

        const task = sourceProject.tasks.find(
            (task) => task.id === source.id,
        )
        if (!task) return state

        return {
            projects: state.projects.map((project) => {
                if ((project.id === sourceProjectId)) {
                    return {
                        ...project,
                        tasks: project.tasks.filter(
                            (task) => task.id !== source.id,
                        ),
                    }
                }
                if (project.id === targetProjectId) {
                    return {
                        ...project,
                        tasks: [
                            ...project.tasks,
                            task,
                        ],
                    }
                }
                return project
            })
        }
    }),
}))