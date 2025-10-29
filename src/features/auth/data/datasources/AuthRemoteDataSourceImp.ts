import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { AuthUser, AuthUserEntity } from "../../domain/entities/AuthUser";
import { AuthRemoteDataSource } from "./AuthRemoteDataSource";

export class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  private readonly projectId: string;
  private readonly baseUrl: string;

  private prefs: ILocalPreferences;

  constructor(projectId?: string) {
    // Safely try to read environment variable with error handling
    let envProjectId: string | undefined;
    try {
      envProjectId = process.env?.EXPO_PUBLIC_ROBLE_PROJECT_ID;
    } catch (error) {
      console.warn("Could not access process.env, using fallback");
      envProjectId = undefined;
    }
    
    // Use provided projectId, then env var, then hardcoded fallback
    const safeProjectId = projectId || envProjectId || "pruebadavid_a9af0fb6f8";
    
    console.log(`AuthRemoteDataSourceImpl: Using project ID: ${safeProjectId}`);
    
    this.projectId = safeProjectId;
    this.baseUrl = `https://roble-api.openlab.uninorte.edu.co/auth/${this.projectId}`;
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
  }

  async login(email: string, password: string): Promise<AuthUser> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ email, password }),
      });

      if (response.status === 201) {
        const data = await response.json();
        const token = data["accessToken"];
        const refreshToken = data["refreshToken"];
        await this.prefs.setAuthToken(token);
        await this.prefs.storeData("refreshToken", refreshToken);
        
        // Extract user information from the response
        const user = AuthUserEntity.fromJson(data["user"] || { email, name: email });
        await this.prefs.setUser(user);
        
        console.log("Token:", token, "\nRefresh Token:", refreshToken, "\nUser:", user);
        return user;
      } else {
        const body = await response.json();
        throw new Error(`Login error: ${body.message}`);
      }
    } catch (e: any) {
      console.error("Login failed", e);
      throw e;
    }
  }

  async signUp(email: string, password: string): Promise<AuthUser> {
    try {
      const response = await fetch(`${this.baseUrl}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
          email: email,
          name: email.split("@")[0],
          password: password,
        }),
      });

      if (response.status === 201) {
        const data = await response.json();
        const user = AuthUserEntity.fromJson(data["user"] || { 
          email, 
          name: email.split("@")[0], 
          password 
        });
        await this.prefs.setUser(user);
        return user;
      } else {
        const body = await response.json();
        throw new Error(`Signup error: ${(body.message || []).join(" ")}`);
      }
    } catch (e: any) {
      console.error("Signup failed", e);
      throw e;
    }
  }

  async logOut(): Promise<void> {
    try {
      const token = await this.prefs.getAuthToken();
      if (!token) throw new Error("No token found");

      const response = await fetch(`${this.baseUrl}/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 201) {
        await this.prefs.clearAuth();
        await this.prefs.removeData("refreshToken");
        console.log("Logged out successfully");
        return Promise.resolve();
      } else {
        const body = await response.json();
        throw new Error(`Logout error: ${body.message}`);
      }
    } catch (e: any) {
      console.error("Logout failed", e);
      throw e;
    }
  }
  async validate(email: string, validationCode: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ email, code: validationCode }),
      });

      if (response.status === 201) {
        return true;
      } else {
        const body = await response.json();
        throw new Error(`Validation error: ${body.message}`);
      }
    } catch (e: any) {
      console.error("Validation failed", e);
      throw e;
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await this.prefs.retrieveData<string>(
        "refreshToken"
      );
      if (!refreshToken) throw new Error("No refresh token found");

      const response = await fetch(`${this.baseUrl}/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.status === 201) {
        const data = await response.json();
        const newToken = data["accessToken"];
        await this.prefs.setAuthToken(newToken);
        console.log("Token refreshed successfully");
        return true;
      } else {
        const body = await response.json();
        throw new Error(`Refresh token error: ${body.message}`);
      }
    } catch (e: any) {
      console.error("Refresh token failed", e);
      throw e;
    }
  }
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const token = await this.prefs.getAuthToken();
      if (!token) return null;

      const response = await fetch(`${this.baseUrl}/user`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        const data = await response.json();
        const user = AuthUserEntity.fromJson(data);
        await this.prefs.setUser(user);
        return user;
      } else {
        const body = await response.json();
        console.error(`Get current user error: ${body.message}`);
        return null;
      }
    } catch (e: any) {
      console.error("Get current user failed", e);
      return null;
    }
  }

  forgotPassword(email: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  resetPassword(
    email: string,
    newPassword: string,
    validationCode: string
  ): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  async verifyToken(): Promise<boolean> {
    try {
      const token = await this.prefs.getAuthToken();
      if (!token) return false;

      const response = await fetch(`${this.baseUrl}/verify-token`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        console.log("Token is valid");
        return true;
      } else {
        const body = await response.json();
        console.error(`Token verification error: ${body.message}`);
        return false;
      }
    } catch (e: any) {
      console.error("Verify token failed", e);
      return false;
    }
  }
}
