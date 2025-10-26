import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Snackbar, Text, TextInput, Title } from 'react-native-paper';
import { useCourse } from '../context/courseContext';

export default function CreateCourseScreen({ navigation }: { navigation: any }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { createCourse, loading } = useCourse();

  const handleCreateCourse = async () => {
    try {
      await createCourse(name, description);
      setSnackbarMessage('Course created successfully!');
      setShowSnackbar(true);
      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      setSnackbarMessage('Failed to create course. Please try again.');
      setShowSnackbar(true);
    }
  };

  const isFormValid = name.trim() !== '' && description.trim() !== '';

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Create New Course</Title>
          <Text style={styles.subtitle}>
            Fill in the details to create a new course for your students
          </Text>

          <TextInput
            label="Course Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            mode="outlined"
            placeholder="Enter course name"
          />

          <TextInput
            label="Course Description"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={4}
            placeholder="Describe your course..."
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
              onPress={handleCreateCourse}
              style={styles.button}
              disabled={!isFormValid || loading}
              loading={loading}
            >
              Create Course
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Title>Course Information</Title>
          <Text style={styles.infoText}>
            • Once created, students can join your course using the course ID and password
          </Text>
          <Text style={styles.infoText}>
            • You can manage activities, categories, and groups from the course dashboard
          </Text>
          <Text style={styles.infoText}>
            • You can always edit the course details later
          </Text>
        </Card.Content>
      </Card>

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    elevation: 4,
    padding: 16,
    marginBottom: 16,
  },
  infoCard: {
    elevation: 2,
    backgroundColor: '#e3f2fd',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
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
  infoText: {
    marginVertical: 4,
    color: '#1976d2',
  },
});