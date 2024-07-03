import { Suspense } from "react";
import { Plans } from "@/components/dashboard/billing/plans/plans";
import { Subscriptions } from "@/components/dashboard/billing/subscription/subscriptions";
import { DashboardContent } from "@/components/dashboard/content";
import { PlansSkeleton } from "@/components/dashboard/skeletons/plans";
import { CardSkeleton } from "@/components/dashboard/skeletons/card";
import { auth } from '@/auth'
import { LoginButtons } from "@/components/login-buttons";
import Script from "next/script";

export const dynamic = "force-dynamic";

export  default async function Profile() {
  const session = await auth();
  if(!session?.user) {
    return <div className="flex h-[76vh] items-center justify-center py-10">
    <LoginButtons/>
  </div>
  }
  return (
    <>
    <Script
    src="https://app.lemonsqueezy.com/js/lemon.js"
    strategy="beforeInteractive"
  />

        <DashboardContent>
        <div className="flex w-full mb-5">
          <img src={session?.user.image ?? ""} alt="profile image" width={32} height={32}/>
          <h1 className="text-2xl font-bold ml-3">{session?.user.name}</h1>
        </div>
        <div>
            <Suspense fallback={<CardSkeleton className="h-[106px]" />}>
            <Subscriptions />
            </Suspense>

            <Suspense fallback={<PlansSkeleton />}>
            <Plans />
            </Suspense>
        </div>
        </DashboardContent>
        </>
  )
}
