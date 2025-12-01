import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Dialog, Portal, Snackbar, Text, Title } from 'react-native-paper';
import { useAuth } from '../../../auth/presentation/context/authContext';
import { useCourse } from '../context/courseContext';

export default function JoinCourseScreen({ navigation }: { navigation: any }) {
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const { courses, getCourses, updateCourse, loading } = useCourse();
  const { user } = useAuth();

  useEffect(() => {
    getCourses();
  }, []);

  // Filter courses where the current user is not in the students list
  const availableCourses = courses.filter(course => 
    !course.studentsNames.includes(user?.name || '')
  );

  const handleCoursePress = (course: any) => {
    setSelectedCourse(course);
    setShowDialog(true);
  };

  const handleJoinCourse = async () => {
    if (!selectedCourse || !user) return;

    try {
      // Add the current user to the course's student list
      const updatedStudents = [...selectedCourse.studentsNames, user.name];
      
      // Update the course with the new students list
      await updateCourse(
        selectedCourse.id, 
        selectedCourse.name, 
        selectedCourse.description,
        updatedStudents
      );
      
      setSnackbarMessage('Successfully joined course!');
      setShowSnackbar(true);
      setShowDialog(false);
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      setSnackbarMessage('Failed to join course. Please try again.');
      setShowSnackbar(true);
      setShowDialog(false);
    }
  };

  const renderCourseItem = ({ item }: { item: any }) => (
    <Card style={styles.courseCard} onPress={() => handleCoursePress(item)}>
      <Card.Content>
        <Title>{item.name}</Title>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.teacher}>Teacher: {item.teacher}</Text>
        <Text style={styles.students}>
          Students enrolled: {item.studentsNames.length}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Available Courses</Title>
      <Text style={styles.subtitle}>Select a course to join</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : availableCourses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No available courses to join</Text>
          <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.backButton}>
            Go Back
          </Button>
        </View>
      ) : (
        <FlatList
          data={availableCourses}
          renderItem={renderCourseItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Portal>
        <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
          <Dialog.Title>Join Course</Dialog.Title>
          <Dialog.Content>
            <Text>Do you want to join "{selectedCourse?.name}"?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDialog(false)}>Cancel</Button>
            <Button onPress={handleJoinCourse} loading={loading}>Join</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
    paddingBottom: 80,
  },
  title: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  listContainer: {
    paddingBottom: 16,
  },
  courseCard: {
    marginBottom: 12,
    elevation: 2,
  },
  description: {
    marginTop: 8,
    marginBottom: 4,
    color: '#666',
  },
  teacher: {
    marginTop: 4,
    fontSize: 14,
    color: '#333',
  },
  students: {
    marginTop: 4,
    fontSize: 12,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  backButton: {
    marginTop: 8,
  },
});