import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Snackbar, Text, TextInput, Title } from 'react-native-paper';
import { useCourse } from '../context/courseContext';

export default function JoinCourseScreen({ navigation }: { navigation: any }) {
  const [courseId, setCourseId] = useState('');
  const [password, setPassword] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { joinCourse, loading } = useCourse();

  const handleJoinCourse = async () => {
    try {
      await joinCourse(courseId, password);
      setSnackbarMessage('Successfully joined course!');
      setShowSnackbar(true);
      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      setSnackbarMessage('Failed to join course. Please check your course ID and password.');
      setShowSnackbar(true);
    }
  };

  const isFormValid = courseId.trim() !== '' && password.trim() !== '';

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Join a Course</Title>
          <Text style={styles.subtitle}>
            Enter the course ID and password provided by your teacher
          </Text>

          <TextInput
            label="Course ID"
            value={courseId}
            onChangeText={setCourseId}
            style={styles.input}
            mode="outlined"
            placeholder="Enter course ID"
          />

          <TextInput
            label="Course Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            mode="outlined"
            secureTextEntry
            placeholder="Enter course password"
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
              onPress={handleJoinCourse}
              style={styles.button}
              disabled={!isFormValid || loading}
              loading={loading}
            >
              Join Course
            </Button>
          </View>
        </Card.Content>
      </Card>

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
    justifyContent: 'center',
  },
  card: {
    elevation: 4,
    padding: 16,
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
});