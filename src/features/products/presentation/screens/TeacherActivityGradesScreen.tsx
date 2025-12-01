import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    Appbar,
    Card,
    DataTable,
    Divider,
    Text,
    Title
} from 'react-native-paper';
import { ActivityEntity } from '../../domain/entities/Activity';
import { CategoryEntity } from '../../domain/entities/Category';
import { GroupEntity } from '../../domain/entities/Group';
import { useProducts } from '../context/productContext';

interface TeacherActivityGradesScreenProps {
  route: {
    params: {
      activity: ActivityEntity;
      category: CategoryEntity;
      courseId: string;
    };
  };
  navigation: any;
}

interface StudentGrades {
  studentName: string;
  scores: number[];
  average: number;
  groupName: string;
}

export default function TeacherActivityGradesScreen({ route, navigation }: TeacherActivityGradesScreenProps) {
  const { activity, category, courseId } = route.params;
  const { loadAllGroupsForCourse } = useProducts();
  const [groups, setGroups] = useState<GroupEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Scoring categories
  const scoringCategories = [
    'Punctuality',
    'Contributions',
    'Commitment',
    'Attitude'
  ];

  useEffect(() => {
    loadGroups();
  }, [courseId]);

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      const allGroups = await loadAllGroupsForCourse(courseId);
      // Filter groups that belong to this activity's category
      const categoryGroups = allGroups.filter(group => group.categoryId === category.id);
      setGroups(categoryGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate grades for each student
  const calculateStudentGrades = (): StudentGrades[] => {
    const studentGradesMap = new Map<string, StudentGrades>();

    // Iterate through all evaluators in the notas
    Object.entries(activity.notas || {}).forEach(([evaluatorName, evaluatorData]) => {
      const evaluatorScoresMap = evaluatorData as { [studentName: string]: string };

      // Check each student that was evaluated
      Object.entries(evaluatorScoresMap).forEach(([evaluatedStudent, scoresString]) => {
        try {
          // Parse the JSON stringified score array
          const scores = typeof scoresString === 'string' ? JSON.parse(scoresString) : scoresString;
          
          if (Array.isArray(scores) && scores.length === 4) {
            // Get or create student grade entry
            if (!studentGradesMap.has(evaluatedStudent)) {
              // Find which group this student belongs to
              const studentGroup = groups.find(g => g.studentsNames.includes(evaluatedStudent));
              
              studentGradesMap.set(evaluatedStudent, {
                studentName: evaluatedStudent,
                scores: [0, 0, 0, 0],
                average: 0,
                groupName: studentGroup?.name || 'Unknown Group'
              });
            }

            const studentData = studentGradesMap.get(evaluatedStudent)!;
            
            // Add scores to running total
            scores.forEach((score: number, index: number) => {
              studentData.scores[index] += score;
            });
          }
        } catch (error) {
          console.warn(`Failed to parse scores for student ${evaluatedStudent} from evaluator ${evaluatorName}:`, error);
        }
      });
    });

    // Calculate averages and count evaluators
    const result: StudentGrades[] = [];
    studentGradesMap.forEach((studentData, studentName) => {
      // Count how many people evaluated this student
      let evaluatorCount = 0;
      Object.entries(activity.notas || {}).forEach(([evaluatorName, evaluatorData]) => {
        if (evaluatorName === studentName) return; // Skip self-evaluation
        const evaluatorScoresMap = evaluatorData as { [studentName: string]: string };
        if (evaluatorScoresMap[studentName]) {
          evaluatorCount++;
        }
      });

      // Calculate average scores
      if (evaluatorCount > 0) {
        studentData.scores = studentData.scores.map(total => 
          Math.round((total / evaluatorCount) * 100) / 100
        );
        studentData.average = Math.round(
          (studentData.scores.reduce((sum, score) => sum + score, 0) / 4) * 100
        ) / 100;
      }

      result.push(studentData);
    });

    // Sort by group name, then by student name
    return result.sort((a, b) => {
      const groupCompare = a.groupName.localeCompare(b.groupName);
      if (groupCompare !== 0) return groupCompare;
      return a.studentName.localeCompare(b.studentName);
    });
  };

  const studentGrades = calculateStudentGrades();

  // Group students by their group
  const groupedGrades = groups.map(group => ({
    group,
    students: studentGrades.filter(sg => sg.groupName === group.name)
  }));

  // Calculate overall class average
  const overallAverage = studentGrades.length > 0
    ? Math.round((studentGrades.reduce((sum, sg) => sum + sg.average, 0) / studentGrades.length) * 100) / 100
    : 0;

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Student Grades" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Activity Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>{activity.name}</Title>
            <Text style={styles.description}>{activity.description}</Text>
            <Text style={styles.categoryName}>Category: {category.name}</Text>
            {activity.assessment && (
              <Text style={styles.assessmentBadge}>Assessment Active</Text>
            )}
          </Card.Content>
        </Card>

        {/* Overall Statistics */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Overall Statistics</Title>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Students Evaluated</Text>
                <Text style={styles.statValue}>{studentGrades.length}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Groups</Text>
                <Text style={styles.statValue}>{groups.length}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Class Average</Text>
                <Text style={styles.statValue}>{overallAverage.toFixed(1)}/5.0</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Grades by Group */}
        {isLoading ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.emptyText}>Loading groups...</Text>
            </Card.Content>
          </Card>
        ) : groupedGrades.length === 0 ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.emptyText}>No groups found for this activity.</Text>
            </Card.Content>
          </Card>
        ) : (
          groupedGrades.map(({ group, students }) => (
            <Card key={group.id} style={styles.card}>
              <Card.Content>
                <Title style={styles.groupTitle}>{group.name}</Title>
                <Text style={styles.groupInfo}>
                  Members: {group.studentsNames.join(', ')}
                </Text>
                
                {students.length === 0 ? (
                  <Text style={styles.emptyText}>No grades recorded yet for this group.</Text>
                ) : (
                  <>
                    <Divider style={styles.divider} />
                    <DataTable>
                      <DataTable.Header>
                        <DataTable.Title style={styles.nameColumn}>Student</DataTable.Title>
                        <DataTable.Title numeric style={styles.scoreColumn}>Punct.</DataTable.Title>
                        <DataTable.Title numeric style={styles.scoreColumn}>Contrib.</DataTable.Title>
                        <DataTable.Title numeric style={styles.scoreColumn}>Commit.</DataTable.Title>
                        <DataTable.Title numeric style={styles.scoreColumn}>Attit.</DataTable.Title>
                        <DataTable.Title numeric style={styles.avgColumn}>Avg</DataTable.Title>
                      </DataTable.Header>

                      {students.map((studentGrade) => (
                        <DataTable.Row key={studentGrade.studentName}>
                          <DataTable.Cell style={styles.nameColumn}>
                            {studentGrade.studentName}
                          </DataTable.Cell>
                          {studentGrade.scores.map((score, idx) => (
                            <DataTable.Cell key={idx} numeric style={styles.scoreColumn}>
                              {score.toFixed(1)}
                            </DataTable.Cell>
                          ))}
                          <DataTable.Cell numeric style={styles.avgColumn}>
                            <Text style={styles.averageText}>
                              {studentGrade.average.toFixed(1)}
                            </Text>
                          </DataTable.Cell>
                        </DataTable.Row>
                      ))}

                      {/* Group Average */}
                      {students.length > 0 && (
                        <DataTable.Row style={styles.groupAverageRow}>
                          <DataTable.Cell style={styles.nameColumn}>
                            <Text style={styles.groupAverageLabel}>Group Average</Text>
                          </DataTable.Cell>
                          {[0, 1, 2, 3].map(categoryIndex => {
                            const categoryAvg = students.length > 0
                              ? Math.round((students.reduce((sum, s) => sum + s.scores[categoryIndex], 0) / students.length) * 100) / 100
                              : 0;
                            return (
                              <DataTable.Cell key={categoryIndex} numeric style={styles.scoreColumn}>
                                <Text style={styles.groupAverageValue}>
                                  {categoryAvg.toFixed(1)}
                                </Text>
                              </DataTable.Cell>
                            );
                          })}
                          <DataTable.Cell numeric style={styles.avgColumn}>
                            <Text style={styles.groupAverageValue}>
                              {students.length > 0
                                ? ((students.reduce((sum, s) => sum + s.average, 0) / students.length).toFixed(1))
                                : '0.0'}
                            </Text>
                          </DataTable.Cell>
                        </DataTable.Row>
                      )}
                    </DataTable>
                  </>
                )}
              </Card.Content>
            </Card>
          ))
        )}
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
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  categoryName: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontWeight: 'bold',
  },
  assessmentBadge: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 8,
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  groupTitle: {
    fontSize: 18,
    color: '#2196F3',
  },
  groupInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  divider: {
    marginVertical: 12,
  },
  nameColumn: {
    flex: 2,
  },
  scoreColumn: {
    flex: 1,
  },
  avgColumn: {
    flex: 1,
  },
  averageText: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  groupAverageRow: {
    backgroundColor: '#f0f0f0',
  },
  groupAverageLabel: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  groupAverageValue: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
});
