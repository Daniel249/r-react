import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, FAB, Paragraph, Text, Title } from 'react-native-paper';
import { useAuth } from '../../../auth/presentation/context/authContext';
import { useCourse } from '../context/courseContext';

export default function TeacherCourseListScreen({ navigation }: { navigation: any }) {
  const { courses, loading, error, getCourses } = useCourse();
  const { user } = useAuth();

  useEffect(() => {
    getCourses();
  }, []);

  // Filter courses where current user is the teacher
  const teacherCourses = useMemo(() => {
    if (!user) return [];
    return courses.filter(course => 
      course.teacher === user.email || 
      course.teacher === user.name
    );
  }, [courses, user]);

  const handleCreateCourse = () => {
    navigation.navigate('CreateCourseScreen');
  };

  const handleCoursePress = (course: any) => {
    navigation.navigate('TeacherCourseDetailScreen', { course });
  };

  if (loading && courses.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading courses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {error && (
          <Card style={styles.errorCard}>
            <Card.Content>
              <Text style={styles.errorText}>{error}</Text>
            </Card.Content>
          </Card>
        )}

        {teacherCourses.length === 0 && !loading ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Title>No Courses Found</Title>
              <Paragraph>You haven't created any courses yet. Create your first course to get started!</Paragraph>
              <Button mode="contained" onPress={handleCreateCourse} style={styles.createButton}>
                Create a Course
              </Button>
            </Card.Content>
          </Card>
        ) : (
          teacherCourses.map((course) => (
            <Card key={course.id} style={styles.courseCard} onPress={() => handleCoursePress(course)}>
              <Card.Content>
                <Title>{course.name}</Title>
                <Paragraph>{course.description}</Paragraph>
                <Text style={styles.studentsText}>
                  Students: {course.studentsNames.length}
                </Text>
                <Text style={styles.courseId}>Course ID: {course.id}</Text>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => handleCoursePress(course)}>Manage Course</Button>
                <Button 
                  onPress={() => navigation.navigate('UpdateCourseScreen', { course })}
                  mode="outlined"
                >
                  Edit
                </Button>
              </Card.Actions>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleCreateCourse}
        label="Create Course"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
    paddingBottom: 80, // Add bottom padding to prevent FAB clash with navigation
  },
  courseCard: {
    marginBottom: 16,
    elevation: 4,
  },
  errorCard: {
    marginBottom: 16,
    backgroundColor: '#ffebee',
  },
  errorText: {
    color: '#c62828',
  },
  emptyCard: {
    marginTop: 32,
    padding: 16,
  },
  createButton: {
    marginTop: 16,
  },
  studentsText: {
    marginTop: 8,
    color: '#666',
  },
  courseId: {
    marginTop: 4,
    fontSize: 12,
    color: '#999',
  },
  loadingText: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});