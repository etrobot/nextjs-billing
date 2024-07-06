import { Suspense } from 'react'
import Notes from '@/components/notes'

export default async  function Works() {
    return (
    <Suspense>
      <Notes userId='x'/>
    </Suspense>
  )
}