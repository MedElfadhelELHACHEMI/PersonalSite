import React from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

import { Project } from '@/lib/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tag } from '@/components/ui/tag'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  // Map project types to display values with appropriate styling
  const typeColors = {
    personal: 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-white',
    work: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-white',
    'open source':
      'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-white',
  } as const

  return (
    <Card className="user-select-none pointer-events-auto flex h-full flex-col bg-stone-50 text-text dark:bg-neutral-800 dark:text-white">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl font-bold text-text dark:text-white">
            {project.title}
          </CardTitle>
          <div
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[project.type]}`}
          >
            {project.type}
          </div>
        </div>
      </CardHeader>
      <CardContent className="user-select-none flex-grow">
        <CardDescription className="mb-4 text-text/80 dark:text-gray-300">
          {project.description}
        </CardDescription>
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <Tag
              key={tag}
              variant="outline"
              className="border-border text-text/80 dark:border-darkBorder dark:text-gray-300"
            >
              {tag}
            </Tag>
          ))}
        </div>
      </CardContent>
      <CardFooter className="interactive-element border-t border-border bg-zinc-200 pt-4 dark:border-darkBorder dark:bg-neutral-900">
        <Button variant="default" className="ml-auto" asChild>
          <Link
            className="footer-link interactive-element"
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={16} />
            Learn More
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
