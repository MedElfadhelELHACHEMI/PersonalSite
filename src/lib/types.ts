// Types for the personal website content

export type ProjectType = 'personal' | 'work' | 'open source'

export interface Project {
  id: string
  title: string
  description: string
  link: string
  tags: string[]
  type: ProjectType
}

export interface Experience {
  id: string
  company: string
  title: string
  period: string
  description: string
  tags: string[]
  link: string
}

export interface Profile {
  name: string
  title: string
  bio: string
  email: string
  calendlyLink: string
}
