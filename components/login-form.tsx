"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"

import { loginUserAccount } from "@/server/action/login"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"

const loginSchema = z.object({
  username: z.string().min(8, { message: "Username must be at least 8 characters." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev)

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)

    try {
      await loginUserAccount(data)
      router.push('/');

    } catch (error) {
         // Extract the error message from the Error object
         const errorMessage = error instanceof Error ? error.message : String(error);
         console.error("Error creating account:", errorMessage);
         
         // Parse the error message to extract structured data
         if (error instanceof Error && error.message.includes('HTTP error!')) {
           try {
             // Extract the status, message and details using regex
             const statusMatch = error.message.match(/status: (\d+)/);
             const codeMatch = error.message.match(/code: (\d+)/);
             const messageMatch = error.message.match(/message: ([^,]+)/);
             const detailsMatch = error.message.match(/details: (.+)$/);
             
             const statusCode = statusMatch ? statusMatch[1] : null;
             const code = codeMatch ? codeMatch[1] : null;
             const message = messageMatch ? messageMatch[1] : null;
             const details = detailsMatch ? detailsMatch[1] : null;
             
             console.log('Structured error:', { 
               statusCode, 
               code,
               message, 
               details 
             });
   
             toast.error(message || "Error creating account", {
               action: {
                 label: "Retry",
                 onClick: () => console.log("Retry"),
               },
             });
             
           } catch (parseError) {
             console.error('Failed to parse error details:', parseError);
             toast.error("Error creating account", {
               description: "An unexpected error occurred",
             });
           }
         } else {
           // Handle non-HTTP errors
           toast.error("Error creating account", {
             description: errorMessage,
           });
         }
  
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Username Field */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your username" 
                  {...field} 
                  className="h-12 rounded-lg border-gray-300 dark:border-gray-700 px-4 text-gray-900 dark:text-white dark:bg-gray-800"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password Field with Toggle Visibility */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...field}
                    className="h-12 w-full rounded-lg border-gray-300 dark:border-gray-700 px-4 text-gray-900 dark:text-white dark:bg-gray-800 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={togglePasswordVisibility}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-500 dark:text-gray-400" /> : <Eye className="h-5 w-5 text-gray-500 dark:text-gray-400" />}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" disabled={isLoading} className="w-full h-12 text-base font-medium rounded-lg">
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </Form>
  )
}
