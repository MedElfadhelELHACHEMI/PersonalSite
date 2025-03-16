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
    <Card className="user-select-none pointer-events-auto w-full max-w-3xl bg-slate-100 dark:bg-neutral-800">
      <CardHeader>
        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
          <div>
            <CardTitle className="whitespace-nowrap text-3xl font-bold text-text dark:text-white">
              {profile.name}
            </CardTitle>
            <p className="text-lg font-medium text-text/80 dark:text-gray-300">
              {profile.title}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-base text-text/90 dark:text-gray-300">
          {profile.bio}
        </p>
      </CardContent>
      <CardFooter className="flex flex-row justify-end gap-3 border-t border-border bg-zinc-200 pt-4 dark:border-darkBorder dark:bg-neutral-900">
        <div className="flex flex-row flex-wrap  gap-2">
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
        <div className="flex flex-row gap-3">
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
        </div>
      </CardFooter>
    </Card>
  )
}
