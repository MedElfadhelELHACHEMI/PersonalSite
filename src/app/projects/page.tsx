import { ProjectCard } from '@/components/ProjectCard'
import { projects } from '@/lib/data'

export const metadata = {
  title: 'Projects',
  description:
    'Explore my portfolio of projects in web development, from personal creations to open-source contributions.',
}

export default function Projects() {
  return (
    <main className="user-select-none container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold">Projects</h1>

      <div className="pointer-events-auto grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </main>
  )
}
