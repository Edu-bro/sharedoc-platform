import Image from "next/image"
import { auth } from "@/auth"
import { SignInButton, SignOutButton } from "@/components/auth-buttons"

export default async function Home() {
  const session = await auth()

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-4xl font-bold text-center">Next.js Auth Demo</h1>
          <p className="text-lg text-center text-gray-600 dark:text-gray-400">
            Google OAuth with NextAuth.js v5 & Neon PostgreSQL
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 p-8 border rounded-lg">
          {session ? (
            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <p className="text-lg">Welcome, {session.user?.name}!</p>
                <p className="text-sm text-gray-600">{session.user?.email}</p>
                {session.user?.image && (
                  <Image 
                    src={session.user.image} 
                    alt="Profile" 
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full mx-auto mt-2"
                  />
                )}
              </div>
              <SignOutButton />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="text-lg">Please sign in to continue</p>
              <SignInButton />
            </div>
          )}
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Deploy to Vercel
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Next.js Docs
          </a>
        </div>
      </main>
    </div>
  )
}
