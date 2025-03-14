"use client";

import { Input } from "@/components/ui/input";
import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Buffer } from "buffer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import {createUserAccount} from '@/server/action/create-user-account'
import { toast } from 'sonner';


// Validation schema for user creation
export const createUserSchema = z.object({
    account_legal_name: z.string()
    .min(2, { message: 'Legal name must be at least 8 characters long' })
    .max(32, { message: 'Legal name must be at most 32 characters long' }),

    account_username: z.string()
    .min(8, { message: 'Username must be at least 8 characters long' })
    .max(32, { message: 'Username must be at most 32 characters long' })
    .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain alphanumeric characters and underscores' })
    .refine(val => !val.startsWith('_') && !val.endsWith('_'), {
      message: 'Username cannot start or end with an underscore'
    }),
  
    account_password: z.string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(32, { message: 'Password must be at most 32 characters long' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/\d/, { message: 'Password must contain at least one numeric character' }),

    account_division_designation: z.string()
    .min(1, { message: 'Division designation is required' })
    .max(32, { message: 'Division designation must be at most 32 characters long' }),

    users_profile_image: z.instanceof(File, { message: 'Invalid file type' })
        .refine(file => file.size > 0, { message: 'File is required' }),

    users_profile_image_name: z.string(),
    users_profile_image_data: z.string(),
    users_profile_image_type: z.string(),
    users_profile_image_size: z.string()

});

// Export type for form values based on the schema
export type AccountFormValues = z.infer<typeof createUserSchema>;

// Default values for the form
export const accountDefaultValues: AccountFormValues = {
  account_legal_name: "",
  account_username: "",
  account_password: "",
  account_division_designation: "",
  users_profile_image: new File([], ""),
  users_profile_image_name: "",
  users_profile_image_data: "",
  users_profile_image_type: "",
  users_profile_image_size: ""
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = { "image/*": [".jpeg", ".jpg", ".png"] };

export function CreateAccount() {
  // State to toggle password visibility
  const [isVisible, setIsVisible] = useState<boolean>(false);
  
  // Initialize the form with validation and default values
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: accountDefaultValues
  });

  // Toggle password visibility function
  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  /**
   * Checks password strength against defined requirements
   * @param pass - The password string to evaluate
   * @returns Array of requirement objects with met status and description
   */
  const checkStrength = (pass: string) => {
    const requirements = [
      { regex: /.{8,}/, text: "At least 8 characters" },
      { regex: /[0-9]/, text: "At least 1 number" },
      { regex: /[a-z]/, text: "At least 1 lowercase letter" },
      { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
    ];

    return requirements.map((req) => ({
      met: req.regex.test(pass),
      text: req.text,
    }));
  };

  // Watch the password field for changes
  const current_password = form.watch("account_password");
  
  // Check password strength against requirements
  const strength = checkStrength(current_password);

  // Calculate overall strength score based on met requirements
  const strengthScore = useMemo(() => {
    return strength.filter((req) => req.met).length;
  }, [strength]);

  /**
   * Determine color for strength indicator based on score
   * @param score - Numeric strength score (0-4)
   * @returns CSS class for appropriate color
   */
  const getStrengthColor = (score: number) => {
    if (score === 0) return "bg-border";
    if (score <= 1) return "bg-red-500";
    if (score <= 2) return "bg-orange-500";
    if (score === 3) return "bg-amber-500";
    return "bg-emerald-500";
  };

  /**
   * Get descriptive text for password strength
   * @param score - Numeric strength score (0-4)
   * @returns Human-readable strength description
   */
  const getStrengthText = (score: number) => {
    if (score === 0) return "Enter a password";
    if (score <= 2) return "Weak password";
    if (score === 3) return "Medium password";
    return "Strong password";
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setSelectedFile(file);

      const arrayBuffer = await file.arrayBuffer();
      const base64String = Buffer.from(arrayBuffer).toString("base64");

      // Update the form value with file details
      form.setValue("users_profile_image_name", file.name);
      form.setValue("users_profile_image_data", `data:${file.type};base64,${base64String}`);
      form.setValue("users_profile_image_type", file.type);
      form.setValue("users_profile_image_size", `${(file.size / 1024 / 1024).toFixed(2)} MB`);
    },
    
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });
  

  /**
    * Handle form submission and call createUserAccount
    * Form submission handler
    * @param values - Validated form values
    */
  async function onSubmit(values: AccountFormValues) {
    try {
      await createUserAccount(values);
      console.log("Account successfully created", values);
      
      // Reset the form
      form.reset(accountDefaultValues);
      setSelectedFile(null);
      
      // Show success toast
      toast.success("Account created successfully", {
        description: "You can now log in with your credentials",
      });
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
    }
  }
  return (
    <div className="overflow-y-auto pb-20">
      <div className="flex items-center justify-center bg-transparent px-4 py-2 min-h-[580px]">
        <div className="w-full max-w-[480px] space-y-4 p-4">
          {/* Form header */}
          <div className="text-center space-y-1 mb-2">
            <h1 className="text-2xl font-semibold tracking-tight">Create Your Account</h1>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Please fill in your information to get started
            </p>
          </div>

          {/* Account creation form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="space-y-3">
                {/* Legal name field */}
                <FormField
                  control={form.control}
                  name="account_legal_name"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">Legal Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your legal name" 
                          {...field} 
                          className="h-9"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Username field */}
                <FormField
                  control={form.control}
                  name="account_username"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Choose a username" 
                          {...field} 
                          className="h-9"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Password field with visibility toggle */}
                <FormField
                  control={form.control}
                  name="account_password"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Enter your password"
                            type={isVisible ? "text" : "password"}
                            {...field}
                            className="pr-10 h-9"
                          />
                          <button
                            className="absolute right-0 top-1/2 -translate-y-1/2 px-3 text-muted-foreground hover:text-foreground flex h-full items-center justify-center rounded-e-lg transition-colors focus:outline-none"
                            type="button"
                            onClick={toggleVisibility}
                            aria-label={isVisible ? "Hide password" : "Show password"}
                            aria-pressed={isVisible}
                          >
                            {isVisible ? (
                              <EyeOffIcon size={14} aria-hidden="true" />
                            ) : (
                              <EyeIcon size={14} aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Password strength indicator section */}
              <div className="space-y-4 pt-1">
                {/* Progress bar for password strength */}
                <div
                  className="bg-border h-2 w-full overflow-hidden rounded-full"
                  role="progressbar"
                  aria-valuenow={strengthScore}
                  aria-valuemin={0}
                  aria-valuemax={4}
                  aria-label="Password strength"
                >
                  <div
                    className={`h-full ${getStrengthColor(strengthScore)} transition-all duration-500 ease-out`}
                    style={{ width: `${(strengthScore / 4) * 100}%` }}
                  />
                </div>

                {/* Password requirements checklist */}
                <div className="space-y-3 px-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {getStrengthText(strengthScore)}. Must contain:
                  </p>

                  <ul className="space-y-2.5 mt-2" aria-label="Password requirements">
                    {strength.map((req, index) => (
                      <li key={index} className="flex items-center gap-2.5">
                        {req.met ? (
                          <CheckIcon size={16} className="text-emerald-500" aria-hidden="true" />
                        ) : (
                          <XIcon size={16} className="text-muted-foreground" aria-hidden="true" />
                        )}
                        <span
                          className={`text-sm ${
                            req.met ? "text-emerald-600" : "text-muted-foreground"
                          }`}
                        >
                          {req.text}
                          <span className="sr-only">
                            {req.met ? " - Requirement met" : " - Requirement not met"}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Division selection dropdown */}
              <FormField
                control={form.control}
                name="account_division_designation"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-medium">Division</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select your division" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ARU-MAU">ARU-MAU</SelectItem>
                        <SelectItem value="OD">OD</SelectItem>
                        <SelectItem value="PMTSSD">PMTSSD</SelectItem>
                        <SelectItem value="PPDD">PPDD</SelectItem>
                        <SelectItem value="URWED">URWED</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Photo upload field */}
              <FormField
                control={form.control}
                name="users_profile_image"
                render={({ field: { onChange } }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-medium">Profile Photo</FormLabel>
                    <FormControl>
                      <div 
                        {...getRootProps()} 
                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                      >
                        <input 
                          {...getInputProps({
                            onChange: (e) => {
                              getInputProps().onChange?.(e);
                              // Update the form value for validation
                              if (e.target.files?.[0]) {
                                onChange(e.target.files[0]);
                              }
                            }
                          })} 
                        />
                        {isDragActive ? (
                          <p className="text-blue-500 font-medium">Drop the image here...</p>
                        ) : (
                          <p className="text-gray-500 font-medium">Drag & drop an image here, or click to select</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">Supported formats: JPG & PNG (max 10MB)</p>

                        {selectedFile && (
                          <p className="mt-4 text-green-600 font-semibold">
                            Selected File: {selectedFile.name}
                          </p>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />
              
              {/* Form submission button */}
              <Button type="submit" className="w-full h-9 text-sm mt-4">Create Account</Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}