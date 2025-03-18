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
      toast.success("Login successful", {
        description: "Redirecting to dashboard...",
      })
      router.push('/');

    } catch (error) {
      // Extract the error message from the Error object
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Authentication failed:", errorMessage);
      
      // Try to extract the JSON data directly instead of using regex
      if (error instanceof Error && error.message.includes('HTTP error!')) {
        try {
          // Extract the details part which contains the JSON
          const detailsMatch = error.message.match(/details: ({.+})$/);
          const statusMatch = error.message.match(/status: (\d+)/);
          
          const statusCode = statusMatch ? statusMatch[1] : "unknown";
          
          if (detailsMatch && detailsMatch[1]) {
            // Parse the JSON details
            const errorDetails = JSON.parse(detailsMatch[1]);
            const errorCode = errorDetails.code || "UNKNOWN_ERROR";
            
            console.log("Parsed error details:", errorDetails);
            
            // Handle specific error codes based on the API response
            if (errorCode === "INVALID_CREDENTIALS") {
              toast.error("Authentication Failed", {
                description: "The username or password you entered is incorrect.",
                action: {
                  label: "Try Again",
                  onClick: () => form.setFocus("username"),
                },
              });
            } else if (errorCode === "VALIDATION_ERROR") {
              toast.error("Invalid Input", {
                description: "Please ensure all required fields are filled correctly.",
                action: {
                  label: "Review",
                  onClick: () => form.setFocus("username"),
                },
              });
            } else {
              // Handle other API error codes
              toast.error("Login Failed", {
                description: errorDetails.message || "An unexpected error occurred during login.",
                action: {
                  label: "Retry",
                  onClick: () => form.handleSubmit(onSubmit)(),
                },
              });
            }
          } else if (statusCode === "500") {
            toast.error("Server Error", {
              description: "An internal server error occurred. Please try again later.",
              action: {
                label: "Retry",
                onClick: () => form.handleSubmit(onSubmit)(),
              },
            });
          } else {
            // Fallback for when details can't be parsed
            toast.error("Authentication Failed", {
              description: "An error occurred during login.",
              action: {
                label: "Retry",
                onClick: () => form.handleSubmit(onSubmit)(),
              },
            });
          }
        } catch (parseError) {
          console.error('Failed to parse error details:', parseError);
          
          // Simpler fallback based just on HTTP status code
          if (errorMessage.includes('status: 401')) {
            toast.error("Authentication Failed", {
              description: "The username or password you entered is incorrect.",
              action: {
                label: "Try Again",
                onClick: () => form.setFocus("username"),
              },
            });
          } else if (errorMessage.includes('status: 400')) {
            toast.error("Invalid Input", {
              description: "Please ensure all required fields are filled correctly.",
              action: {
                label: "Review",
                onClick: () => form.setFocus("username"),
              },
            });
          } else {
            toast.error("Login Failed", {
              description: "An unexpected error occurred during login.",
              action: {
                label: "Retry",
                onClick: () => form.handleSubmit(onSubmit)(),
              },
            });
          }
        }
      } else {
        // Handle connection errors or other unexpected errors
        toast.error("Connection Error", {
          description: "Unable to connect to the authentication service. Please check your internet connection.",
          action: {
            label: "Retry",
            onClick: () => form.handleSubmit(onSubmit)(),
          },
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
          {isLoading ? "Authenticating..." : "Login"}
        </Button>
      </form>
    </Form>
  )
}