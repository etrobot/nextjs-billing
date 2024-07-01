import { Suspense } from 'react'
import Notes from '@/components/notes'

export default async  function Home() {
  return (
    <>
      <h1 className='p-2 title w-full text-center font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-center mx-auto'>
        Daily Post Inspiration<br /> A Helpful Social Media Copilot
      </h1>
    <Suspense>
      <Notes />
    </Suspense>
    </>
  )
}