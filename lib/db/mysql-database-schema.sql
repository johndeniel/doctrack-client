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


-- User Authentication Sessions Table
CREATE TABLE IF NOT EXISTS user_authentication_sessions (
  -- Session Unique Identifier
  session_uuid VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  
  -- Foreign Key Linking to User Account
  authenticated_user_id VARCHAR(36) NOT NULL,
  
  -- Secure Authentication Token
  authentication_token VARCHAR(500) NOT NULL,
  
  -- Browser Information
  client_browser_name VARCHAR(100),
  client_browser_version VARCHAR(50),
  
  -- Operating System Information
  client_os_name VARCHAR(100),
  client_os_version VARCHAR(50),
  
  -- Session Timing Information
  session_initiated_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  session_expiration_timestamp TIMESTAMP NOT NULL,
  
  -- Token Security Validation
  CONSTRAINT secure_token_length CHECK (LENGTH(authentication_token) >= 32 AND LENGTH(authentication_token) <= 500),
  
  -- Foreign Key Constraint linking to users_account table
  FOREIGN KEY (authenticated_user_id) REFERENCES users_account(account_uuid) ON DELETE CASCADE,
  
  -- Index for efficient session lookup
  INDEX idx_auth_token (authentication_token),
  INDEX idx_user_id (authenticated_user_id)
);

-- Task Tracking Ticket Table
CREATE TABLE IF NOT EXISTS task_ticket (
  -- Primary Key: UUID generated automatically for each new task
  task_uuid VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),

  -- Task Title: The formal name or subject of the task
  task_title VARCHAR(1000) NOT NULL,
  
  -- Task Description: Additional details or context about the task
  task_description TEXT NOT NULL,

  -- Task Creator Reference: User who created the task record
  task_creator_account_uuid VARCHAR(36) NOT NULL,

  -- Task Classification: Type of task being tracked
  task_type ENUM('Physical Document', 'Digital Document') NOT NULL,

  -- Task Source: Origin classification of the task
  task_origin ENUM('Internal', 'External') NOT NULL,

  -- Priority Level: Urgency classification for processing
  task_priority ENUM('High', 'Medium', 'Low') NOT NULL,

  -- Intake Timeline: When task was officially created
  task_date_created DATE NOT NULL,
  task_time_created TIME NOT NULL,

  -- System Timestamps: Records task creation and modification
  task_created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  task_updated_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Completion Status: Indicates if task is completed
  task_is_completed BOOLEAN NOT NULL DEFAULT FALSE,

  -- Task Timeline: Tracks task workflow deadlines and completion
  task_due_date DATE NOT NULL,
  task_completed_timestamp TIMESTAMP NULL,

  -- Completion Authority: User who marked task as completed
  task_completed_by_account_uuid VARCHAR(36) NULL,

  -- Routing Information: Next organizational unit for task processing
  task_assigned_division ENUM('ARU-MAU', 'OD', 'PMTSSD', 'PPDD', 'URWED') NOT NULL,

  -- Foreign Key Relationships: Ensures data integrity with users_account table
  FOREIGN KEY (task_creator_account_uuid) REFERENCES users_account(account_uuid) ON DELETE RESTRICT,
  FOREIGN KEY (task_completed_by_account_uuid) REFERENCES users_account(account_uuid) ON DELETE RESTRICT,

  -- Date validation to ensure due date is after created date
  CONSTRAINT valid_date_range CHECK (task_due_date >= task_date_created),

  -- Indexing for performance
  INDEX idx_task_division (task_assigned_division),
  INDEX idx_task_priority (task_priority),
  INDEX idx_task_completion (task_completed_timestamp)
);

-- Task Collaboration Timeline Table
CREATE TABLE IF NOT EXISTS task_collaboration_timeline (
  -- Primary Key: UUID generated automatically for each timeline entry
  task_collaboration_timeline_uuid VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  
  -- Task Reference: Links to the task being collaborated on
  task_uuid VARCHAR(36) NOT NULL,
  
  -- Action Author: User who performed the collaboration action
  author_account_uuid VARCHAR(36) NOT NULL,
  
  -- Collaboration Action: Type of workflow action performed
  collaboration_action_type ENUM('Forwarded', 'Verification', 'Review') NOT NULL,

  -- Division Designation: The organizational unit to which the task is forwarded
  designation_division ENUM('ARU-MAU', 'OD', 'PMTSSD', 'PPDD', 'URWED') NOT NULL,
  
  -- Action Remarks: Detailed comments about the collaboration action
  remarks VARCHAR(1000) NOT NULL,
  
  -- System Timestamps: Records entry creation and modification
  collaboration_created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  collaboration_updated_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Key Relationships: Ensures data integrity with related tables
  FOREIGN KEY (task_uuid) REFERENCES task_ticket(task_uuid) ON DELETE RESTRICT,
  FOREIGN KEY (author_account_uuid) REFERENCES users_account(account_uuid) ON DELETE RESTRICT,
  
  -- Indexing for performance
  INDEX idx_timeline_task (task_uuid),
  INDEX idx_timeline_author (author_account_uuid)
);


SELECT DISTINCT 
    tt.task_uuid AS id, 
    tt.task_title AS title, 
    tt.task_description AS description, 
    tt.task_due_date AS dueDate, 
    CASE WHEN tt.task_is_completed = 1 THEN 'true' ELSE 'false' END AS completed, 
    CASE WHEN tt.task_completed_timestamp IS NULL THEN 'undefined' ELSE tt.task_completed_timestamp END AS dateCompleted, 
    LOWER(tt.task_priority) AS priority 
FROM task_ticket tt 
INNER JOIN task_collaboration_timeline ct ON tt.task_uuid = ct.task_uuid 
WHERE ct.designation_division = 'ARU-MAU';