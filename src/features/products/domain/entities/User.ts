export interface User {
  id?: string;
  name: string;
  role?: 'student' | 'teacher';
}

export class UserEntity implements User {
  constructor(
    public name: string,
    public id?: string,
    public role?: 'student' | 'teacher'
  ) {}

  static fromJson(json: any): UserEntity {
    return new UserEntity(
      json.name?.toString() ?? '',
      json.id?.toString() ?? json._id?.toString(),
      json.role as 'student' | 'teacher'
    );
  }

  toJson(): any {
    return {
      _id: this.id,
      name: this.name,
      role: this.role,
    };
  }
}