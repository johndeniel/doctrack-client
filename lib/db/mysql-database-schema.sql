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


-- Document Tracking Ticket Table
CREATE TABLE IF NOT EXISTS document_ticket (
  -- Primary Key: UUID generated automatically for each new document
  -- Ensures globally unique identification across systems and databases
  document_uuid VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  
  -- Document Title: The formal name or subject of the document
  -- Provides a descriptive identifier for the document in the system
  document_title VARCHAR(1000) NOT NULL,
  
  -- Encoder Reference: User who created the document record
  -- Links to the account that initially entered the document into the system
  document_encoder_account_uuid VARCHAR(36) NOT NULL,
  
  -- Document Classification: Type of document being tracked
  -- Differentiates between physical documents and electronic correspondence
  document_type ENUM('Physical Document', 'Digital Document') NOT NULL,
  
  -- Document Source: Origin classification of the document
  -- Identifies whether document originated from within or outside the organization
  document_origin ENUM('Internal', 'External') NOT NULL,
  
  -- Priority Level: Urgency classification for processing
  -- Determines processing order and resource allocation
  document_priority ENUM('High', 'Medium', 'Low') NOT NULL,
  
  -- Intake Timeline: When document was officially received
  -- Records the exact date and time of document receipt
  document_date_received DATE NOT NULL,
  document_time_received TIME NOT NULL,
  
  -- System Timestamps: Records document creation and modification
  -- Automatically tracks when the record was entered and last updated
  document_created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  document_updated_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Processing Timeline: Tracks document workflow deadlines and completion
  -- Manages the expected completion date and actual completion date
  document_due_date DATE NOT NULL,
  document_completed_timestamp TIMESTAMP NULL,
  
  -- Completion Authority: User who marked document as completed
  -- Links to the account that finalized the document processing
  document_completed_by_account_uuid VARCHAR(36) NULL,
  
  -- Routing Information: Next organizational unit for document processing
  -- Identifies which division is currently responsible for the document
  document_assigned_division ENUM('ARU-MAU', 'OD', 'PMTSSD', 'PPDD', 'URWED') NOT NULL,
  
  -- Foreign Key Relationships: Ensures data integrity with users_account table
  -- RESTRICT prevents deletion of users referenced in document records
  FOREIGN KEY (document_encoder_account_uuid) REFERENCES users_account(account_uuid) ON DELETE RESTRICT,
  FOREIGN KEY (document_completed_by_account_uuid) REFERENCES users_account(account_uuid) ON DELETE RESTRICT,
  
  -- Date validation to ensure due date is after received date
  CONSTRAINT valid_date_range CHECK (document_due_date >= document_date_received),
  
  -- Indexing: Improves query performance for common search patterns
  -- Enables efficient document retrieval by division, priority, and completion status
  INDEX idx_document_division (document_assigned_division),
  INDEX idx_document_priority (document_priority),
  INDEX idx_document_completion (document_completed_timestamp)
);


-- Collaboration Timeline Table
-- Tracks document workflow actions and comments between users
CREATE TABLE IF NOT EXISTS collaboration_timeline (
  -- Primary Key: UUID generated automatically for each timeline entry
  -- Ensures globally unique identification across systems and databases
  collaboration_timeline_uuid VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  
  -- Document Reference: Links to the document being collaborated on
  -- Establishes which document this timeline entry pertains to
  document_uuid VARCHAR(36) NOT NULL,
  
  -- Action Author: User who performed the collaboration action
  -- Identifies which account is responsible for this timeline entry
  author_account_uuid VARCHAR(36) NOT NULL,
  
  -- Collaboration Action: Type of workflow action performed
  -- Categorizes the specific action taken in the document's lifecycle
  collaboration_action_type ENUM('Forwarded', 'Verification', 'Review') NOT NULL,

  -- Division Designation: The organizational unit to which the document is forwarded
  -- Tracks which division is responsible for the next workflow step
  designation_division ENUM('ARU-MAU', 'OD', 'PMTSSD', 'PPDD', 'URWED') NOT NULL,
  
  -- Action Remarks: Detailed comments about the collaboration action
  -- Provides context and explanation for the action taken
  remarks VARCHAR(1000) NOT NULL,
  
  -- System Timestamps: Records entry creation and modification
  -- Automatically tracks when the record was entered and last updated
  collaboration_created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  collaboration_updated_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Key Relationships: Ensures data integrity with related tables
  -- RESTRICT prevents deletion of documents and users referenced in timeline
  FOREIGN KEY (document_uuid) REFERENCES document_ticket(document_uuid) ON DELETE RESTRICT,
  FOREIGN KEY (author_account_uuid) REFERENCES users_account(account_uuid) ON DELETE RESTRICT,
  
  -- Indexing: Improves query performance for common search patterns
  -- Enables efficient timeline retrieval by document and author
  INDEX idx_timeline_document (document_uuid),
  INDEX idx_timeline_author (author_account_uuid)
);
