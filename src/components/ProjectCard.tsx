import React from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

import { Project } from '@/lib/types'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tag } from '@/components/ui/tag'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  // Map project types to display values with appropriate styling
  const typeColors = {
    'personal': 'bg-blue-700 text-white',
    'work': 'bg-green-700 text-white',
    'open source': 'bg-purple-700 text-white'
  } as const
  
  return (
    <Card className="pointer-events-auto flex h-full flex-col bg-[rgb(33,33,33)] text-white">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl font-bold text-white">{project.title}</CardTitle>
          <div className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[project.type]}`}>
            {project.type}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="mb-4 text-gray-300">{project.description}</CardDescription>
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <Tag key={tag} variant="outline" className="border-gray-500 text-gray-300">
              {tag}
            </Tag>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t border-gray-700 pt-4">
        <Button 
          variant="default" 
          className="ml-auto" 
          asChild
        >
          <Link href={project.link} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={16} />
            Learn More
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
