'use client';
import { Suspense } from 'react'
import Notes from '@/components/notes'

export default async  function notes() {
  return (
    <Suspense>
      <Notes />
    </Suspense>
  )
}