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
      json.name?.toString() ?? json.Name?.toString() ?? '',
      json.isRandomSelection ?? json.IsRandomSelection ?? json.IsRandom ?? false,
      json.groupSize ?? json.GroupSize ?? json.CourseSize ?? 0, // CourseSize is the correct column name
      json.courseID?.toString() ?? json.CourseID?.toString(),
      json.id?.toString() ?? json._id?.toString() ?? json.Id?.toString() ?? '0'
    );
  }

  toJson(): any {
    return {
      _id: this.id,
      name: this.name,
      courseID: this.courseID,
      isRandomSelection: this.isRandomSelection, // Keep camelCase for internal use
      IsRandom: this.isRandomSelection, // Database column name
      CourseSize: this.groupSize, // Database column name for group size
    };
  }
}