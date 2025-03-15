import React from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

import { Experience } from '@/lib/types'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tag } from '@/components/ui/tag'

interface TimelineItemProps {
  experience: Experience
  isLast: boolean
}

export function TimelineItem({ experience, isLast }: TimelineItemProps) {
  return (
    <div className="relative flex gap-6 pb-12">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[19px] top-5 h-full w-[2px] bg-gray-600" />
      )}
      
      {/* Timeline dot */}
      <div className="relative mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-600 bg-[rgb(33,33,33)]">
        <div className="h-3 w-3 rounded-full bg-white" />
      </div>
      
      <div className="w-full">
        <Card className="pointer-events-auto flex h-full w-full flex-col bg-[rgb(33,33,33)] text-white">
          <CardHeader>
            <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
              <CardTitle className="text-xl font-bold text-white">{experience.company}</CardTitle>
              <span className="whitespace-nowrap text-sm font-medium text-gray-300">
                {experience.period}
              </span>
            </div>
            <p className="font-medium text-white">{experience.title}</p>
          </CardHeader>
          <CardContent className="flex-grow">
            <CardDescription className="mb-4 text-gray-300">{experience.description}</CardDescription>
            <div className="flex flex-wrap gap-1.5">
              {experience.tags.map((tag) => (
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
              <Link href={experience.link} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} />
                Visit Company
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
