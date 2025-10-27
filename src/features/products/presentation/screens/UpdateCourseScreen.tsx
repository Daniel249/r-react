import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Card, Snackbar, Text, TextInput } from 'react-native-paper';
import { CourseEntity } from '../../domain/entities/Course';
import { useCourse } from '../context/courseContext';

interface UpdateCourseScreenProps {
  route: {
    params: {
      course: CourseEntity;
    };
  };
  navigation: any;
}

export default function UpdateCourseScreen({ route, navigation }: any) {
  const { course } = route.params;
  const { updateCourse } = useCourse();
  
  const [name, setName] = useState(course.name);
  const [description, setDescription] = useState(course.description);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleUpdateCourse = async () => {
    if (!name.trim()) {
      setSnackbarMessage('Course name is required');
      setSnackbarVisible(true);
      return;
    }

    if (!description.trim()) {
      setSnackbarMessage('Course description is required');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    try {
      await updateCourse(course.id, name.trim(), description.trim());
      setSnackbarMessage('Course updated successfully');
      setSnackbarVisible(true);
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error) {
      console.error('Failed to update course:', error);
      setSnackbarMessage('Failed to update course. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Update Course" />
      </Appbar.Header>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Course Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              error={!name.trim() && name !== course.name}
            />

            <TextInput
              label="Course Description"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={6}
              style={styles.input}
              error={!description.trim() && description !== course.description}
            />

            <View style={styles.buttonContainer}>
              <Button 
                mode="outlined" 
                onPress={() => navigation.goBack()}
                style={styles.button}
                disabled={loading}
              >
                Cancel
              </Button>
              
              <Button
                mode="contained"
                onPress={handleUpdateCourse}
                loading={loading}
                disabled={loading || (!name.trim() || !description.trim())}
                style={styles.button}
              >
                Update Course
              </Button>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.infoTitle}>Course Information</Text>
            <Text style={styles.infoText}>Course ID: {course.id}</Text>
            <Text style={styles.infoText}>Teacher: {course.teacher}</Text>
            <Text style={styles.infoText}>Students: {course.studentsNames.length}</Text>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
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
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  infoCard: {
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
  },
  input: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 0.45,
  },
  infoTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  infoText: {
    marginBottom: 4,
    color: '#666',
  },
});