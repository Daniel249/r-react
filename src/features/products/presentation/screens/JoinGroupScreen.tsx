import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    Appbar,
    Button,
    Card,
    Chip,
    Dialog,
    List,
    Portal,
    Text,
    TextInput,
    Title
} from 'react-native-paper';
import { useAuth } from '../../../auth/presentation/context/authContext';
import { useProducts } from '../context/productContext';

export default function JoinGroupScreen({ navigation, route }: { navigation: any; route: any }) {
  const { course } = route.params;
  const { user } = useAuth();
  const { 
    categories, 
    groups, 
    loadCategoriesForCourse, 
    loadAllGroupsForCourse, 
    addGroup, 
    updateGroup 
  } = useProducts();

  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const [allCourseGroups, setAllCourseGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create Group Dialog State
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [groupName, setGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  // Join Group State
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [isJoining, setIsJoining] = useState(false);

  const courseId = course.id || course._id;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && allCourseGroups.length > 0) {
      filterAvailableData();
    }
  }, [categories, allCourseGroups, user?.name]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Loading data for Join Group screen...');
      
      // Load categories and ALL groups for this course (including ones user isn't in)
      await loadCategoriesForCourse(courseId);
      const allGroups = await loadAllGroupsForCourse(courseId);
      setAllCourseGroups(allGroups);
      
      filterAvailableData(allGroups);
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAvailableData = (allGroups = allCourseGroups) => {
    const userName = user?.name;
    if (!userName) return;

    // Find categories where user is already in a group
    const userGroupCategories = new Set();
    allGroups.forEach(group => {
      if (group.studentsNames?.includes(userName)) {
        userGroupCategories.add(group.categoryId);
      }
    });

    // Filter available categories (user not in a group for these)
    const availableCats = categories.filter(cat => 
      !userGroupCategories.has(cat.id)
    );
    setAvailableCategories(availableCats);
    console.log('📝 Available categories for new groups:', availableCats);

    // Filter available groups to join
    const availableGroupsToJoin = allGroups.filter(group => {
      // Must belong to course categories
      const belongsToCourse = categories.some(c => c.id === group.categoryId);
      if (!belongsToCourse) return false;

      // Skip categories where user is already in a group
      const userAlreadyInCategory = userGroupCategories.has(group.categoryId);
      if (userAlreadyInCategory) return false;

      // Skip groups at full capacity
      const category = categories.find(c => c.id === group.categoryId);
      const currentMemberCount = group.studentsNames?.length || 0;
      const isAtCapacity = category && currentMemberCount >= category.groupSize;

      return !isAtCapacity;
    });
    
    setAvailableGroups(availableGroupsToJoin);
    console.log('🎯 Available groups to join:', availableGroupsToJoin);
  };

  const handleCreateGroup = async () => {
    if (!selectedCategory || !groupName.trim() || !user?.name) return;

    try {
      setIsCreating(true);
      console.log(`🚀 Creating new group "${groupName}" in category "${selectedCategory.name}"...`);

      // Create the group with current user as member
      const newGroup = await addGroup(
        groupName.trim(),
        selectedCategory.id,
        courseId,
        [user.name] // User is automatically added to the group
      );

      console.log('✅ Successfully created group:', newGroup);

      // Refresh data
      const refreshedGroups = await loadAllGroupsForCourse(courseId);
      setAllCourseGroups(refreshedGroups);
      filterAvailableData(refreshedGroups);

      // Reset form
      setShowCreateDialog(false);
      setSelectedCategory(null);
      setGroupName('');

    } catch (error) {
      console.error('❌ Error creating group:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGroup = async (group: any) => {
    if (!user?.name) return;

    try {
      setIsJoining(true);
      console.log(`🚀 Joining group "${group.name}"...`);

      // Check if group is still available
      const category = categories.find(c => c.id === group.categoryId);
      const currentMemberCount = group.studentsNames?.length || 0;

      if (category && currentMemberCount >= category.groupSize) {
        console.warn('⚠️ Group is now at full capacity');
        await loadData(); // Refresh data
        return;
      }

      // Add user to group
      const updatedStudentsNames = [...(group.studentsNames || []), user.name];
      const updatedGroup = {
        ...group,
        studentsNames: updatedStudentsNames
      };

      await updateGroup(updatedGroup, courseId);
      console.log('✅ Successfully joined group!');

      // Go back to course screen
      navigation.goBack();

    } catch (error) {
      console.error('❌ Error joining group:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const renderCreateGroupSection = () => (
    <Card style={styles.createCard}>
      <Card.Content>
        <Title>Create New Group</Title>
        <Text style={styles.description}>
          Create a new group in a category where you're not already a member.
        </Text>
        
        {availableCategories.length === 0 ? (
          <Text style={styles.noCategories}>
            No categories available for creating groups. You're already in a group for all categories.
          </Text>
        ) : (
          <Button 
            mode="contained" 
            icon="plus"
            onPress={() => setShowCreateDialog(true)}
            style={styles.createButton}
          >
            Create Group
          </Button>
        )}
      </Card.Content>
    </Card>
  );

  const renderAvailableGroups = () => (
    <Card style={styles.joinCard}>
      <Card.Content>
        <Title>Join Existing Group</Title>
        <Text style={styles.description}>
          Join an existing group that has available spots.
        </Text>

        {availableGroups.length === 0 ? (
          <Text style={styles.noGroups}>
            No groups available to join. All groups are either full or you're already in a group for those categories.
          </Text>
        ) : (
          availableGroups.map((group) => {
            const category = categories.find(c => c.id === group.categoryId);
            const currentMembers = group.studentsNames?.length || 0;
            const maxMembers = category?.groupSize || 0;
            const isNearCapacity = maxMembers > 0 && currentMembers >= maxMembers - 1;

            return (
              <Card 
                key={group.id} 
                style={[
                  styles.groupCard,
                  isNearCapacity && styles.nearCapacityCard
                ]}
                onPress={() => handleJoinGroup(group)}
              >
                <Card.Content>
                  <View style={styles.groupHeader}>
                    <View style={styles.groupInfo}>
                      <Text style={styles.groupName}>
                        {category?.name || 'Unknown'} - {group.name}
                      </Text>
                      <Text style={styles.memberCount}>
                        {currentMembers}/{maxMembers} members
                        {isNearCapacity && ' • Almost full'}
                      </Text>
                    </View>
                    {isNearCapacity && (
                      <Chip icon="alert" style={styles.limitedChip}>
                        <Text style={styles.chipText}>Limited spots</Text>
                      </Chip>
                    )}
                  </View>
                </Card.Content>
              </Card>
            );
          })
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Join or Create Group" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading groups...</Text>
          </View>
        ) : (
          <>
            {renderCreateGroupSection()}
            {renderAvailableGroups()}
          </>
        )}
      </ScrollView>

      {/* Create Group Dialog */}
      <Portal>
        <Dialog visible={showCreateDialog} onDismiss={() => setShowCreateDialog(false)}>
          <Dialog.Title>Create New Group</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogDescription}>
              Select a category and enter a name for your new group.
            </Text>

            {/* Category Selector */}
            <Text style={styles.fieldLabel}>Category</Text>
            <Button
              mode="outlined"
              onPress={() => setShowCategoryDropdown(true)}
              style={styles.categoryButton}
            >
              {selectedCategory ? selectedCategory.name : 'Select Category'}
            </Button>

            {/* Group Name Input */}
            <Text style={styles.fieldLabel}>Group Name</Text>
            <TextInput
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Enter group name"
              style={styles.textInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button 
              mode="contained"
              onPress={handleCreateGroup}
              disabled={!selectedCategory || !groupName.trim() || isCreating}
              loading={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create'}
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Category Selection Dialog */}
        <Dialog visible={showCategoryDropdown} onDismiss={() => setShowCategoryDropdown(false)}>
          <Dialog.Title>Select Category</Dialog.Title>
          <Dialog.Content>
            {availableCategories.map((category) => (
              <List.Item
                key={category.id}
                title={category.name}
                description={`Max group size: ${category.groupSize}`}
                onPress={() => {
                  setSelectedCategory(category);
                  setShowCategoryDropdown(false);
                }}
                style={styles.categoryItem}
              />
            ))}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCategoryDropdown(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  createCard: {
    marginBottom: 16,
    elevation: 4,
  },
  joinCard: {
    marginBottom: 16,
    elevation: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  noCategories: {
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  noGroups: {
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  createButton: {
    marginTop: 8,
  },
  groupCard: {
    marginBottom: 8,
    elevation: 2,
  },
  nearCapacityCard: {
    borderColor: '#ff9800',
    borderWidth: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  memberCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  limitedChip: {
    backgroundColor: '#fff3cd',
    height: 28,
  },
  chipText: {
    fontSize: 10,
  },
  dialogDescription: {
    marginBottom: 16,
    color: '#666',
  },
  fieldLabel: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  categoryButton: {
    marginBottom: 8,
  },
  textInput: {
    marginBottom: 8,
  },
  categoryItem: {
    paddingVertical: 4,
  },
});