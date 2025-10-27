import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    Appbar,
    Card,
    DataTable,
    Text,
    Title
} from 'react-native-paper';
import { useAuth } from '../../../auth/presentation/context/authContext';

export default function AssessmentResultsScreen({ navigation, route }: { navigation: any; route: any }) {
  const { group, activity, course } = route.params;
  const { user } = useAuth();

  const userName = user?.name || '';
  
  // Calculate how other team members scored the current user
  // Look through all evaluators and find scores where they evaluated the current user
  const evaluatorScores: { [evaluatorName: string]: number[] } = {};
  const categoryTotals = [0, 0, 0, 0]; // [punctuality, contributions, commitment, attitude]
  let evaluatorCount = 0;
  
  // Iterate through all evaluators in the notas
  Object.entries(activity.notas || {}).forEach(([evaluatorName, evaluatorData]) => {
    if (evaluatorName === userName) return; // Skip self-evaluation
    
    // Type assertion for evaluatorData
    const evaluatorScoresMap = evaluatorData as { [studentName: string]: string };
    
    // Check if this evaluator scored the current user
    const userScoreString = evaluatorScoresMap[userName];
    if (userScoreString) {
      try {
        // Parse the JSON stringified score array
        const scores = typeof userScoreString === 'string' ? JSON.parse(userScoreString) : userScoreString;
        if (Array.isArray(scores) && scores.length === 4) {
          evaluatorScores[evaluatorName] = scores;
          // Add to category totals for overall average calculation
          scores.forEach((score: number, index: number) => {
            categoryTotals[index] += score;
          });
          evaluatorCount++;
        }
      } catch (error) {
        console.warn('Failed to parse scores from evaluator:', evaluatorName, error);
      }
    }
  });

  // Calculate category averages and overall average
  const categoryAverages = categoryTotals.map(total => 
    evaluatorCount > 0 ? Math.round((total / evaluatorCount) * 100) / 100 : 0
  );
  const overallAverage = evaluatorCount > 0 ? 
    Math.round((categoryAverages.reduce((sum, avg) => sum + avg, 0) / 4) * 100) / 100 : 0;

  // Scoring categories
  const scoringCategories = [
    'Punctuality',
    'Contributions', 
    'Commitment',
    'Attitude'
  ];

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Assessment Results" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Activity Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>{activity.name}</Title>
            <Text style={styles.description}>{activity.description}</Text>
            <Text style={styles.groupName}>Group: {group.name}</Text>
          </Card.Content>
        </Card>

        {/* Overall Results */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>How My Teammates Scored Me</Title>
            <View style={styles.overallContainer}>
              <Text style={styles.overallLabel}>Overall Average:</Text>
              <Text style={styles.overallScore}>{overallAverage.toFixed(1)}/5.0</Text>
            </View>
            <Text style={styles.assessedCount}>
              Scored by {evaluatorCount} team member{evaluatorCount !== 1 ? 's' : ''}
            </Text>
          </Card.Content>
        </Card>

        {/* Category Breakdown */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>My Scores by Category</Title>
            {evaluatorCount === 0 ? (
              <Text style={styles.emptyText}>No assessment data available.</Text>
            ) : (
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Category</DataTable.Title>
                  <DataTable.Title numeric>Average Score</DataTable.Title>
                </DataTable.Header>
                {scoringCategories.map((category, index) => (
                  <DataTable.Row key={category}>
                    <DataTable.Cell>{category}</DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text style={styles.scoreText}>{categoryAverages[index].toFixed(1)}/5.0</Text>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
                <DataTable.Row style={styles.totalRow}>
                  <DataTable.Cell>
                    <Text style={styles.totalText}>Overall Average</Text>
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    <Text style={styles.totalScore}>{overallAverage.toFixed(1)}/5.0</Text>
                  </DataTable.Cell>
                </DataTable.Row>
              </DataTable>
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
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  groupName: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontWeight: 'bold',
  },
  overallContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  overallLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  overallScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  assessedCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
  scoreText: {
    fontWeight: '600',
  },
  totalRow: {
    backgroundColor: '#f0f0f0',
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalScore: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#4CAF50',
  },
});