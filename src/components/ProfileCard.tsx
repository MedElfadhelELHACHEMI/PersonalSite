import React from 'react'
import Link from 'next/link'
import { Mail, Calendar, MapPin, Github, Linkedin } from 'lucide-react'

import { Profile } from '@/lib/types'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ProfileCardProps {
  profile: Profile
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <Card className="user-select-none pointer-events-auto w-full max-w-3xl bg-stone-50 dark:bg-[rgb(33,33,33)]">
      <CardHeader>
        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
          <div>
            <CardTitle className="text-2xl font-bold text-text dark:text-white">
              {profile.name}
            </CardTitle>
            <p className="text-lg font-medium text-text/80 dark:text-gray-300">
              {profile.title}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="https://github.com/medelfadhelhachemi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-text/80 hover:text-text dark:text-gray-300 dark:hover:text-white"
            >
              <Github size={16} />
              <span>medelfadhelhachemi</span>
            </Link>
            <Link
              href="https://linkedin.com/in/mohamedelfadhel-elhachemi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-text/80 hover:text-text dark:text-gray-300 dark:hover:text-white"
            >
              <Linkedin size={16} />
              <span>mohamedelfadhel-elhachemi</span>
            </Link>
            <span className="inline-flex items-center gap-1 text-sm text-text/80 dark:text-gray-300">
              <MapPin size={16} />
              <span>Paris, FR</span>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-base text-text/90 dark:text-gray-300">
          {profile.bio}
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-end gap-3 border-t border-border pt-4 dark:border-darkBorder">
        <Button variant="default" asChild>
          <Link href={`mailto:${profile.email}`}>
            <Mail size={16} />
            Email Me
          </Link>
        </Button>
        <Button variant="default" asChild>
          <Link
            href={profile.calendlyLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Calendar size={16} />
            Book a Meeting
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
