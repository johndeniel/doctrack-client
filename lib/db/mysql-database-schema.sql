-- Users Account Table
CREATE TABLE IF NOT EXISTS users_account (
  -- Primary Key: UUID generated automatically for each new account
  -- Ensures globally unique identification across systems and databases
  account_uuid VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),

  -- Complete Name: User's full legal name
  -- Stores the complete name as it appears in official documents
  account_legal_name VARCHAR(100) NOT NULL,
   
  -- Username: User's login identifier
  -- Must be 8-32 characters, allowing only alphanumeric and underscore
  -- Unique constraint prevents duplicate usernames across system
  account_username VARCHAR(32) UNIQUE NOT NULL,
  CONSTRAINT account_username_min_length CHECK (LENGTH(account_username) >= 8),
  CONSTRAINT account_username_format CHECK (account_username REGEXP '^[a-zA-Z0-9][a-zA-Z0-9_]*[a-zA-Z0-9]$'),
   
  -- Password Hash: Securely stored password using cryptographic hashing
  -- Stores only the hash, never the plain text password
  account_password_hash VARCHAR(255) NOT NULL,
   
  -- Authorization Level: User's system-wide permission level
  -- Controls access to administrative and protected functions
  account_authorization_level ENUM('standard_user', 'system_administrator') DEFAULT 'standard_user',
   
  -- Division Assignment: User's organizational unit
  -- ARU-MAU: Appeals and Review Unit - Mediation-Arbitration Unit
  -- OD: Office of the Director
  -- PMTSSD: Policy and Program Development Division
  -- PPDD: Project Planning & Development Division
  -- URWED: Union Registration and Workers Empowerment Division
  account_division_designation ENUM('ARU-MAU', 'OD', 'PMTSSD', 'PPDD', 'URWED') DEFAULT 'ARU-MAU',
   
  -- Authentication History: Tracks last successful login
  -- Used for security monitoring and session management
  account_last_authentication_timestamp TIMESTAMP NULL,
   
  -- Creation Timestamp: Records when account was first created
  -- Automatically set upon record insertion
  account_created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   
  -- Update Timestamp: Records when account was last modified
  -- Automatically updated whenever record changes
  account_updated_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS users_profile_image (
  -- Primary Key: Unique identifier for each profile image record
  -- Uses UUID format (36 characters) for globally unique values
  -- Auto-generated when new record is created
  profile_image_uuid VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  
  -- Account Link: References the associated user account
  -- One-to-one relationship - each user can have only one profile image
  -- Automatically deleted when the referenced user account is removed
  account_uuid VARCHAR(36) NOT NULL UNIQUE,
  
  -- Original Filename: Name of the image when it was uploaded
  -- Preserves original name for downloads and display purposes
  -- Example: "johndoe-profile.jpg" 
  profile_image_file_name VARCHAR(255) NOT NULL,
  
  -- Image Content: Raw binary data of the image file
  -- Stores the actual image bytes directly in the database
  -- Supports files up to 4GB in size (LONGBLOB)
   profile_image_data LONGTEXT NOT NULL,
  
  -- Content Type: Format and type of the stored image
  -- Used for proper image handling and rendering
  -- Example values: "image/jpeg", "image/png", "image/gif"
  profile_image_mime_type VARCHAR(50) NOT NULL,
  
  -- File Size: Size of the stored image in bytes
  -- Useful for quick size checks and display purposes
  -- Example: 2097152 (represents 2MB)
  profile_image_size_bytes  VARCHAR(255) NOT NULL,
  
  -- Creation Time: When the profile image was first added
  -- Automatically set to current server time on insert
  -- Stored in database timezone
  profile_image_created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Last Modified: When the profile image was last updated
  -- Automatically updates when any field changes
  -- Tracks the most recent modification
  profile_image_updated_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Relationship: Ensures referential integrity with users_account table
  -- Cascading delete removes profile image when user is deleted
  FOREIGN KEY (account_uuid) REFERENCES users_account(account_uuid) ON DELETE CASCADE,
  
  -- Constraint: Ensures each user has maximum one profile image
  -- Prevents multiple profile images for the same user
  CONSTRAINT unique_account_profile UNIQUE (account_uuid)
);