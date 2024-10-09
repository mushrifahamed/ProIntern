import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home_Recruit from "./screens/Recruit/Home_Recruit";
import Intern_Recruit from "./screens/Recruit/Intern_Recruit";
import Profile_Recruit from "./screens/Recruit/Profile_Recruit";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Intern") {
            iconName = focused ? "briefcase" : "briefcase-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" component={Home_Recruit} />
      <Tab.Screen name="Intern" component={Intern_Recruit} />
      <Tab.Screen name="Profile" component={Profile_Recruit} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
