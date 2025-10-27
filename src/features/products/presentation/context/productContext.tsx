// src/context/productContext.tsx
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { NewProduct, Product } from "@/src/features/products/domain/entities/Product";
import { useAuth } from "../../../auth/presentation/context/authContext";
import { ActivityEntity } from "../../domain/entities/Activity";
import { CategoryEntity } from "../../domain/entities/Category";
import { GroupEntity } from "../../domain/entities/Group";
import { ActivityUseCase } from "../../domain/usecases/ActivityUseCase";
import { AddProductUseCase } from "../../domain/usecases/AddProductUseCase";
import { CategoryUseCase } from "../../domain/usecases/CategoryUseCase";
import { DeleteProductUseCase } from "../../domain/usecases/DeleteProductUseCase";
import { GetProductByIdUseCase } from "../../domain/usecases/GetProductByIdUseCase";
import { GetProductsUseCase } from "../../domain/usecases/GetProductsUseCase";
import { GroupUseCase } from "../../domain/usecases/GroupUseCase";
import { UpdateProductUseCase } from "../../domain/usecases/UpdateProductUseCase";
import { ActivityController, CategoryController, GroupController } from "../controllers";

// --- Context ---
type ProductContextType = {
  products: Product[];
  categories: CategoryEntity[];
  activities: ActivityEntity[];
  groups: GroupEntity[];
  isLoading: boolean;
  error: string | null;
  addProduct: (product: NewProduct) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => Promise<Product | undefined>;
  refreshProducts: () => Promise<void>;
  loadCategoriesForCourse: (courseId: string) => Promise<void>;
  loadActivitiesForCourse: (courseId: string) => Promise<void>;
  loadGroupsForCourse: (courseId: string) => Promise<void>;
  loadAllGroupsForCourse: (courseId: string) => Promise<any[]>;
  // Category CRUD
  addCategory: (name: string, courseId: string, isRandomSelection: boolean, groupSize: number) => Promise<CategoryEntity>;
  updateCategory: (category: CategoryEntity) => Promise<void>;
  deleteCategory: (categoryId: string, courseId: string) => Promise<void>;
  // Activity CRUD
  addActivity: (name: string, description: string, courseId: string, categoryId: string, isAssessment: boolean) => Promise<boolean>;
  updateActivity: (activity: ActivityEntity, courseId: string) => Promise<void>;
  deleteActivity: (activity: ActivityEntity, courseId: string) => Promise<void>;
  activateAssessment: (activityId: string, assessName: string, isPublic: boolean, duration: number, timeUnit: string) => Promise<ActivityEntity>;
  // Group CRUD  
  addGroup: (name: string, categoryId: string, courseId: string, studentsNames: string[]) => Promise<GroupEntity>;
  updateGroup: (group: GroupEntity, courseId: string) => Promise<void>;
  deleteGroup: (groupId: string, courseId: string) => Promise<void>;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const di = useDI();

  const addProductUC = di.resolve<AddProductUseCase>(TOKENS.AddProductUC);
  const updateProductUC = di.resolve<UpdateProductUseCase>(TOKENS.UpdateProductUC);
  const deleteProductUC = di.resolve<DeleteProductUseCase>(TOKENS.DeleteProductUC);
  const getProductsUC = di.resolve<GetProductsUseCase>(TOKENS.GetProductsUC);
  const getProductByIdUC = di.resolve<GetProductByIdUseCase>(TOKENS.GetProductByIdUC);
  const categoryUC = di.resolve<CategoryUseCase>(TOKENS.CategoryUC);
  const activityUC = di.resolve<ActivityUseCase>(TOKENS.ActivityUC);
  const groupUC = di.resolve<GroupUseCase>(TOKENS.GroupUC);

  // Create controller instances
  const categoryController = new CategoryController(categoryUC);
  const activityController = new ActivityController(activityUC);
  const groupController = new GroupController(groupUC);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryEntity[]>([]);
  const [activities, setActivities] = useState<ActivityEntity[]>([]);
  const [groups, setGroups] = useState<GroupEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load products initially
  useEffect(() => {
    refreshProducts();
  }, []);

  const refreshProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const list = await getProductsUC.execute();
      setProducts(list);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const addProduct = async (product: NewProduct) => {
    try {
      setIsLoading(true);
      setError(null);
      await addProductUC.execute(product);
      await refreshProducts();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      setIsLoading(true);
      setError(null);
      await updateProductUC.execute(product);
      await refreshProducts();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const removeProduct = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await deleteProductUC.execute(id);
      await refreshProducts();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const getProduct = async (id: string) => {
    console.log("Getting product with id:", id);
    try {
      setIsLoading(true);
      setError(null);
      return await getProductByIdUC.execute(id);
    } catch (e) {
      setError((e as Error).message);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategoriesForCourse = async (courseId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔍 Loading categories for course ID:', courseId);
      const categoriesList = await categoryUC.getCategories(courseId);
      console.log('📋 Categories loaded from API:', categoriesList);
      setCategories(categoriesList);
    } catch (e) {
      setError((e as Error).message);
      console.error('❌ Error loading categories:', e);
      // Ensure empty list on error - no fallback mock data
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadActivitiesForCourse = async (courseId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔍 Loading activities for course ID:', courseId);
      const activitiesList = await activityUC.getActivities(courseId);
      console.log('📝 Activities loaded from API:', activitiesList);
      setActivities(activitiesList);
    } catch (e) {
      setError((e as Error).message);
      console.error('❌ Error loading activities:', e);
      // Ensure empty list on error - no fallback mock data
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGroupsForCourse = async (courseId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔍 Loading groups for course ID:', courseId);
      
      // First get all groups (they don't have CourseID)
      const allGroups = await groupUC.getGroups();
      console.log('👥 All groups loaded from API:', allGroups);
      
      // Then get categories for this course to filter groups
      const courseCategories = await categoryUC.getCategories(courseId);
      console.log('🏷️ Course categories:', courseCategories.map(c => c.id));
      const categoryIds = courseCategories.map(c => c.id);
      
      console.log('👤 Current user name:', user?.name);
      
      // Filter groups that belong to categories from this course AND where user is a member
      const courseGroups = allGroups.filter(group => {
        const isCourseGroup = group.categoryId && categoryIds.includes(group.categoryId);
        const isUserMember = user && group.studentsNames && group.studentsNames.includes(user.name);
        
        console.log(`🔍 Group "${group.name}":`, {
          categoryId: group.categoryId,
          isCourseGroup,
          studentsNames: group.studentsNames,
          isUserMember,
          included: isCourseGroup && isUserMember
        });
        
        return isCourseGroup && isUserMember;
      });
      console.log('👥 Filtered groups for course and user membership:', courseGroups);
      
      setGroups(courseGroups);
    } catch (e) {
      setError((e as Error).message);
      console.error('❌ Error loading groups:', e);
      // Ensure empty list on error - no fallback mock data
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllGroupsForCourse = async (courseId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔍 Loading ALL groups for course ID (including groups user is not in):', courseId);
      
      // First get all groups (they don't have CourseID)
      const allGroups = await groupUC.getGroups();
      console.log('👥 All groups loaded from API:', allGroups);
      
      // Then get categories for this course to filter groups
      const courseCategories = await categoryUC.getCategories(courseId);
      console.log('🏷️ Course categories:', courseCategories.map(c => c.id));
      const categoryIds = courseCategories.map(c => c.id);
      
      // Filter groups that belong to categories from this course (NO user membership filter)
      const courseGroups = allGroups.filter(group => {
        const isCourseGroup = group.categoryId && categoryIds.includes(group.categoryId);
        
        console.log(`🔍 Group "${group.name}":`, {
          categoryId: group.categoryId,
          isCourseGroup,
          studentsNames: group.studentsNames,
          included: isCourseGroup
        });
        
        return isCourseGroup;
      });
      console.log('👥 ALL course groups (for joining):', courseGroups);
      
      return courseGroups; // Return groups instead of setting state
    } catch (e) {
      setError((e as Error).message);
      console.error('❌ Error loading all groups for course:', e);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Category CRUD methods
  const addCategory = async (name: string, courseId: string, isRandomSelection: boolean, groupSize: number): Promise<CategoryEntity> => {
    try {
      console.log('📝 [CONTEXT] Starting category creation flow with params:', { name, courseId, isRandomSelection, groupSize });
      setIsLoading(true);
      setError(null);
      
      console.log('📝 [CONTEXT] About to call categoryController.createCategory...');
      
      // Use controller layer (Controller → UseCase → Repository → Remote)
      const category = await categoryController.createCategory(name, isRandomSelection, groupSize, courseId);
      console.log('📝 [CONTEXT] Controller returned category:', category);
      
      // Refresh the complete categories list from server to ensure we have the latest data
      console.log('🔄 [CONTEXT] Refreshing categories list from server...');
      await loadCategoriesForCourse(courseId);
      console.log('✅ [CONTEXT] Categories list refreshed from server');
      
      return category;
    } catch (e) {
      setError((e as Error).message);
      console.error('❌ [CONTEXT] Error adding category:', e);
      console.error('❌ [CONTEXT] Error stack:', (e as Error).stack);
      throw e;
    } finally {
      console.log('📝 [CONTEXT] Finally block - setting isLoading to false');
      setIsLoading(false);
    }
  };

  const updateCategory = async (category: CategoryEntity): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('📝 [CONTEXT] Starting category update flow...');
      
      // Use controller layer (Controller → UseCase → Repository → Remote)
      await categoryController.updateCategory(category);
      console.log('📝 [CONTEXT] Controller completed category update');
      
      // Refresh the complete categories list from server
      if (category.courseID) {
        console.log('🔄 [CONTEXT] Refreshing categories list from server...');
        await loadCategoriesForCourse(category.courseID);
        console.log('✅ [CONTEXT] Categories list refreshed from server');
      }
    } catch (e) {
      setError((e as Error).message);
      console.error('❌ [CONTEXT] Error updating category:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (categoryId: string, courseId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('📝 [CONTEXT] Starting category deletion flow...');
      
      // Use controller layer (Controller → UseCase → Repository → Remote)
      await categoryController.deleteCategory(categoryId);
      console.log('📝 [CONTEXT] Controller completed category deletion');
      
      // Refresh the complete categories list from server
      console.log('🔄 [CONTEXT] Refreshing categories list from server...');
      await loadCategoriesForCourse(courseId);
      console.log('✅ [CONTEXT] Categories list refreshed from server');
    } catch (e) {
      setError((e as Error).message);
      console.error('❌ [CONTEXT] Error deleting category:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Activity CRUD methods
  const addActivity = async (name: string, description: string, courseId: string, categoryId: string, isAssessment: boolean): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('➕ [CONTEXT] Starting activity creation:', name);
      
      // Use controller layer (Controller → UseCase → Repository → Remote)
      const success = await activityController.createActivity(name, description, courseId, categoryId, isAssessment);
      console.log('✅ [CONTEXT] Controller returned success:', success);
      
      if (success) {
        // Refresh the activities list from server
        await loadActivitiesForCourse(courseId);
      }
      
      return success;
    } catch (e) {
      setError((e as Error).message);
      console.error('❌ [CONTEXT] Error adding activity:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const updateActivity = async (activity: ActivityEntity, courseId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('📝 [CONTEXT] Starting activity update flow...');
      
      // Use controller layer (Controller → UseCase → Repository → Remote)
      await activityController.updateActivity(activity);
      console.log('📝 [CONTEXT] Controller completed activity update');
      
      // Refresh the complete activities list from server
      console.log('🔄 [CONTEXT] Refreshing activities list from server...');
      await loadActivitiesForCourse(courseId);
      console.log('✅ [CONTEXT] Activities list refreshed from server');
    } catch (e) {
      setError((e as Error).message);
      console.error('❌ [CONTEXT] Error updating activity:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteActivity = async (activity: ActivityEntity, courseId: string): Promise<void> => {
    console.log('🔴 [CONTEXT] DELETE ACTIVITY CALLED!!! Activity:', activity, 'CourseId:', courseId);
    try {
      setIsLoading(true);
      setError(null);
      console.log('📝 [CONTEXT] Starting activity deletion flow...', activity);
      
      // Use controller layer (Controller → UseCase → Repository → Remote)
      await activityController.deleteActivity(activity);
      console.log('📝 [CONTEXT] Controller completed activity deletion');
      
      // Refresh the complete activities list from server
      console.log('🔄 [CONTEXT] Refreshing activities list from server...');
      await loadActivitiesForCourse(courseId);
      console.log('✅ [CONTEXT] Activities list refreshed from server');
    } catch (e) {
      setError((e as Error).message);
      console.error('❌ [CONTEXT] Error deleting activity:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Group CRUD methods
  const addGroup = async (name: string, categoryId: string, courseId: string, studentsNames: string[]): Promise<GroupEntity> => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('� [CONTEXT] Starting group creation flow...');
      
      // Use controller layer (Controller → UseCase → Repository → Remote)
      const group = await groupController.createGroup(name, studentsNames, categoryId);
      console.log('📝 [CONTEXT] Controller returned group:', group);
      
      // Refresh the complete groups list from server
      console.log('🔄 [CONTEXT] Refreshing groups list from server...');
      await loadGroupsForCourse(courseId);
      console.log('✅ [CONTEXT] Groups list refreshed from server');
      
      return group;
    } catch (e) {
      setError((e as Error).message);
      console.error('❌ [CONTEXT] Error adding group:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const updateGroup = async (group: GroupEntity, courseId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('� [CONTEXT] Starting group update flow...');
      
      // Use controller layer (Controller → UseCase → Repository → Remote)
      await groupController.updateGroup(group);
      console.log('📝 [CONTEXT] Controller completed group update');
      
      // Refresh the complete groups list from server
      console.log('🔄 [CONTEXT] Refreshing groups list from server...');
      await loadGroupsForCourse(courseId);
      console.log('✅ [CONTEXT] Groups list refreshed from server');
    } catch (e) {
      setError((e as Error).message);
      console.error('❌ [CONTEXT] Error updating group:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGroup = async (groupId: string, courseId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('� [CONTEXT] Starting group deletion flow...');
      
      // Use controller layer (Controller → UseCase → Repository → Remote)
      await groupController.deleteGroup(groupId);
      console.log('📝 [CONTEXT] Controller completed group deletion');
      
      // Refresh the complete groups list from server
      console.log('🔄 [CONTEXT] Refreshing groups list from server...');
      await loadGroupsForCourse(courseId);
      console.log('✅ [CONTEXT] Groups list refreshed from server');
    } catch (e) {
      setError((e as Error).message);
      console.error('❌ [CONTEXT] Error deleting group:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const activateAssessment = async (activityId: string, assessName: string, isPublic: boolean, duration: number, timeUnit: string): Promise<ActivityEntity> => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🎯 [ACTIVITIES] Activating assessment for activity:', activityId, {assessName, isPublic, duration, timeUnit});
      
      // Find the existing activity in local state
      const existingActivity = activities.find(activity => activity.id === activityId);
      if (!existingActivity) {
        throw new Error(`Activity with ID ${activityId} not found in local state`);
      }
      
      // Update the activity through the use case (calls repository/remote)
      const partialUpdate = await activityUC.activateAssessment(activityId, assessName, isPublic, duration, timeUnit);
      console.log('✅ [ACTIVITIES] Assessment activated, partial update:', partialUpdate);
      
      // Merge the assessment updates with the existing activity data
      const fullyUpdatedActivity = new ActivityEntity(
        existingActivity.name,
        existingActivity.description,
        existingActivity.course,
        existingActivity.category,
        true, // assessment = true
        existingActivity.notas,
        existingActivity.id,
        existingActivity.studentAverages,
        assessName, // Set assessName
        isPublic, // Set isPublic
        partialUpdate.time, // Use calculated time from UseCase
        existingActivity.already
      );
      
      // Update the local activities state to reflect the change
      setActivities(prev => prev.map(activity => 
        activity.id === activityId ? fullyUpdatedActivity : activity
      ));
      
      console.log('✅ [ACTIVITIES] Activity updated in local state:', fullyUpdatedActivity);
      return fullyUpdatedActivity;
    } catch (e) {
      setError((e as Error).message);
      console.error('❌ [ACTIVITIES] Error activating assessment:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      products,
      categories,
      activities,
      groups,
      isLoading,
      error,
      addProduct,
      updateProduct,
      removeProduct,
      getProduct,
      refreshProducts,
      loadCategoriesForCourse,
      loadActivitiesForCourse,
      loadGroupsForCourse,
      loadAllGroupsForCourse,
      // Category CRUD
      addCategory,
      updateCategory,
      deleteCategory,
      // Activity CRUD
      addActivity,
      updateActivity,
      deleteActivity,
      activateAssessment,
      // Group CRUD
      addGroup,
      updateGroup,
      deleteGroup,
    }),
    [products, categories, activities, groups, isLoading, error]
  );

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) {
    throw new Error("useProducts must be used inside ProductProvider");
  }
  return ctx;
}
