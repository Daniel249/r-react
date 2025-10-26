export interface Category {
  id?: string;
  name: string;
  courseID?: string;
  isRandomSelection: boolean;
  groupSize: number;
}

export class CategoryEntity implements Category {
  constructor(
    public name: string,
    public isRandomSelection: boolean,
    public groupSize: number,
    public courseID?: string,
    public id: string = '0'
  ) {}

  static fromJson(json: any): CategoryEntity {
    return new CategoryEntity(
      json.name?.toString() ?? '',
      json.isRandomSelection ?? false,
      json.groupSize ?? 0,
      json.courseID?.toString(),
      json.id?.toString() ?? json._id?.toString() ?? '0'
    );
  }

  toJson(): any {
    return {
      _id: this.id,
      name: this.name,
      courseID: this.courseID,
      isRandomSelection: this.isRandomSelection,
      groupSize: this.groupSize,
    };
  }
}