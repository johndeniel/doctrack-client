import LoginForm from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="relative flex w-full min-h-screen items-center justify-center">
      <div className="w-full max-w-md overflow-hidden rounded-xl border 
        bg-white dark:bg-black 
        border-gray-200 dark:border-white/10
        shadow-md dark:shadow-xl
        transition-all duration-300 ease-in-out"
      >
        <div className="px-8 pt-8 pb-6 text-center">
          <h2 className="mt-5 text-2xl font-medium tracking-tight 
            text-black dark:text-white
            transition-colors duration-300"
          >
            Doctrack
          </h2>
          <p className="mt-2 text-sm 
            text-black/70 dark:text-white/70
            transition-colors duration-300"
          >
            Sign in to continue to your account
          </p>
        </div>
        <div className="px-8 pb-8">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}