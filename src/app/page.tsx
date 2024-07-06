import { Suspense } from 'react'
import Notes from '@/components/notes'

export default async  function Home() {
  return (
    <>
      <h1 className='pb-2 title w-full text-center font-extrabold text-4xl  lg:text-6xl tracking-tight text-center mx-auto'>
      Batch Reply with AI<br />
      </h1>
    <Suspense>
      <Notes />
    </Suspense>
    </>
  )
}