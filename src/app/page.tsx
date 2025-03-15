import { ProfileCard } from '@/components/ProfileCard'
import { profile } from '@/lib/data'

export const metadata = {
  title: 'Home',
  description: 'Senior frontend developer with expertise in building scalable web applications and modern UI/UX practices.',
}

export default function Home() {
  return (
    <main className="container mx-auto flex min-h-[calc(100vh-80px)] select-none flex-col items-center justify-center p-4 sm:p-8">
      <ProfileCard profile={profile} />
    </main>
  )
}
