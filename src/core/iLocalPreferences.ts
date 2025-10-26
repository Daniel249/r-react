
import { AuthUser } from '../features/auth/domain/entities/AuthUser';

export interface ILocalPreferences {
    storeData <T>(key: string, value: T) :Promise<void>;
    retrieveData <T>(key: string): Promise<T | null>;
    removeData (key: string): Promise<void>;

    storeEntry<T>(key: string, entry: T): Promise<void>;
    getAllEntries<T>(key: string): Promise<T[]>;
    replaceEntries<T>(key: string, entries: T[]): Promise<void>;

    clearAll(): Promise<void>;

    // Auth-specific methods
    getAuthToken(): Promise<string | null>;
    setAuthToken(token: string): Promise<void>;
    getUser(): Promise<AuthUser | null>;
    setUser(user: AuthUser): Promise<void>;
    clearAuth(): Promise<void>;
}