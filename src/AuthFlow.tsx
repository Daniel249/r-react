import { FontAwesome6 } from "@react-native-vector-icons/fontawesome6";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { IconButton } from "react-native-paper";

import { useAuth } from "./features/auth/presentation/context/authContext";
import LoginScreen from "./features/auth/presentation/screens/LoginScreen";
import SignupScreen from "./features/auth/presentation/screens/SignupScreen";
import AddProductScreen from "./features/products/presentation/screens/AddProductScreen";
import ProductListScreen from "./features/products/presentation/screens/ProductListScreen";
import UpdateProductScreen from "./features/products/presentation/screens/UpdateProductScreen";
import SettingScreen from "./features/settings/SettingScreen";

// Course screens
import CreateCourseScreen from "./features/products/presentation/screens/CreateCourseScreen";
import JoinCourseScreen from "./features/products/presentation/screens/JoinCourseScreen";
import StudentCourseDetailScreen from "./features/products/presentation/screens/StudentCourseDetailScreen";
import StudentCourseListScreen from "./features/products/presentation/screens/StudentCourseListScreen";
import TeacherCourseListScreen from "./features/products/presentation/screens/TeacherCourseListScreen";


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function AuthFlow() {
  const { isLoggedIn, logout, user } = useAuth();

  function StudentTabs() {
    return (
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          headerTitle: "Student Dashboard",
          headerRight: () => (
            <IconButton icon="logout" onPress={() => logout()} />
          ),
          headerTitleAlign: "left",
          headerStyle: {
            elevation: 0, // Remove shadow on Android
            shadowOpacity: 0, // Remove shadow on iOS
          },
        }}
      >
        <Tab.Screen
          name="MyCourses"
          component={StudentCourseListScreen}
          options={{
            title: "My Courses",
            tabBarIcon: ({ color }) => (
              <FontAwesome6 name="book" size={24} color={color} iconStyle="solid" />
            )
          }}
        />
        <Tab.Screen
          name="Products"
          component={ProductListScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome6 name="box" size={24} color={color} iconStyle="solid" />
            )
          }}
        />
        <Tab.Screen
          name="Profile"
          component={SettingScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome6 name="user" size={24} color={color} />
            )
          }}
        />
      </Tab.Navigator>
    );
  }

  function TeacherTabs() {
    return (
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          headerTitle: "Teacher Dashboard",
          headerRight: () => (
            <IconButton icon="logout" onPress={() => logout()} />
          ),
          headerTitleAlign: "left",
          headerStyle: {
            elevation: 0, // Remove shadow on Android
            shadowOpacity: 0, // Remove shadow on iOS
          },
        }}
      >
        <Tab.Screen
          name="MyCourses"
          component={TeacherCourseListScreen}
          options={{
            title: "My Courses",
            tabBarIcon: ({ color }) => (
              <FontAwesome6 name="chalkboard-user" size={24} color={color} iconStyle="solid" />
            )
          }}
        />
        <Tab.Screen
          name="Products"
          component={ProductListScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome6 name="box" size={24} color={color} iconStyle="solid" />
            )
          }}
        />
        <Tab.Screen
          name="Profile"
          component={SettingScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome6 name="user" size={24} color={color} />
            )
          }}
        />
      </Tab.Navigator>
    );
  }

  function ContentTabs() {
    // Default to student view if role is not set
    const userRole = user?.role || 'student';
    return userRole === 'teacher' ? <TeacherTabs /> : <StudentTabs />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="App" component={ContentTabs} />
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