import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  Card,
  Chip,
  Dialog,
  IconButton,
  List,
  Paragraph,
  Portal,
  Surface,
  Switch,
  Text,
  TextInput,
  Title
} from 'react-native-paper';
import { useAuth } from '../../../auth/presentation/context/authContext';
import { CourseEntity } from '../../domain/entities/Course';
import { useCourse } from '../context/courseContext';
import { useProducts } from '../context/productContext';

interface TeacherCourseDetailScreenProps {
  route: {
    params: {
      course: CourseEntity;
    };
  };
  navigation: any;
}

export default function TeacherCourseDetailScreen({ route, navigation }: any) {
  const { course } = route.params;
  const { user } = useAuth();
  const { updateCourse, deleteCourse } = useCourse();
  const { categories, activities, loadCategoriesForCourse, loadActivitiesForCourse, addCategory, deleteCategory, addActivity, deleteActivity, activateAssessment } = useProducts();
  
  const [activeTab, setActiveTab] = useState<'description' | 'activities' | 'categories'>('description');
  const [isLoading, setIsLoading] = useState(true);
  const [updateDescriptionVisible, setUpdateDescriptionVisible] = useState(false);
  const [addStudentVisible, setAddStudentVisible] = useState(false);
  const [addCategoryVisible, setAddCategoryVisible] = useState(false);
  const [addActivityVisible, setAddActivityVisible] = useState(false);
  const [activateAssessmentVisible, setActivateAssessmentVisible] = useState(false);
  const [deleteActivityVisible, setDeleteActivityVisible] = useState(false);
  const [deleteCategoryVisible, setDeleteCategoryVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [activityToDelete, setActivityToDelete] = useState<any>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);

  // Form states
  const [newDescription, setNewDescription] = useState(course.description);
  const [newStudentName, setNewStudentName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [groupSize, setGroupSize] = useState('4');
  const [isRandomSelection, setIsRandomSelection] = useState(false);
  const [activityName, setActivityName] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  
  // Assessment dialog states
  const [assessmentName, setAssessmentName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [duration, setDuration] = useState('10');
  const [unit, setUnit] = useState('minutes');

  const courseId = course.id || course._id;

  useEffect(() => {
    if (courseId) {
      loadCourseData();
    } else {
      console.error('❌ [TEACHER] No valid course ID found!');
    }
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setIsLoading(true);
      console.log('🏫 [TEACHER] Loading course data for course ID:', courseId);
      await Promise.all([
        loadCategoriesForCourse(courseId),
        loadActivitiesForCourse(courseId)
      ]);
      console.log('✅ [TEACHER] Loaded categories:', categories);
      console.log('✅ [TEACHER] Loaded activities:', activities);
    } catch (error) {
      console.error('❌ [TEACHER] Error loading course data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDescription = async () => {
    try {
      await updateCourse(course.id, course.name, newDescription);
      setUpdateDescriptionVisible(false);
      // Update local course object
      course.description = newDescription;
    } catch (error) {
      console.error('Failed to update description:', error);
      Alert.alert('Error', 'Failed to update description');
    }
  };

  const handleAddStudent = async () => {
    try {
      const updatedStudents = [...course.studentsNames, newStudentName];
      course.studentsNames = updatedStudents;
      await updateCourse(course.id, course.name, course.description);
      setAddStudentVisible(false);
      setNewStudentName('');
    } catch (error) {
      console.error('Failed to add student:', error);
      Alert.alert('Error', 'Failed to add student');
    }
  };

  const handleDeleteStudent = async (index: number) => {
    Alert.alert(
      'Delete Student',
      'Are you sure you want to remove this student from the course?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedStudents = [...course.studentsNames];
              updatedStudents.splice(index, 1);
              course.studentsNames = updatedStudents;
              await updateCourse(course.id, course.name, course.description);
            } catch (error) {
              console.error('Failed to delete student:', error);
              Alert.alert('Error', 'Failed to remove student');
            }
          }
        }
      ]
    );
  };

  const handleDeleteCourse = async () => {
    Alert.alert(
      'Delete Course',
      'Are you sure you want to delete this course? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCourse(course.id);
              navigation.goBack();
            } catch (error) {
              console.error('Failed to delete course:', error);
              Alert.alert('Error', 'Failed to delete course');
            }
          }
        }
      ]
    );
  };

  const handleAddCategory = async () => {
    if (categoryName.trim()) {
      try {
        console.log('➕ [TEACHER] Adding category:', {
          name: categoryName.trim(),
          isRandomSelection,
          groupSize: parseInt(groupSize) || 4,
          courseId
        });
        
        const result = await addCategory(
          categoryName.trim(),
          courseId,
          isRandomSelection,
          parseInt(groupSize) || 4
        );
        
        if (result) {
          console.log('✅ [TEACHER] Category created successfully');
          Alert.alert('Success', 'Category added successfully');
        } else {
          console.log('❌ [TEACHER] Category creation failed');
          Alert.alert('Error', 'Failed to add category');
        }
        
        setCategoryName('');
        setGroupSize('4');
        setIsRandomSelection(false);
        setAddCategoryVisible(false);
      } catch (error) {
        console.error('❌ [TEACHER] Error adding category:', error);
        Alert.alert('Error', 'Failed to add category');
      }
    }
  };

  const handleDeleteCategory = (category: any) => {
    console.log('🔴 [TEACHER_UI] Delete category button clicked for:', category);
    console.log('🔴 [TEACHER_UI] Setting up category delete confirmation dialog...');
    setCategoryToDelete(category);
    setDeleteCategoryVisible(true);
  };

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    console.log('🔴 [TEACHER_UI] User confirmed category deletion, starting process...');
    try {
      console.log('🗑️ [TEACHER] Starting category deletion:', categoryToDelete.id);
      
      await deleteCategory(categoryToDelete.id, courseId);
      console.log('✅ [TEACHER] Category deleted successfully');
      Alert.alert('Success', 'Category deleted successfully');
    } catch (error) {
      console.error('❌ [TEACHER] Error deleting category:', error);
      Alert.alert('Error', 'Failed to delete category');
    } finally {
      setDeleteCategoryVisible(false);
      setCategoryToDelete(null);
    }
  };

  const handleAddActivity = async () => {
    if (activityName.trim() && selectedCategory) {
      try {
        console.log('➕ [TEACHER] Adding activity:', {
          name: activityName.trim(),
          description: activityDescription.trim(),
          categoryId: selectedCategory.id,
          courseId
        });
        
        const result = await addActivity(
          activityName.trim(),
          activityDescription.trim(),
          courseId,
          selectedCategory.id,
          false // isAssessment defaults to false
        );
        
        if (result) {
          console.log('✅ [TEACHER] Activity created successfully');
          Alert.alert('Success', 'Activity added successfully');
        } else {
          console.log('❌ [TEACHER] Activity creation failed');
          Alert.alert('Error', 'Failed to add activity');
        }
        
        setActivityName('');
        setActivityDescription('');
        setAddActivityVisible(false);
        setSelectedCategory(null);
      } catch (error) {
        console.error('❌ [TEACHER] Error adding activity:', error);
        Alert.alert('Error', 'Failed to add activity');
      }
    }
  };

  const handleDeleteActivity = (activity: any) => {
    console.log('🔴 [TEACHER_UI] Delete button clicked for activity:', activity);
    console.log('🔴 [TEACHER_UI] Setting up delete confirmation dialog...');
    setActivityToDelete(activity);
    setDeleteActivityVisible(true);
  };

  const handleConfirmDeleteActivity = async () => {
    if (!activityToDelete) return;
    
    console.log('🔴 [TEACHER_UI] User confirmed deletion, starting process...');
    try {
      console.log('🗑️ [TEACHER] Starting activity deletion:', activityToDelete);
      console.log('🗑️ [TEACHER] About to call deleteActivity function. CourseId:', courseId);
      console.log('🗑️ [TEACHER] deleteActivity function exists?', typeof deleteActivity);
      
      await deleteActivity(activityToDelete, courseId);
      console.log('✅ [TEACHER] Activity deleted successfully');
      Alert.alert('Success', 'Activity deleted successfully');
    } catch (error) {
      console.error('❌ [TEACHER] Error deleting activity:', error);
      Alert.alert('Error', 'Failed to delete activity');
    } finally {
      setDeleteActivityVisible(false);
      setActivityToDelete(null);
    }
  };

  const handleActivateAssessment = (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    setSelectedActivity(activity);
    setActivateAssessmentVisible(true);
  };

  const handleConfirmActivateAssessment = async () => {
    if (selectedActivity && assessmentName.trim()) {
      try {
        console.log('🎯 [TEACHER] Activating assessment:', {
          activityId: selectedActivity.id,
          assessmentName: assessmentName.trim(),
          isPublic,
          duration: parseInt(duration),
          unit
        });
        
        const result = await activateAssessment(
          selectedActivity.id,
          assessmentName.trim(),
          isPublic,
          parseInt(duration),
          unit
        );
        
        if (result) {
          console.log('✅ [TEACHER] Assessment activated successfully');
          Alert.alert('Success', 'Assessment activated successfully');
          await loadActivitiesForCourse(courseId); // Refresh activities to show updated assessment
        } else {
          console.log('❌ [TEACHER] Assessment activation failed');
          Alert.alert('Error', 'Failed to activate assessment');
        }
        
        // Reset form
        setAssessmentName('');
        setIsPublic(true);
        setDuration('10');
        setUnit('minutes');
        setActivateAssessmentVisible(false);
        setSelectedActivity(null);
      } catch (error) {
        console.error('❌ [TEACHER] Error activating assessment:', error);
        Alert.alert('Error', 'Failed to activate assessment');
        
        // Reset form on error as well
        setAssessmentName('');
        setIsPublic(true);
        setDuration('10');
        setUnit('minutes');
        setActivateAssessmentVisible(false);
        setSelectedActivity(null);
      }
    }
  };

  const DescriptionTab = () => (
    <ScrollView style={styles.tabContent}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title>Course Description</Title>
            <IconButton 
              icon="pencil"
              onPress={() => setUpdateDescriptionVisible(true)}
            />
          </View>
          <Paragraph style={styles.description}>{course.description}</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title>Students ({course.studentsNames.length})</Title>
            <IconButton 
              icon="plus"
              onPress={() => setAddStudentVisible(true)}
            />
          </View>
          <View style={styles.studentsContainer}>
            {course.studentsNames.map((student: string, index: number) => (
              <View key={index} style={styles.studentRow}>
                <Chip style={styles.studentChip}>
                  {student}
                </Chip>
                <IconButton 
                  icon="delete"
                  size={20}
                  onPress={() => handleDeleteStudent(index)}
                />
              </View>
            ))}
            {course.studentsNames.length === 0 && (
              <Text style={styles.emptyText}>No students enrolled yet</Text>
            )}
          </View>
        </Card.Content>
      </Card>

      <View style={styles.actionButtons}>
        <Button 
          mode="outlined" 
          onPress={() => setUpdateDescriptionVisible(true)}
          style={styles.actionButton}
        >
          Update Description
        </Button>
        <Button 
          mode="contained-tonal"
          buttonColor="#ffebee"
          textColor="#d32f2f"
          onPress={handleDeleteCourse}
          style={styles.actionButton}
        >
          Delete Course
        </Button>
      </View>
    </ScrollView>
  );

  const ActivitiesTab = () => {
    console.log('🔴 [TEACHER_UI] ActivitiesTab rendering. Activities count:', activities.length, 'Activities:', activities);
    return (
      <ScrollView style={styles.tabContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Activities</Title>
            {activities.length === 0 ? (
              <Paragraph>No activities created yet. Add categories first to create activities.</Paragraph>
            ) : (
            activities.map((activity) => {
              const category = categories.find(c => c.id === activity.category);
              return (
                <List.Item
                  key={activity.id}
                  title={activity.name}
                  description={`${activity.description}\nCategory: ${category?.name || 'Unknown'}`}
                  left={() => <List.Icon icon={activity.assessment ? "check-circle" : "circle-outline"} />}
                  right={() => (
                    <View style={styles.listItemActions}>
                      {!activity.assessment && activity.id && (
                        <IconButton 
                          icon="play-circle"
                          iconColor="#4CAF50"
                          onPress={() => handleActivateAssessment(activity.id!)}
                        />
                      )}
                      {activity.id && (
                        <IconButton 
                          icon="delete"
                          iconColor="#f44336"
                          onPress={() => handleDeleteActivity(activity)}
                        />
                      )}
                    </View>
                  )}
                />
              );
              })
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    );
  };

  const CategoriesTab = () => (
    <ScrollView style={styles.tabContent}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title>Categories</Title>
            <IconButton 
              icon="plus"
              onPress={() => setAddCategoryVisible(true)}
            />
          </View>
          {categories.map((category) => (
            <List.Item
              key={category.id}
              title={category.name}
              description={`${category.isRandomSelection ? 'Random Selection' : 'Self-Organized'} • Group Size: ${category.groupSize}`}
              right={() => (
                <View style={styles.listItemActions}>
                  <IconButton 
                    icon="plus"
                    onPress={() => {
                      setSelectedCategory(category);
                      setAddActivityVisible(true);
                    }}
                  />
                  <IconButton 
                    icon="delete"
                    iconColor="#f44336"
                    onPress={() => handleDeleteCategory(category)}
                  />
                </View>
              )}
            />
          ))}
          {categories.length === 0 && (
            <Text style={styles.emptyText}>No categories created yet</Text>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return <DescriptionTab />;
      case 'activities':
        return <ActivitiesTab />;
      case 'categories':
        return <CategoriesTab />;
      default:
        return <DescriptionTab />;
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={course.name} />
        <Appbar.Action 
          icon="pencil" 
          onPress={() => navigation.navigate('UpdateCourseScreen', { course })} 
        />
      </Appbar.Header>

      <Surface style={styles.tabBar}>
        <View style={styles.tabButtons}>
          <Button 
            mode={activeTab === 'description' ? 'contained' : 'text'} 
            onPress={() => setActiveTab('description')}
            style={styles.tabButton}
          >
            Description
          </Button>
          <Button 
            mode={activeTab === 'activities' ? 'contained' : 'text'} 
            onPress={() => setActiveTab('activities')}
            style={styles.tabButton}
          >
            Activities
          </Button>
          <Button 
            mode={activeTab === 'categories' ? 'contained' : 'text'} 
            onPress={() => setActiveTab('categories')}
            style={styles.tabButton}
          >
            Categories
          </Button>
        </View>
      </Surface>

      <View style={styles.content}>
        {renderTabContent()}
      </View>

      {/* Update Description Dialog */}
      <Portal>
        <Dialog visible={updateDescriptionVisible} onDismiss={() => setUpdateDescriptionVisible(false)}>
          <Dialog.Title>Update Description</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Course Description"
              value={newDescription}
              onChangeText={setNewDescription}
              multiline
              numberOfLines={4}
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setUpdateDescriptionVisible(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleUpdateDescription}>Update</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Add Student Dialog */}
      <Portal>
        <Dialog visible={addStudentVisible} onDismiss={() => setAddStudentVisible(false)}>
          <Dialog.Title>Add Student</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Student Name"
              value={newStudentName}
              onChangeText={setNewStudentName}
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddStudentVisible(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleAddStudent} disabled={!newStudentName.trim()}>
              Add
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Add Category Dialog */}
      <Portal>
        <Dialog visible={addCategoryVisible} onDismiss={() => setAddCategoryVisible(false)}>
          <Dialog.Title>Add Category</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Category Name"
              value={categoryName}
              onChangeText={setCategoryName}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Group Size"
              value={groupSize}
              onChangeText={setGroupSize}
              keyboardType="numeric"
              mode="outlined"
              style={styles.dialogInput}
            />
            <View style={styles.switchRow}>
              <Text>Random Selection</Text>
              <Switch value={isRandomSelection} onValueChange={setIsRandomSelection} />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddCategoryVisible(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleAddCategory} disabled={!categoryName.trim()}>
              Add
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Add Activity Dialog */}
      <Portal>
        <Dialog visible={addActivityVisible} onDismiss={() => setAddActivityVisible(false)}>
          <Dialog.Title>Add Activity to {selectedCategory?.name}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Activity Name"
              value={activityName}
              onChangeText={setActivityName}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Description"
              value={activityDescription}
              onChangeText={setActivityDescription}
              multiline
              numberOfLines={3}
              mode="outlined"
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddActivityVisible(false)}>Cancel</Button>
            <Button 
              mode="contained" 
              onPress={handleAddActivity} 
              disabled={!activityName.trim() || !activityDescription.trim()}
            >
              Add
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Activate Assessment Dialog */}
      <Portal>
        <Dialog visible={activateAssessmentVisible} onDismiss={() => setActivateAssessmentVisible(false)}>
          <Dialog.Title>Activate Assessment</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Assessment Name"
              value={assessmentName}
              onChangeText={setAssessmentName}
              mode="outlined"
              style={styles.dialogInput}
            />
            
            <View style={styles.switchRow}>
              <Text>Public</Text>
              <Switch value={isPublic} onValueChange={setIsPublic} />
            </View>
            
            <Text style={styles.sectionLabel}>Duration</Text>
            <View style={styles.durationRow}>
              <View style={styles.durationInput}>
                <Text style={styles.inputLabel}>Duration</Text>
                <View style={styles.durationPickerContainer}>
                  {['10', '30', '60'].map((value) => (
                    <Button 
                      key={value}
                      mode={duration === value ? 'contained' : 'outlined'}
                      onPress={() => setDuration(value)}
                      style={styles.durationButton}
                      compact
                    >
                      {value}
                    </Button>
                  ))}
                </View>
              </View>
              <View style={styles.unitPickerContainer}>
                <Button 
                  mode={unit === 'minutes' ? 'contained' : 'outlined'}
                  onPress={() => setUnit('minutes')}
                  style={styles.unitButton}
                  compact
                >
                  Minutes
                </Button>
                <Button 
                  mode={unit === 'hours' ? 'contained' : 'outlined'}
                  onPress={() => setUnit('hours')}
                  style={styles.unitButton}
                  compact
                >
                  Hours
                </Button>
              </View>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setActivateAssessmentVisible(false)}>Cancel</Button>
            <Button 
              mode="contained" 
              onPress={handleConfirmActivateAssessment} 
              disabled={!assessmentName.trim()}
            >
              Activate
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Delete Activity Confirmation Dialog */}
      <Portal>
        <Dialog visible={deleteActivityVisible} onDismiss={() => setDeleteActivityVisible(false)}>
          <Dialog.Title>Delete Activity</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to delete the activity "{activityToDelete?.name}"? 
              This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteActivityVisible(false)}>Cancel</Button>
            <Button 
              mode="contained" 
              buttonColor="#f44336"
              onPress={handleConfirmDeleteActivity}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Delete Category Confirmation Dialog */}
      <Portal>
        <Dialog visible={deleteCategoryVisible} onDismiss={() => setDeleteCategoryVisible(false)}>
          <Dialog.Title>Delete Category</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to delete the category "{categoryToDelete?.name}" and all its activities? 
              This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteCategoryVisible(false)}>Cancel</Button>
            <Button 
              mode="contained" 
              buttonColor="#f44336"
              onPress={handleConfirmDeleteCategory}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 16,
    paddingBottom: 80, // Add bottom padding to prevent button clash with navigation
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  description: {
    marginTop: 8,
  },
  studentsContainer: {
    marginTop: 8,
  },
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  studentChip: {
    flex: 1,
    marginRight: 8,
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  actionButton: {
    flex: 0.48,
  },
  listItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dialogInput: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  durationInput: {
    flex: 1,
  },
  unitPickerContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  unitButton: {
    minWidth: 70,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  durationPickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 4,
  },
  durationButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});