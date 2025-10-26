export interface AuthUser {
  id?: number;
  email: string;
  name: string;
  password: string;
  role?: 'student' | 'teacher';
}

export class AuthUserEntity implements AuthUser {
  constructor(
    public email: string,
    public name: string,
    public password: string,
    public id?: number,
    public role?: 'student' | 'teacher'
  ) {}

  static fromJson(json: any): AuthUserEntity {
    return new AuthUserEntity(
      json.email?.toString() ?? '',
      json.name?.toString() ?? '',
      json.password?.toString() ?? '',
      json.id ? parseInt(json.id.toString()) : undefined,
      json.role as 'student' | 'teacher'
    );
  }

  toJson(): any {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      password: this.password,
      role: this.role,
    };
  }
}
