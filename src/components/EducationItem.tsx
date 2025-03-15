import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface EducationItemProps {
  institution: string;
  degree: string;
  period: string;
  location: string;
  isLast: boolean;
}

export function EducationItem({ 
  institution, 
  degree, 
  period, 
  location, 
  isLast 
}: EducationItemProps) {
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
              <CardTitle className="text-xl font-bold text-white">{institution}</CardTitle>
              <span className="whitespace-nowrap text-sm font-medium text-gray-300">
                {period}
              </span>
            </div>
            <p className="font-medium text-white">{degree}</p>
            <p className="text-sm text-gray-300">{location}</p>
          </CardHeader>
          <CardContent className="flex-grow">
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
