import type { Tables, TablesInsert, TablesUpdate } from './db/database.types';

// User DTOs & Command Models

// Command for registering a new user
export interface RegisterUserCommand {
  email: string;
  password: string;
  confirmPassword: string;
}

// DTO representing a user in responses (based on the 'users' database model, minus sensitive info)
export interface UserDto {
  id: number;
  email: string;
  // Note: Additional profile fields (e.g., firstName, lastName) might be added by business logic
}

// Response DTO for successful user registration
export interface RegisterUserResponseDto {
  message: string;
  user: UserDto;
}

// Command for user login
export interface LoginCommand {
  email: string;
  password: string;
}

// Response DTO for a successful login
export interface LoginResponseDto {
  message: string;
  token: string;
}

// Response DTO for logout
export interface LogoutResponseDto {
  message: string;
}

// Command to initiate password reset
export interface ResetPasswordCommand {
  email: string;
}

// Response DTO for password reset initiation
export interface ResetPasswordResponseDto {
  message: string;
}

// Command to change the password for the authenticated user
export interface ChangePasswordCommand {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Response DTO after password change
export interface ChangePasswordResponseDto {
  message: string;
}

// DTO representing the user profile (extends the basic user model with optional fields)
export interface UserProfileDto {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
}

// Command for updating the user profile
export interface UpdateUserProfileCommand {
  firstName?: string;
  lastName?: string;
  email: string;
}

// Response DTO for updating the user profile
export interface UpdateUserProfileResponseDto {
  message: string;
  user: UserProfileDto;
}


// Report DTOs & Command Models

// Command for generating a report preview
export interface GenerateReportCommand {
  originalText: string;
}

// DTO representing a generated report preview
export interface ReportPreviewDto {
  originalText: string;
  summary: string;
  conclusions: string | string[];
  keyData: string;
}

// Command for creating/saving a report
export interface CreateReportCommand {
  title: NonNullable<TablesInsert<'reports'>['title']>;
  originalText: NonNullable<TablesInsert<'reports'>['original_text']>;
  summary: NonNullable<TablesInsert<'reports'>['summary']>;
  conclusions: NonNullable<TablesInsert<'reports'>['conclusions']> | string[];
  keyData: NonNullable<TablesInsert<'reports'>['key_data']>;
}

// DTO representing a full report (camelCase), derived from DB row
export interface ReportDto {
  id: Tables<'reports'>['id'];
  userId: Tables<'reports'>['user_id'];
  title: Tables<'reports'>['title'];
  originalText: Tables<'reports'>['original_text'];
  summary: Tables<'reports'>['summary'];
  conclusions: Tables<'reports'>['conclusions'] | string[];
  keyData: Tables<'reports'>['key_data'];
  createdAt: Tables<'reports'>['created_at'];
  updatedAt: Tables<'reports'>['updated_at'];
}

// Response DTO for creating a report
export interface CreateReportResponseDto {
  message: string;
  report: ReportDto;
}

// DTO representing a summary of a report (for listing reports)
export type ReportSummaryDto = Pick<ReportDto, 'id' | 'title' | 'summary' | 'createdAt'>;

// DTO for pagination information in list responses
export interface PaginationDto {
  page: number;
  limit: number;
  total: number;
}

// Response DTO for listing reports
export interface ListReportsResponseDto {
  reports: ReportSummaryDto[];
  pagination: PaginationDto;
  error?: string;
}

// Response DTO for getting detailed report information (same as full ReportDto)
export type GetReportDetailsResponseDto = ReportDto;

// Command for updating a report. All fields are optional as only modified fields need to be provided.
export interface UpdateReportCommand {
  title?: TablesUpdate<'reports'>['title'];
  originalText?: TablesUpdate<'reports'>['original_text'];
  summary?: TablesUpdate<'reports'>['summary'];
  conclusions?: TablesUpdate<'reports'>['conclusions'];
  keyData?: TablesUpdate<'reports'>['key_data'];
}

// Response DTO for updating a report
export interface UpdateReportResponseDto {
  message: string;
  report: ReportDto;
}

// Response DTO for deleting a report
export interface DeleteReportResponseDto {
  message: string;
} 