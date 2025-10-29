import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    Appbar,
    Card,
    Chip,
    List,
    Text,
    Title
} from 'react-native-paper';
import { useAuth } from '../../../auth/presentation/context/authContext';
import { useProducts } from '../context/productContext';

export default function GroupDetailScreen({ navigation, route }: { navigation: any; route: any }) {
  const { group, course } = route.params;
  const { user } = useAuth();
  const { categories, activities, loadCategoriesForCourse, loadActivitiesForCourse } = useProducts();

  const [isLoading, setIsLoading] = useState(true);

  const courseId = course.id || course._id;

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setIsLoading(true);
      console.log('🎯 [GROUP_DETAIL] Loading data for course:', courseId);
      await Promise.all([
        loadCategoriesForCourse(courseId),
        loadActivitiesForCourse(courseId)
      ]);
    } catch (error) {
      console.error('❌ [GROUP_DETAIL] Error loading course data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get activities that belong to this group's category
  const groupActivities = activities.filter(activity => 
    activity.category === group.categoryId
  );

  // Get assessment activities only
  const assessmentActivities = groupActivities.filter(activity => activity.assessment);

  const getActivityStatus = (activity: any) => {
    const userName = user?.name || '';
    
    // Check if user has completed this assessment
    if (activity.notas && activity.notas[userName]) {
      return { status: 'completed', label: 'Completed', color: '#4CAF50' };
    }
    
    // Check if assessment is available (has been activated)
    if (activity.time) {
      const now = new Date();
      const endDate = new Date(activity.time);
      
      if (now > endDate) {
        return { status: 'expired', label: 'Expired', color: '#f44336' };
      } else {
        return { status: 'available', label: 'Available', color: '#FF9800' };
      }
    }
    
    return { status: 'not-activated', label: 'Not Activated', color: '#9E9E9E' };
  };

  const handleActivityPress = (activity: any) => {
    const status = getActivityStatus(activity);
    
    if (status.status === 'completed') {
      // Show results view
      navigation.navigate('AssessmentResultsScreen', { 
        group, 
        activity, 
        course,
        mode: 'results' 
      });
    } else if (status.status === 'available') {
      // Start assessment
      navigation.navigate('AssessmentScreen', { 
        group, 
        activity, 
        course 
      });
    } else {
      // Show appropriate message for unavailable assessments
      const message = status.status === 'expired' 
        ? 'This assessment has expired and is no longer available.'
        : 'This assessment has not been activated yet.';
      alert(message);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={group.name} />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Group Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>{group.name}</Title>
            <Text style={styles.categoryText}>Category: {group.categoryName}</Text>
            <Text style={styles.courseText}>Course: {course.name}</Text>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Members ({group.members.length})</Text>
              <View style={styles.membersContainer}>
                {group.members.map((member: string, index: number) => (
                  <Chip 
                    key={index} 
                    style={[
                      styles.memberChip,
                      (member.toLowerCase().includes(user?.name?.toLowerCase() || '') ||
                       member.toLowerCase().includes(user?.email?.toLowerCase() || '')) &&
                      styles.currentUserChip
                    ]}
                  >
                    {member}
                  </Chip>
                ))}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Activities & Assessments */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Activities & Assessments</Title>
            {isLoading ? (
              <Text style={styles.emptyText}>Loading activities...</Text>
            ) : assessmentActivities.length === 0 ? (
              <Text style={styles.emptyText}>No assessment activities available for this group yet.</Text>
            ) : (
              assessmentActivities.map((activity: any) => {
                const category = categories.find(cat => cat.id === activity.category || cat.id === activity.catId);
                const status = getActivityStatus(activity);
                
                return (
                  <List.Item
                    key={activity.id}
                    title={`${category?.name || 'Unknown Category'} - ${activity.name}`}
                    description={activity.description}
                    left={() => (
                      <View style={styles.activityIcon}>
                        <Chip 
                          style={[styles.statusChip, { backgroundColor: status.color + '20' }]}
                          textStyle={{ color: status.color, fontSize: 12 }}
                        >
                          {status.label}
                        </Chip>
                      </View>
                    )}
                    onPress={() => handleActivityPress(activity)}
                    style={styles.activityItem}
                  />
                );
              })
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  activityCard: {
    marginVertical: 8,
    backgroundColor: '#fff',
    elevation: 2,
  },
  activityIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  activityItem: {
    marginVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 1,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  courseText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    marginBottom: 8,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  membersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  memberChip: {
    margin: 2,
  },
  currentUserChip: {
    backgroundColor: '#e3f2fd',
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  activityInfo: {
    flex: 1,
    marginRight: 12,
  },
  activityTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  completedChip: {
    backgroundColor: '#e8f5e8',
  },
  pendingChip: {
    backgroundColor: '#fff3e0',
  },
  activityActions: {
    alignItems: 'flex-end',
  },
  averageRow: {
    backgroundColor: '#f0f0f0',
  },
  averageText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  averageScore: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#4CAF50',
  },
});