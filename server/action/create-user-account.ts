import { AccountFormValues } from '@/components/create-account'

export async function createUserAccount(accountDetails: AccountFormValues) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    const endpoint = '/api/create-user-account'

    try {
        const httpRequest = { 
            account_legal_name: accountDetails.account_legal_name,
            account_username: accountDetails.account_username,
            account_password: accountDetails.account_password,
            account_division_designation: accountDetails.account_division_designation,
            users_profile_image_name: accountDetails.users_profile_image_name,
            users_profile_image_data: accountDetails.users_profile_image_data,
            users_profile_image_type: accountDetails.users_profile_image_type,
            users_profile_image_size: accountDetails.users_profile_image_size
        }

        const response = await fetch(`${baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(httpRequest),
        })

        const result = await response.json()

        if (!response.ok) {
          console.error('Request failed:', result)
          throw new Error(`HTTP error! status: ${response.status}, message: ${result.message}, details: ${JSON.stringify(result.details)}`)
        }

        console.log('Success:', result)

        return result
    } catch (error) {
        console.error('Error posting registration data:', error)
        throw error
    }
}