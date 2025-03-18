import { LoginFormValues } from "@/components/login-form"

export async function loginUserAccount(accountDetails: LoginFormValues) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  const endpoint = "/api/login"

  try {
    const httpRequest = {
      username: accountDetails.username,
      password: accountDetails.password,
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(httpRequest),
      credentials: "include",
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("Authentication failed:", result)
      
      throw new Error(
        `HTTP error! status: ${response.status}, details: ${JSON.stringify(result)}`
      )
    }

    console.log("Authentication successful:", result)
    return result
  } catch (error) {
    console.error("Error during authentication:", error)
    throw error
  }
}