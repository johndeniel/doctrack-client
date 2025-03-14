import type { UserAccount } from "@/components/users-account"


export async function fetchAllUserAccount(): Promise<UserAccount[]> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL
        const endpoint = `/api/all-user-account`
        
        if (!baseUrl) {
        console.error('NEXT_PUBLIC_APP_URL is not defined');
        return [];
        }

        const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        mode: 'cors',
        });

        if (!response.ok) {
        console.error(`Fetch failed with status: ${response.status}`);
        return [];
        }

        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return [];
    }
}