import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
    Appbar,
    Button,
    Card,
    Chip,
    Snackbar,
    Text,
    Title
} from 'react-native-paper';
import { useDI } from '../../../../core/di/DIProvider';
import { TOKENS } from '../../../../core/di/tokens';
import { useAuth } from '../../../auth/presentation/context/authContext';
import { UpdateAssessmentResultsUseCase } from '../../domain/usecases/UpdateAssessmentResultsUseCase';
import { useProducts } from '../context/productContext';

export default function AssessmentScreen({ navigation, route }: { navigation: any; route: any }) {
  const { group, activity, course } = route.params;
  const { user } = useAuth();
  const { loadActivitiesForCourse } = useProducts();
  const di = useDI();
  const updateAssessmentResultsUC = di.resolve<UpdateAssessmentResultsUseCase>(TOKENS.UpdateAssessmentResultsUC);

  // Check if user has already completed this assessment
  const hasUserCompleted = activity.notas && activity.notas[user?.name || ''] ? true : false;
  
  // Calculate time status
  const getTimeStatus = () => {
    if (!activity.time) return { status: 'no-time', message: 'No time limit set' };
    
    const now = new Date();
    const assessmentTime = new Date(activity.time);
    const timeDiff = assessmentTime.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
      return { status: 'expired', message: 'Expired' };
    } else {
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      if (hours > 0) {
        return { status: 'active', message: `${hours}h ${minutes}m ${seconds}s remaining` };
      } else if (minutes > 0) {
        return { status: 'active', message: `${minutes}m ${seconds}s remaining` };
      } else {
        return { status: 'active', message: `${seconds}s remaining` };
      }
    }
  };
  
  const [timeStatus, setTimeStatus] = useState(getTimeStatus());

  // Filter out current user from members to assess
  const membersToAssess = group.members.filter((member: string) => 
    !member.toLowerCase().includes(user?.name?.toLowerCase() || '') &&
    !member.toLowerCase().includes(user?.email?.toLowerCase() || '')
  );

  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
  const [assessments, setAssessments] = useState<{[memberName: string]: any}>({});
  const [currentScores, setCurrentScores] = useState({
    punctuality: '',
    contributions: '',
    commitment: '',
    attitude: ''
  });
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const currentMember = membersToAssess[currentMemberIndex];
  const progress = (currentMemberIndex + 1) / membersToAssess.length;
  const isLastMember = currentMemberIndex === membersToAssess.length - 1;

  const validateScores = () => {
    const scores = Object.values(currentScores);
    if (scores.some(score => score === '')) {
      Alert.alert('Incomplete Assessment', 'Please rate all categories before proceeding.');
      return false;
    }
    
    const numericScores = scores.map(score => parseFloat(score));
    if (numericScores.some(score => isNaN(score) || score < 2 || score > 5)) {
      Alert.alert('Invalid Score', 'All scores must be numbers between 2 and 5.');
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (!validateScores()) return;

    // Save current assessment
    const newAssessments = {
      ...assessments,
      [currentMember]: { ...currentScores }
    };
    setAssessments(newAssessments);

    if (isLastMember) {
      // Submit all assessments
      handleSubmitAssessment(newAssessments);
    } else {
      // Move to next member
      setCurrentMemberIndex(currentMemberIndex + 1);
      setCurrentScores({
        punctuality: '',
        contributions: '',
        commitment: '',
        attitude: ''
      });
    }
  };

  const handlePrevious = () => {
    if (currentMemberIndex > 0) {
      // Save current progress
      if (Object.values(currentScores).some(score => score !== '')) {
        setAssessments({
          ...assessments,
          [currentMember]: { ...currentScores }
        });
      }
      
      setCurrentMemberIndex(currentMemberIndex - 1);
      const previousMember = membersToAssess[currentMemberIndex - 1];
      const previousScores = assessments[previousMember] || {
        punctuality: '',
        contributions: '',
        commitment: '',
        attitude: ''
      };
      setCurrentScores(previousScores);
    }
  };

  const handleSubmitAssessment = async (finalAssessments: any) => {
    try {
      console.log('Submitting assessments:', finalAssessments);
      
      // Convert assessments to the proper format: { [evaluatorName]: { [peerName]: "JSON stringified [score1, score2, score3, score4]" } }
      const evaluatorName = user?.name || 'Anonymous';
      const evaluatorScores: { [peerName: string]: string } = {};
      
      Object.entries(finalAssessments).forEach(([peerName, scores]) => {
        const scoreValues = Object.values(scores as Record<string, string>).map(score => parseInt(score));
        evaluatorScores[peerName] = JSON.stringify(scoreValues); // JSON stringify the array
      });
      
      // Get current notas and add this evaluator's scores
      const currentNotas = activity.notas || {};
      const updatedNotas = {
        ...currentNotas,
        [evaluatorName]: evaluatorScores
      };
      
      // Update assessment results via use case
      await updateAssessmentResultsUC.execute(activity.id, updatedNotas);
      console.log('Assessment results updated successfully');
      
      // Refresh activities data to get updated assessment status
      console.log('🔄 Refreshing activities after assessment submission...');
      await loadActivitiesForCourse(course.id || course._id);
      console.log('✅ Activities refreshed successfully');
      
      setSnackbarMessage('Assessment submitted successfully!');
      setSnackbarVisible(true);
      
      // Navigate back after success
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting assessment:', error);
      Alert.alert('Error', 'Failed to submit assessment. Please try again.');
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'punctuality':
        return 'How punctual and reliable is this member in group activities?';
      case 'contributions':
        return 'How much does this member contribute to the group work?';
      case 'commitment':
        return 'How committed and dedicated is this member to group goals?';
      case 'attitude':
        return 'How positive and cooperative is this member\'s attitude?';
      default:
        return '';
    }
  };

  // Calculate user's averages if assessment is completed
  const calculateUserAverages = () => {
    if (!hasUserCompleted || !activity.notas) return null;
    
    const userName = user?.name || '';
    const categoryAverages = [0, 0, 0, 0]; // punctuality, contributions, commitment, attitude
    const categoryCounts = [0, 0, 0, 0];
    
    // Traverse all evaluators' scores for this user
    Object.entries(activity.notas).forEach(([evaluatorName, peerScores]) => {
      const peerScoresObj = peerScores as { [key: string]: number[] };
      if (peerScoresObj[userName]) {
        const scores = peerScoresObj[userName];
        scores.forEach((score: number, index: number) => {
          if (score !== -1 && index < 4) {
            categoryAverages[index] += score;
            categoryCounts[index]++;
          }
        });
      }
    });
    
    // Calculate averages for each category
    const averages = categoryAverages.map((sum, index) => 
      categoryCounts[index] > 0 ? sum / categoryCounts[index] : 0
    );
    
    // Calculate overall average
    const validAverages = averages.filter(avg => avg > 0);
    const overallAverage = validAverages.length > 0 
      ? validAverages.reduce((sum, avg) => sum + avg, 0) / validAverages.length 
      : 0;
    
    return {
      punctuality: averages[0],
      contributions: averages[1],
      commitment: averages[2],
      attitude: averages[3],
      overall: overallAverage
    };
  };

  // If user has completed assessment, show results view
  if (hasUserCompleted) {
    const averages = calculateUserAverages();
    
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title={`${activity.name} - ${activity.assessName}`} />
        </Appbar.Header>

        <ScrollView style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Title>{group.categoryName} - {group.name}</Title>
              <Text style={styles.subtitle}>Assessment Completed</Text>
              <Text style={styles.description}>{activity.description}</Text>
            </Card.Content>
          </Card>

          {averages && (
            <Card style={styles.card}>
              <Card.Content>
                <Title>Your Results</Title>
                <View style={styles.resultsGrid}>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Punctuality:</Text>
                    <Text style={styles.resultValue}>{averages.punctuality.toFixed(1)}</Text>
                  </View>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Contributions:</Text>
                    <Text style={styles.resultValue}>{averages.contributions.toFixed(1)}</Text>
                  </View>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Commitment:</Text>
                    <Text style={styles.resultValue}>{averages.commitment.toFixed(1)}</Text>
                  </View>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Attitude:</Text>
                    <Text style={styles.resultValue}>{averages.attitude.toFixed(1)}</Text>
                  </View>
                  <View style={[styles.resultRow, styles.overallRow]}>
                    <Text style={styles.overallLabel}>Overall Average:</Text>
                    <Text style={styles.overallValue}>{averages.overall.toFixed(1)}</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}
        </ScrollView>
      </View>
    );
  }

  // If assessment is expired, show expired view
  if (timeStatus.status === 'expired') {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title={`${activity.name} - ${activity.assessName}`} />
        </Appbar.Header>

        <ScrollView style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Title>{group.categoryName} - {group.name}</Title>
              <Text style={styles.subtitle}>Assessment Expired</Text>
              <Text style={styles.description}>{activity.description}</Text>
              <View style={styles.expiredContainer}>
                <Text style={styles.expiredText}>This assessment has expired and can no longer be completed.</Text>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`Assessment: ${activity.name}`} />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Progress */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.progressText}>
              Member {currentMemberIndex + 1} of {membersToAssess.length}
            </Text>
            <Text style={styles.groupInfo}>
              Group: {group.name} | Activity: {activity.name}
            </Text>
          </Card.Content>
        </Card>

        {/* Current Member Assessment */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.memberHeader}>
              <Title>Assess Team Member</Title>
              <Chip style={styles.memberChip}>{currentMember}</Chip>
            </View>
            
            <Text style={styles.instructionText}>
              Rate this member's performance in each category (2-5 scale):
            </Text>

            {/* Assessment Categories - Compact Layout */}
            {Object.entries(currentScores).map(([category, score]) => (
              <View key={category} style={styles.compactCategoryRow}>
                <Text style={styles.compactCategoryTitle}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
                
                {/* Score Selection Buttons (2-5 only) */}
                <View style={styles.compactScoreButtons}>
                  {[2, 3, 4, 5].map((value) => (
                    <Button
                      key={value}
                      mode={score === value.toString() ? 'contained' : 'outlined'}
                      onPress={() => setCurrentScores({
                        ...currentScores,
                        [category]: value.toString()
                      })}
                      style={styles.compactScoreButton}
                      compact
                    >
                      {value}
                    </Button>
                  ))}
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Navigation Buttons */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.navigationButtons}>
              <Button
                mode="outlined"
                onPress={handlePrevious}
                disabled={currentMemberIndex === 0}
                style={styles.navButton}
              >
                Previous
              </Button>
              
              <Button
                mode="contained"
                onPress={handleNext}
                style={styles.navButton}
              >
                {isLastMember ? 'Submit Assessment' : 'Next Member'}
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Assessment Overview */}
        {Object.keys(assessments).length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Assessment Progress</Title>
              {Object.entries(assessments).map(([memberName, scores]) => (
                <View key={memberName} style={styles.assessmentSummary}>
                  <Text style={styles.summaryMember}>{memberName}</Text>
                  <View style={styles.summaryScores}>
                    {Object.entries(scores as Record<string, string>).map(([category, score]) => (
                      <Chip key={category} style={styles.summaryChip}>
                        {category.substring(0, 3).toUpperCase()}: {score}
                      </Chip>
                    ))}
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}
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
  progressText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    marginBottom: 8,
  },
  groupInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  memberChip: {
    backgroundColor: '#e3f2fd',
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  categorySection: {
    marginBottom: 24,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  scoreButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  scoreButton: {
    flex: 1,
    marginHorizontal: 2,
  },
  scoreInput: {
    backgroundColor: '#fff',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    flex: 0.45,
  },
  assessmentSummary: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  summaryMember: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryScores: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  summaryChip: {
    margin: 2,
    backgroundColor: '#e0e0e0',
  },
  compactCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  compactCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 16,
  },
  compactScoreButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  compactScoreButton: {
    minWidth: 40,
    paddingHorizontal: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
  },
  resultsGrid: {
    marginTop: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultLabel: {
    fontSize: 16,
    color: '#333',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  overallRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
    borderBottomWidth: 0,
  },
  overallLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  overallValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  expiredContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    alignItems: 'center',
  },
  expiredText: {
    fontSize: 16,
    color: '#d32f2f',
    fontWeight: '500',
  },
});