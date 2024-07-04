import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { LoginButtons } from '@/components/login-buttons';

export default async function SignInPage({ from }: { from: string }) {
    const session = await auth();
    if (session?.user) {
      redirect(`/${from}` || '/profile');
    }
    return (
      <div className="flex h-[76vh] items-center justify-center py-10">
        <LoginButtons />
      </div>
    );
}
