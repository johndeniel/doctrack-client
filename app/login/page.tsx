import LoginForm from "@/components/login-form"
import { GradientBackgroundEffect } from '@/components/gradient-background';

export default function LoginPage() {
  return (
    <div className="relative flex  w-full  min-h-screen items-center justify-center bg-white bg-dot-black/[0.2] sm:container dark:bg-black dark:bg-dot-white/[0.2]">
      <GradientBackgroundEffect />
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
        <div className="px-8 pt-8 pb-6 text-center">
          <h2 className="mt-5 text-2xl font-medium tracking-tight text-black">Doctrack</h2>
          <p className="mt-2 text-sm text-gray-500">Sign in to continue to your account</p>
        </div>
        <div className="px-8 pb-8 sa">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

