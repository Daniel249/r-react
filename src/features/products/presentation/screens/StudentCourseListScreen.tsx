import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, FAB, Paragraph, Text, Title } from 'react-native-paper';
import { useAuth } from '../../../auth/presentation/context/authContext';
import { useCourse } from '../context/courseContext';

export default function StudentCourseListScreen({ navigation }: { navigation: any }) {
  const { courses, loading, error, getCourses } = useCourse();
  const { user } = useAuth();

  useEffect(() => {
    getCourses();
  }, []);

  // Filter courses where current user is in the students list
  const studentCourses = useMemo(() => {
    if (!user) return [];
    return courses.filter(course => 
      course.studentsNames.includes(user.email) || 
      course.studentsNames.includes(user.name)
    );
  }, [courses, user]);

  const handleJoinCourse = () => {
    navigation.navigate('JoinCourseScreen');
  };

  const handleCoursePress = (course: any) => {
    navigation.navigate('StudentCourseDetailScreen', { course });
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

        {studentCourses.length === 0 && !loading ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Title>No Courses Found</Title>
              <Paragraph>You haven't joined any courses yet. Join a course to get started!</Paragraph>
              <Button mode="contained" onPress={handleJoinCourse} style={styles.joinButton}>
                Join a Course
              </Button>
            </Card.Content>
          </Card>
        ) : (
          studentCourses.map((course) => (
            <Card key={course.id} style={styles.courseCard} onPress={() => handleCoursePress(course)}>
              <Card.Content>
                <Title>{course.name}</Title>
                <Paragraph>{course.description}</Paragraph>
                <Text style={styles.teacherText}>Teacher: {course.teacher}</Text>
                <Text style={styles.studentsText}>
                  Students: {course.studentsNames.length}
                </Text>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => handleCoursePress(course)}>View Details</Button>
              </Card.Actions>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleJoinCourse}
        label="Join Course"
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
  joinButton: {
    marginTop: 16,
  },
  teacherText: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  studentsText: {
    marginTop: 4,
    color: '#666',
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