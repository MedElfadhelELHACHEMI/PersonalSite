import { TimelineItem } from '@/components/TimelineItem'
import { EducationItem } from '@/components/EducationItem'
import { experiences } from '@/lib/data'

export const metadata = {
  title: 'Experience',
  description: 'My professional journey and work experience in frontend development.',
}

export default function Experience() {
  const education = [
    {
      institution: 'ESPRIT SCHOOL OF ENGINEERING',
      degree: 'Engineer\'s degree',
      period: 'Sept 2013 - Sept 2018',
      location: 'Tunis, Tunisia',
    }
  ];

  return (
    <main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl">
        <section>
          <h1 className="mb-8 text-3xl font-bold">Experience</h1>
          
          <div className="pointer-events-auto ml-4">
            {experiences.map((experience, index) => (
              <TimelineItem 
                key={experience.id} 
                experience={experience} 
                isLast={index === experiences.length - 1} 
              />
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="mb-8 text-2xl font-bold">Education</h2>
          
          <div className="pointer-events-auto ml-4">
            {education.map((edu, index) => (
              <EducationItem 
                key={index}
                institution={edu.institution}
                degree={edu.degree}
                period={edu.period}
                location={edu.location}
                isLast={true}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
