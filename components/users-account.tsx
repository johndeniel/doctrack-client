'use client'

import React, { useState, useEffect } from 'react'
import { fetchAllUserAccount } from '@/server/queries/fetch-all-user-account'
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarClock, CalendarDays, LogIn, User } from "lucide-react";

/**
* User account data interface representing the database schema
*/
export interface UserAccount {
 account_uuid: string;
 account_legal_name: string;
 account_username: string;
 account_division_designation: string | null;
 account_last_authentication_timestamp: string | null;
 account_created_timestamp: string;
 account_updated_timestamp: string;
 profile_image_data: string | null;
}

/**
* Props definition for the UserAccountCard component
*/
interface UserAccountCardProps {
 account: UserAccount;
}

/**
* Formats a date string to a localized format
* @param dateString - ISO date string to format
* @returns Formatted date string or 'N/A' if input is invalid
*/
const formatDate = (dateString: string | null): string => {
 if (!dateString) return 'N/A';
 try {
   return new Date(dateString).toLocaleDateString("en-US", {
     year: "numeric",
     month: "short",
     day: "numeric",
   });
 } catch (error) {
   console.error("Invalid date format:", error);
   return 'N/A';
 }
};

/**
* Extracts initials from a user's name
* @param name - User's full name
* @returns Up to 2 capital letter initials or empty string if name is invalid
*/
const getInitials = (name: string | null): string => {
 if (!name) return '';
 return name
   .split(" ")
   .filter(Boolean) // Filter out empty parts
   .map((part) => part.charAt(0))
   .join("")
   .toUpperCase()
   .substring(0, 2);
};

/**
* Reusable component for displaying information with an icon
* @param props - Component properties
* @returns JSX element for an information row with icon
*/
const InfoRow = ({
 icon: Icon, 
 label, 
 value, 
 bgColor = "bg-gray-100", 
 iconColor = "text-gray-600"
}: {
 icon: React.ElementType;
 label: string;
 value: string;
 bgColor?: string;
 iconColor?: string;
}) => (
 <div className="flex items-center space-x-4">
   <div className={`${bgColor} rounded-full p-2 flex items-center justify-center`}>
     <Icon className={`h-5 w-5 ${iconColor}`} />
   </div>
   <span className="text-sm text-gray-700">{label}: {value}</span>
 </div>
);

/**
* Card component for displaying a single user account
* @param account - User account data to display
* @returns JSX element for a user account card
*/
const UserAccountCard = ({ account }: UserAccountCardProps) => {
 // Safely destructure account data with fallback values
 const {
   account_legal_name = '',
   account_username = '',
   account_division_designation,
   account_last_authentication_timestamp,
   account_created_timestamp = '',
   account_updated_timestamp = '',
   profile_image_data,
   account_uuid = ''
 } = account || {};

 // Early return if account data is invalid
 if (!account_uuid) {
   return null;
 }

 // Generate a truncated UUID for display purposes
 const displayUuid = account_uuid.length > 8 ? `${account_uuid.slice(0, 8)}...` : account_uuid;

 return (
   <Card className="w-full max-w-md mx-auto border border-gray-200 rounded-lg shadow-sm overflow-hidden">
     {/* Header with Avatar and User Info */}
     <CardHeader className="bg-gray-50 p-6 border-b border-gray-200">
       <div className="flex items-center space-x-4">
         <Avatar className="h-16 w-16 border-2 border-gray-200">
           <AvatarImage 
             src={profile_image_data || ""} 
             alt={account_legal_name || "User"} 
             className="object-cover"
           />
           <AvatarFallback className="bg-gray-100 text-gray-700 font-medium">
             {getInitials(account_legal_name)}
           </AvatarFallback>
         </Avatar>
         <div className="flex-1">
           <h3 className="text-lg font-semibold text-gray-800">
             {account_legal_name || "Unknown User"}
           </h3>
           <p className="text-sm text-gray-500">
             {account_username ? `@${account_username}` : "No username"}
           </p>
         </div>
       </div>
     </CardHeader>

     {/* Account Details Content */}
     <CardContent className="p-6 space-y-5">
       {/* Division Information */}
       <InfoRow 
         icon={User} 
         label="Division" 
         value={account_division_designation || "No division assigned"} 
       />

       {/* Authentication and Timestamp Information */}
       <div className="space-y-4 text-gray-600">
         {/* Conditionally render login info based on authentication history */}
         {account_last_authentication_timestamp ? (
           <InfoRow 
             icon={LogIn} 
             label="Last Login" 
             value={formatDate(account_last_authentication_timestamp)}
             bgColor="bg-blue-50"
             iconColor="text-blue-600"
           />
         ) : (
           <InfoRow 
             icon={LogIn} 
             label="Login History" 
             value="No login history"
             iconColor="text-gray-500"
           />
         )}

         <InfoRow 
           icon={CalendarDays} 
           label="Created" 
           value={formatDate(account_created_timestamp)} 
         />

         <InfoRow 
           icon={CalendarClock} 
           label="Updated" 
           value={formatDate(account_updated_timestamp)} 
         />
       </div>
     </CardContent>

     {/* Footer with Partial Account UUID */}
     <CardFooter className="p-6 pt-2 flex justify-between items-center border-t border-gray-100">
       <div className="text-xs text-gray-400">
         Account ID: {displayUuid}
       </div>
     </CardFooter>
   </Card>
 );
};

/**
* Main component for displaying all user accounts
* Fetches and renders a grid of user account cards
*/
export function UsersAccount() {
 // State management for accounts data, loading state, and error handling
 const [accounts, setAccounts] = useState<UserAccount[]>([]);
 const [isLoading, setIsLoading] = useState<boolean>(true);
 const [error, setError] = useState<string | null>(null);

 // Fetch accounts data on component mount
 useEffect(() => {
   /**
    * Fetches user accounts from the server and updates component state
    */
   async function loadAccounts() {
     try {
       setIsLoading(true);
       const fetchedAccounts = await fetchAllUserAccount();
       setAccounts(Array.isArray(fetchedAccounts) ? fetchedAccounts : []);
       setError(null);
     } catch (err) {
       console.error('Error fetching user accounts:', err);
       setError('Failed to load user accounts. Please try again later.');
     } finally {
       setIsLoading(false);
     }
   }

   loadAccounts();
 }, []); // Empty dependency array ensures the effect runs once on mount

 // Display loading state
 if (isLoading) {
   return <div className="text-center py-12">Loading user accounts...</div>;
 }

 // Display error state
 if (error) {
   return (
     <div className="text-center py-12">
       <p className="text-red-500">{error}</p>
     </div>
   );
 }

 return (
   <div className="container mx-auto py-8 px-4">
     {accounts.length === 0 ? (
       // Empty state when no accounts are found
       <div className="text-center py-12">
         <p className="text-muted-foreground">No user accounts found</p>
       </div>
     ) : (
       // Grid layout for multiple account cards
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {accounts.map((account) => (
           <UserAccountCard 
             key={account.account_uuid} 
             account={account} 
           />
         ))}
       </div>
     )}
   </div>
 );
}