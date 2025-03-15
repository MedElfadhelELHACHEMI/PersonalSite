import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tag } from '@/components/ui/tag'

interface SkillCategory {
  title: string
  skills: string[]
}

export function SkillsSection() {
  const skillCategories: SkillCategory[] = [
    {
      title: 'Languages',
      skills: ['JavaScript (ES6)', 'TypeScript', 'HTML5', 'CSS3'],
    },
    {
      title: 'Frameworks & Libraries',
      skills: ['React.js', 'Next.js', 'Redux', 'GraphQL', 'React Query'],
    },
    {
      title: 'Testing & Tools',
      skills: ['Playwright', 'Cypress', 'Webpack', 'Git', 'Figma'],
    },
    {
      title: 'Practices',
      skills: [
        'CI/CD',
        'Agile Methodologies',
        'Design Systems',
        'Performance Optimization',
      ],
    },
    {
      title: 'Languages',
      skills: ['Arabic (Native)', 'French (Fluent)', 'English (Fluent)'],
    },
  ]

  const hobbies = [
    'Cinema (Script writing, Short movies)',
    'Music (Drums, Piano, MBP)',
  ]

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-2xl font-bold">Skills & Interests</h2>
      <Card className="pointer-events-auto">
        <CardContent className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          {skillCategories.map((category, index) => (
            <div key={index}>
              <h3 className="mb-3 text-lg font-semibold">{category.title}</h3>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill) => (
                  <Tag key={skill} variant="outline">
                    {skill}
                  </Tag>
                ))}
              </div>
            </div>
          ))}

          <div>
            <h3 className="mb-3 text-lg font-semibold">Hobbies</h3>
            <div className="flex flex-wrap gap-2">
              {hobbies.map((hobby) => (
                <Tag key={hobby} variant="outline">
                  {hobby}
                </Tag>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
