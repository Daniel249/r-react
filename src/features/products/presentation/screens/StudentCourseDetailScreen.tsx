import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  Card,
  Chip,
  List,
  Surface,
  Text,
  Title
} from 'react-native-paper';
import { useAuth } from '../../../auth/presentation/context/authContext';
import { useProducts } from '../context/productContext';

export default function StudentCourseDetailScreen({ navigation, route }: { navigation: any; route: any }) {
  const { course } = route.params;
  const { user } = useAuth();
  const { categories, activities, groups, loadCategoriesForCourse, loadActivitiesForCourse, loadGroupsForCourse } = useProducts();

  // Calculate assessment time status
  const getAssessmentTimeStatus = (activity: any) => {
    if (!activity.time || !activity.assessment) {
      return { status: 'unknown', timeLeft: 'No time data' };
    }

    const now = new Date();
    const endDate = new Date(activity.time);
    
    // For activated assessments, we don't have a separate start date
    // The assessment is active from when it was activated until the end time

    // Check if user has already completed this assessment
    const userName = user?.name || '';
    if (activity.notas && activity.notas[userName]) {
      return { status: 'completed', timeLeft: 'Completed' };
    }

    // Check if assessment period has ended
    if (now > endDate) {
      return { status: 'expired', timeLeft: 'Expired' };
    }

    // Assessment is active - calculate time left until end date
    const timeLeftMs = endDate.getTime() - now.getTime();
    const hoursLeft = Math.floor(timeLeftMs / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hoursLeft > 24) {
      const daysLeft = Math.floor(hoursLeft / 24);
      return { status: 'active', timeLeft: `${daysLeft}d ${hoursLeft % 24}h left` };
    } else if (hoursLeft > 0) {
      return { status: 'active', timeLeft: `${hoursLeft}h ${minutesLeft}m left` };
    } else {
      return { status: 'active', timeLeft: `${minutesLeft}m left` };
    }
  };
  
  const [activeTab, setActiveTab] = useState<'description' | 'groups'>('description');
  const [isLoading, setIsLoading] = useState(true);


  console.log('🎓 Course object structure:', course);
  console.log('🆔 Course ID being used:', course.id || course._id);

  const courseId = course.id || course._id;

  useEffect(() => {
    if (courseId) {
      loadCourseData();
    } else {
      console.error('❌ No valid course ID found!');
    }
  }, [courseId]);



  const loadCourseData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading course data for course ID:', courseId);
      await Promise.all([
        loadCategoriesForCourse(courseId),
        loadActivitiesForCourse(courseId),
        loadGroupsForCourse(courseId)
      ]);
      console.log('✅ [STUDENT] Loaded categories:', categories.map(c => ({id: c.id, name: c.name})));
      console.log('✅ [STUDENT] Loaded activities:', activities.map(a => ({id: a.id, name: a.name, description: a.description, categoryId: a.category})));
      console.log('✅ [STUDENT] Loaded groups:', groups.map(g => ({id: g.id, name: g.name, categoryId: g.categoryId})));
      
      // Debug category relationships
      activities.forEach(activity => {
        const category = categories.find(c => c.id === activity.category);
        console.log(`🔗 [STUDENT] Activity "${activity.name}" (category: ${activity.category}) -> Category: ${category?.name || 'NOT FOUND'}`);
      });
    } catch (error) {
      console.error('Error loading course data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Process real groups from API with enhanced data
  const processedGroups = useMemo(() => {
    console.log('🔄 Processing groups - Input data:', {
      groupsLength: groups.length,
      categoriesLength: categories.length,
      activitiesLength: activities.length,
      userName: user?.name
    });
    
    if (!groups.length) {
      console.log('🚫 No groups loaded from API yet');
      return [];
    }
    
    console.log('✅ Processing real groups from API:', groups);
    
    // Enhance groups with category names and active assessments
    return groups.map(group => {
      const category = categories.find(c => c.id === group.categoryId);
      const groupActivities = activities.filter(a => a.category === group.categoryId && a.assessment);
      
      console.log(`🔍 Group "${group.name}" activities:`, groupActivities.length);
      
      const assessmentsWithStatus = groupActivities.map(activity => {
        const timeStatus = getAssessmentTimeStatus(activity);
        console.log(`📋 Activity "${activity.name}" status: ${timeStatus.status}`);
        return {
          id: `assessment-${activity.id}`,
          activityId: activity.id || '',
          activityName: activity.name,
          status: timeStatus.status,
          timeLeft: timeStatus.timeLeft,
          isPublic: activity.isPublic || false,
          // Don't show mock scores - leave undefined until real assessment data is available
          myScore: undefined,
          groupAverage: undefined
        };
      });
      
      return {
        id: group.id,
        name: group.name,
        categoryId: group.categoryId,
        categoryName: category?.name || 'Unknown Category',
        members: group.studentsNames || [],
        activeAssessments: assessmentsWithStatus
      };
    });
  }, [groups, categories, activities]);

  const handleGroupPress = (group: any) => {
    navigation.navigate('GroupDetailScreen', { 
      group, 
      course, 
      activities: activities.filter(activity => activity.category === group.categoryId)
    });
  };

  const handleAssessmentPress = (assessment: any, group: any) => {
    // Find the matching activity from the assessment
    const activity = activities.find(a => a.id === assessment.activityId);
    if (activity) {
      // Serialize date objects to avoid navigation serialization warnings
      const serializedActivity = {
        ...activity,
        time: activity.time instanceof Date ? activity.time.toISOString() : activity.time
      };
      
      navigation.navigate('AssessmentScreen', { 
        activity: serializedActivity, 
        group, 
        course
      });
    }
  };

  const handleJoinGroupPress = () => {
    navigation.navigate('JoinGroupScreen', { course });
  };

  const renderDescriptionTab = () => (
    <ScrollView style={styles.tabContent}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Course Information</Title>
          <Text style={styles.courseTitle}>{course.name}</Text>
          <Text style={styles.courseDescription}>{course.description}</Text>
          
          <View style={styles.courseDetails}>
            <Text style={styles.detailLabel}>Teacher:</Text>
            <Text style={styles.detailValue}>{course.teacher}</Text>
          </View>
          
          <View style={styles.courseDetails}>
            <Text style={styles.detailLabel}>Students:</Text>
            <Text style={styles.detailValue}>{course.studentsNames?.length || 0} enrolled</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Categories</Title>
          {categories.length === 0 ? (
            <Text style={styles.emptyText}>No categories available yet.</Text>
          ) : (
            categories.map((category, index) => (
              <View key={index} style={styles.categoryItem}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryDetails}>
                  Group Size: {category.groupSize} | 
                  Selection: {category.isRandomSelection ? 'Random' : 'Manual'}
                </Text>
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Activities</Title>
          {activities.length === 0 ? (
            <Text style={styles.emptyText}>No activities available yet.</Text>
          ) : (
            activities.map((activity, index) => (
              <List.Item
                key={index}
                title={activity.name}
                description={activity.description}
                left={() => (
                  <List.Icon 
                    icon={activity.assessment ? "clipboard-check" : "clipboard-text"} 
                    color={activity.assessment ? "#4CAF50" : "#2196F3"}
                  />
                )}
                right={() => activity.assessment && (
                  <Chip icon="star" style={styles.assessmentChip}>
                    Assessment
                  </Chip>
                )}
                style={styles.activityItem}
              />
            ))
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const renderGroupsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>My Groups</Title>
          
          <Button 
            mode="outlined" 
            icon="account-multiple-plus"
            onPress={handleJoinGroupPress}
            style={styles.joinGroupButton}
          >
            Join a Group
          </Button>
          
          {isLoading ? (
            <Text style={styles.emptyText}>Loading groups...</Text>
          ) : processedGroups.length === 0 ? (
            <View>
              <Text style={styles.emptyText}>
                No groups assigned to you yet. 
                {'\n\n'}
                Groups may not have been created for this course yet, or you haven't been assigned to a group. 
                Please contact your instructor.
              </Text>
              {__DEV__ && (
                <Text style={[styles.emptyText, { fontSize: 12, marginTop: 10, color: '#666' }]}>
                  Debug: Check console logs for detailed group loading information
                </Text>
              )}
            </View>
          ) : (
            processedGroups.map((group: any) => {
              // Check if there are any truly active assessments (not expired or completed)
              const hasActiveAssessment = group.activeAssessments.some((assessment: any) => 
                assessment.status === 'active' || assessment.status === 'not-started'
              );
              
              console.log(`🏷️ Group "${group.name}":`, {
                assessments: group.activeAssessments.map((a: any) => ({ name: a.activityName, status: a.status })),
                hasActiveAssessment
              });
              
              return (
                <Card key={group.id} style={styles.groupCard} onPress={() => handleGroupPress(group)}>
                  <Card.Content>
                    <View style={styles.groupHeader}>
                      <Text style={styles.groupName}>{group.categoryName} - {group.name}</Text>
                      {hasActiveAssessment && (
                        <Chip icon="clipboard-clock" style={styles.activeAssessmentChip}>
                          Active Assessment
                        </Chip>
                      )}
                    </View>
                    
                    <View style={styles.groupInfo}>
                      <Text style={styles.memberCount}>
                        {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              );
            })
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={course.name} />
      </Appbar.Header>

      {/* Tab Navigation */}
      <Surface style={styles.tabContainer}>
        <Button
          mode={activeTab === 'description' ? 'contained' : 'outlined'}
          onPress={() => setActiveTab('description')}
          style={styles.tabButton}
        >
          Description
        </Button>
        <Button
          mode={activeTab === 'groups' ? 'contained' : 'outlined'}
          onPress={() => setActiveTab('groups')}
          style={styles.tabButton}
        >
          Groups
        </Button>
      </Surface>

      {/* Tab Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading course data...</Text>
        </View>
      ) : (
        <>
          {activeTab === 'description' && renderDescriptionTab()}
          {activeTab === 'groups' && renderGroupsTab()}
        </>
      )}


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  tabContent: {
    flex: 1,
    padding: 16,
    paddingBottom: 80, // Add bottom padding to prevent button clash with navigation
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Description Tab Styles
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8, // Reduced space between "Course Information" and course title
    marginBottom: 8,
    color: '#333',
  },
  sectionTitle: {
    marginBottom: 8, // Consistent spacing for section titles
  },
  courseDescription: {
    fontSize: 16,
    marginBottom: 16,
    color: '#666',
    lineHeight: 24,
  },
  courseDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    color: '#333',
  },
  detailValue: {
    fontSize: 16,
    color: '#666',
  },
  categoryItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  categoryDetails: {
    fontSize: 14,
    color: '#666',
  },
  activityItem: {
    marginVertical: 4,
  },
  assessmentChip: {
    backgroundColor: '#e8f5e8',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 16,
  },
  // Groups Tab Styles
  joinGroupButton: {
    marginVertical: 16,
  },
  groupCard: {
    marginBottom: 16,
    elevation: 2,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  categoryChip: {
    backgroundColor: '#e3f2fd',
  },


  // New simplified group card styles
  activeAssessmentChip: {
    backgroundColor: '#fff3cd',
    marginLeft: 8,
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});