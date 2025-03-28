import Image from "next/image"

export interface ProfileInfoProps {
  /**
   * User's avatar URL
   */
  avatarUrl: string
  /**
   * User's full name
   */
  name: string
  /**
   * User's username
   */
  username: string
  /**
   * User's division or department
   */
  division: string
}

/**
 * Component to display user profile information
 */
export function ProfileInfo({ avatarUrl, name, username, division }: ProfileInfoProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border border-border/30 dark:border-muted">
          <Image src={avatarUrl || "/placeholder.svg"} alt={`${name}'s avatar`} fill className="object-cover" />
        </div>
        <div className="ml-4">
          <h3 className="text-base font-medium leading-tight">{name}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">@{username}</p>
        </div>
      </div>
      <div className="flex-shrink-0">
        <div className="inline-flex items-center rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-primary dark:bg-primary/15">
          {division}
        </div>
      </div>
    </div>
  )
}

