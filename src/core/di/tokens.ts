export const TOKENS = {
  AuthRemoteDS: Symbol("AuthRemoteDS"),
  AuthRepo: Symbol("AuthRepo"),
  LoginUC: Symbol("LoginUC"),
  SignupUC: Symbol("SignupUC"),
  LogoutUC: Symbol("LogoutUC"),
  GetCurrentUserUC: Symbol("GetCurrentUserUC"),
  ProductRemoteDS: Symbol("ProductRemoteDS"),
  ProductRepo: Symbol("ProductRepo"),
  AddProductUC: Symbol("AddProductUC"),
  UpdateProductUC: Symbol("UpdateProductUC"),
  DeleteProductUC: Symbol("DeleteProductUC"),
  GetProductsUC: Symbol("GetProductsUC"),
  GetProductByIdUC: Symbol("GetProductByIdUC"),
  // Course tokens
  CourseRemoteDS: Symbol("CourseRemoteDS"),
  CourseRepo: Symbol("CourseRepo"),
  CourseUC: Symbol("CourseUC"),
  // Category tokens
  CategoryRemoteDS: Symbol("CategoryRemoteDS"),
  CategoryRepo: Symbol("CategoryRepo"),
  CategoryUC: Symbol("CategoryUC"),
  // Activity tokens
  ActivityRemoteDS: Symbol("ActivityRemoteDS"),
  ActivityRepo: Symbol("ActivityRepo"),
  ActivityUC: Symbol("ActivityUC"),
  UpdateAssessmentResultsUC: Symbol("UpdateAssessmentResultsUC"),
  // Group tokens
  GroupRemoteDS: Symbol("GroupRemoteDS"),
  GroupRepo: Symbol("GroupRepo"),
  GroupUC: Symbol("GroupUC"),
} as const;
