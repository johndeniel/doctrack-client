"use server"

import { z } from "zod"

// This would typically connect to your authentication system
// For demo purposes, we're using a mock implementation
const MOCK_USERS = [
  { username: "admin", password: "password123" },
  { username: "user", password: "user123" },
]

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
})

export async function loginUser(formData: {
  username: string
  password: string
}) {
  // Validate form data with Zod
  const validatedFields = loginSchema.safeParse(formData)

  if (!validatedFields.success) {
    return {
      success: false,
      error: "Invalid form data. Please check your inputs.",
    }
  }

  const { username, password } = validatedFields.data

  // Simulate a delay for the authentication process
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Check if user exists
  const user = MOCK_USERS.find((user) => user.username === username)

  if (!user) {
    return {
      success: false,
      error: "Username doesn't exist. Please check your credentials.",
    }
  }

  // Check if password is correct
  if (user.password !== password) {
    return {
      success: false,
      error: "Incorrect password. Please try again.",
    }
  }

  // Authentication successful
  return {
    success: true,
  }
}

