import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Divider, IconButton, List, Surface, Text } from "react-native-paper";

import { useAuth } from "./features/auth/presentation/context/authContext";
import LoginScreen from "./features/auth/presentation/screens/LoginScreen";
import SignupScreen from "./features/auth/presentation/screens/SignupScreen";
import AddProductScreen from "./features/products/presentation/screens/AddProductScreen";
import UpdateProductScreen from "./features/products/presentation/screens/UpdateProductScreen";
import SettingScreen from "./features/settings/SettingScreen";

// Course screens
import CreateCourseScreen from "./features/products/presentation/screens/CreateCourseScreen";
import JoinCourseScreen from "./features/products/presentation/screens/JoinCourseScreen";
import StudentCourseDetailScreen from "./features/products/presentation/screens/StudentCourseDetailScreen";
import StudentCourseListScreen from "./features/products/presentation/screens/StudentCourseListScreen";
import TeacherCourseDetailScreen from "./features/products/presentation/screens/TeacherCourseDetailScreen";
import TeacherCourseListScreen from "./features/products/presentation/screens/TeacherCourseListScreen";
import UpdateCourseScreen from "./features/products/presentation/screens/UpdateCourseScreen";

// Assessment screens
import AssessmentResultsScreen from "./features/products/presentation/screens/AssessmentResultsScreen";
import AssessmentScreen from "./features/products/presentation/screens/AssessmentScreen";
import GroupDetailScreen from "./features/products/presentation/screens/GroupDetailScreen";
import JoinGroupScreen from "./features/products/presentation/screens/JoinGroupScreen";


const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Custom drawer content component
function CustomDrawerContent(props: any) {
  const { logout, user } = useAuth();
  const userRole = user?.role || 'student';

  const handleNavigation = (screenName: string) => {
    props.navigation.navigate(screenName);
  };

  const menuItems = [
    { name: "Student", screen: "StudentView", icon: "school" },
    { name: "Teacher", screen: "TeacherView", icon: "account-tie" },
    { name: "Profile", screen: "Profile", icon: "account" },
  ];

  return (
    <Surface style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <Text variant="headlineSmall" style={styles.drawerTitle}>
          {userRole === 'teacher' ? 'Teacher Dashboard' : 'Student Dashboard'}
        </Text>
        <Text variant="bodyMedium" style={styles.userInfo}>
          {user?.name || user?.email}
        </Text>
      </View>
      
      <Divider />
      
      <View style={styles.drawerContent}>
        {menuItems.map((item) => (
          <List.Item
            key={item.screen}
            title={item.name}
            left={(props) => <List.Icon {...props} icon={item.icon} />}
            onPress={() => handleNavigation(item.screen)}
            style={styles.menuItem}
          />
        ))}
      </View>

      <Divider />
      
      <View style={styles.drawerFooter}>
        <List.Item
          title="Logout"
          left={(props) => <List.Icon {...props} icon="logout" color="#d32f2f" />}
          onPress={logout}
          style={styles.logoutItem}
          titleStyle={styles.logoutText}
        />
      </View>
    </Surface>
  );
}

export default function AuthFlow() {
  const { isLoggedIn, logout, user } = useAuth();

  function AppDrawer() {
    const userRole = user?.role || 'student';
    
    return (
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: true,
          headerTitleAlign: "left",
          headerStyle: {
            elevation: 0, // Remove shadow on Android
            shadowOpacity: 0, // Remove shadow on iOS
          },
          drawerType: 'front', // Drawer slides from left
          drawerStyle: {
            width: 280,
          },
          swipeEnabled: true, // Enable swipe to open
        }}
      >
        <Drawer.Screen
          name="StudentView"
          component={StudentCourseListScreen}
          options={{
            title: "Student",
            headerRight: () => (
              <IconButton icon="logout" onPress={() => logout()} />
            ),
          }}
        />
        <Drawer.Screen
          name="TeacherView"
          component={TeacherCourseListScreen}
          options={{
            title: "Teacher",
            headerRight: () => (
              <IconButton icon="logout" onPress={() => logout()} />
            ),
          }}
        />
        <Drawer.Screen
          name="Profile"
          component={SettingScreen}
          options={{
            title: "Profile",
            headerRight: () => (
              <IconButton icon="logout" onPress={() => logout()} />
            ),
          }}
        />
      </Drawer.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="App" component={AppDrawer} />
          <Stack.Screen
            name="AddProductScreen"
            component={AddProductScreen}
            options={{
              title: "Add Product",
              headerShown: true,
              presentation: 'modal' // Optional: makes it slide up from bottom
            }}
          />
          <Stack.Screen
            name="UpdateProductScreen"
            component={UpdateProductScreen}
            options={{
              title: "Update Product",
              headerShown: true,
              presentation: 'modal' // Optional: makes it slide up from bottom
            }}
          />
          <Stack.Screen
            name="JoinCourseScreen"
            component={JoinCourseScreen}
            options={{
              title: "Join Course",
              headerShown: true,
              presentation: 'modal'
            }}
          />
          <Stack.Screen
            name="CreateCourseScreen"
            component={CreateCourseScreen}
            options={{
              title: "Create Course",
              headerShown: true,
              presentation: 'modal'
            }}
          />
          <Stack.Screen
            name="StudentCourseDetailScreen"
            component={StudentCourseDetailScreen}
            options={{
              title: "Course Details",
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="TeacherCourseDetailScreen"
            component={TeacherCourseDetailScreen}
            options={{
              title: "Course Management",
              headerShown: false, // Using custom Appbar in component
            }}
          />
          <Stack.Screen
            name="UpdateCourseScreen"
            component={UpdateCourseScreen}
            options={{
              title: "Update Course",
              headerShown: false, // Using custom Appbar in component
            }}
          />
          <Stack.Screen
            name="GroupDetailScreen"
            component={GroupDetailScreen}
            options={{
              title: "Group Details",
              headerShown: false, // Using custom Appbar in component
            }}
          />
          <Stack.Screen
            name="AssessmentScreen"
            component={AssessmentScreen}
            options={{
              title: "Assessment",
              headerShown: false, // Using custom Appbar in component
            }}
          />
          <Stack.Screen
            name="AssessmentResultsScreen"
            component={AssessmentResultsScreen}
            options={{
              title: "Assessment Results",
              headerShown: false, // Using custom Appbar in component
            }}
          />
          <Stack.Screen
            name="JoinGroupScreen"
            component={JoinGroupScreen}
            options={{
              title: "Join or Create Group",
              headerShown: false, // Using custom Appbar in component
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  drawerHeader: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#f8f9fa',
  },
  drawerTitle: {
    marginBottom: 4,
    fontWeight: 'bold',
  },
  userInfo: {
    color: '#666',
  },
  drawerContent: {
    flex: 1,
    paddingTop: 8,
  },
  drawerFooter: {
    paddingBottom: 80, // Increased padding to prevent clash with navigation bar
  },
  menuItem: {
    paddingHorizontal: 16,
  },
  logoutItem: {
    paddingHorizontal: 16,
  },
  logoutText: {
    color: '#d32f2f',
  },
});