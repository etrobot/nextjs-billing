import { Suspense } from 'react'
import Notes from '@/components/notes'
import { LoginButtons } from '@/components/login-buttons';
import { auth } from '@/auth';

export default async  function Works() {
  const session = await auth()
  if (!session) {
    return (
      <div className="flex h-[76vh] items-center justify-center py-10">
        <LoginButtons/>
      </div>
    )
  }
  const userId = session?.user.id;
  return (
    <Suspense>
      <Notes userId={userId}/>
    </Suspense>
  )
}