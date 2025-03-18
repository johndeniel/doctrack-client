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
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("Request failed:", result)
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${result.message}, details: ${JSON.stringify(result.details)}`
      )
    }

    console.log("Success:", result)
    return result
  } catch (error) {
    console.error("Error logging in:", error)
    throw error
  }
}
