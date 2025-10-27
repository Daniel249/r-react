
import { AuthUser } from "../../domain/entities/AuthUser";

export interface AuthRemoteDataSource {
  login(email: string, password: string): Promise<AuthUser>;
  signUp(email: string, password: string): Promise<AuthUser>;
  logOut(): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
  validate(email: string, validationCode: string): Promise<boolean>;
  refreshToken(): Promise<boolean>;
  forgotPassword(email: string): Promise<boolean>;
  resetPassword(email: string, newPassword: string, validationCode: string): Promise<boolean>;
  verifyToken(): Promise<boolean>;
}