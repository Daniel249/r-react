import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Paragraph, Text, Title } from 'react-native-paper';

export default function StudentCourseDetailScreen({ navigation, route }: { navigation: any; route: any }) {
  const { course } = route.params;

  const handleViewActivities = () => {
    navigation.navigate('CourseActivitiesScreen', { course });
  };

  const handleViewGrades = () => {
    navigation.navigate('StudentGradesScreen', { course });
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>{course.name}</Title>
          <Paragraph style={styles.description}>{course.description}</Paragraph>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Teacher:</Text>
            <Text style={styles.value}>{course.teacher}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Course ID:</Text>
            <Text style={styles.value}>{course.id}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Classmates ({course.studentsNames.length})</Text>
            <View style={styles.studentsContainer}>
              {course.studentsNames.map((student: string, index: number) => (
                <Chip key={index} style={styles.studentChip}>
                  {student}
                </Chip>
              ))}
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.actionsCard}>
        <Card.Content>
          <Title style={styles.actionsTitle}>Course Actions</Title>
          
          <Button
            mode="contained"
            onPress={handleViewActivities}
            style={styles.actionButton}
            icon="clipboard-list"
          >
            View Activities
          </Button>

          <Button
            mode="outlined"
            onPress={handleViewGrades}
            style={styles.actionButton}
            icon="chart-line"
          >
            View My Grades
          </Button>
        </Card.Content>
      </Card>

      {course.categories && course.categories.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Categories</Title>
            {course.categories.map((category: any, index: number) => (
              <View key={index} style={styles.categoryItem}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryDetails}>
                  Group Size: {category.groupSize} | 
                  Selection: {category.isRandomSelection ? 'Random' : 'Manual'}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}
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
    marginBottom: 16,
    elevation: 4,
  },
  actionsCard: {
    marginBottom: 16,
    elevation: 4,
  },
  description: {
    marginVertical: 12,
    fontSize: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 8,
    minWidth: 80,
  },
  value: {
    flex: 1,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  studentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  studentChip: {
    margin: 2,
  },
  actionsTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  actionButton: {
    marginVertical: 8,
  },
  categoryItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});