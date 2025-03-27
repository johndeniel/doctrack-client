export async function logoutUserAccount() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    const endpoint = "/api/logout"

    const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
    throw new Error('Logout failed')
    }
}
