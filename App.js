import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

// Import the screens

// Recruit screens
import Register_Recruit from "./screens/Recruit/Register_Recruit";
import Login_Recruit from "./screens/Recruit/Login_Recruit";
import Home_Recruit from "./screens/Recruit/Home_Recruit";
import Intern_Recruit from "./screens/Recruit/Intern_Recruit";
import InternUpdate_Recruit from "./screens/Recruit/InternUpdate_Recruit";
import ProfilePic_Recruit from "./screens/Recruit/ProfilePic_Recruit";
import Profile_Recruit from "./screens/Recruit/Profile_Recruit";
import Settings_Recruit from "./screens/Recruit/Setting_Recruit";
import Notifications_Recruit from "./screens/Recruit/Notifications_Recruit";
import Contact_Recruit from "./screens/Recruit/Contact_Recruit";
import Applicants_Recruit from "./screens/Recruit/Applicants_Recruit";
import Interview_Recruit from "./screens/Recruit/Interview_Recruit";
import ApplicationReview_Recruit from "./screens/Recruit/ApplicationReview_Recruit";
import ForgotPass_Recruit from "./screens/Recruit/ForgotPass_Recruit";

// Intern screens
import Register_Intern from "./screens/Intern/Register_Intern";
import ProfilePicture_Intern from "./screens/Intern/ProfilePicture_Intern";
import Preferences_Intern from "./screens/Intern/Preferences_Intern";
import Login_Intern from "./screens/Intern/Login_Intern";
import Home_Intern from "./screens/Intern/Home_Intern";
import Profile_Intern from "./screens/Intern/Profile_Intern";
import Settings_Intern from "./screens/Intern/Settings_Intern";
import Notifications_Intern from "./screens/Intern/Notifications_Intern";
import Contact_Intern from "./screens/Intern/Contact_Intern";
import Apply_Intern from "./screens/Intern/Apply_Intern";
import Applications_Intern from "./screens/Intern/Applications_Intern";
import JournalPage_Intern from "./screens/Intern/JournalPage_Intern";
import JournalCreate_Intern from "./screens/Intern/JournalCreate_Intern";
import ForgotPass_intern from "./screens/Intern/ForgotPass_intern";

// Onboarding and RoleSelect screens
import LaunchScreen from "./screens/LaunchScreen";
import Onboarding1 from "./screens/Onboarding1";
import Onboarding2 from "./screens/Onboarding2";
import Onboarding3 from "./screens/Onboarding3";
import RoleSelect from "./screens/RoleSelect";

// Others
SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

export default function App() {
  // Load fonts
  const [loaded, error] = useFonts({
    "Poppins-Regular": require("./assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("./assets/fonts/Poppins-SemiBold.ttf"),
  });

  const [isSplashScreenHidden, setIsSplashScreenHidden] = useState(false);

  useEffect(() => {
    async function hideSplashScreen() {
      await SplashScreen.preventAutoHideAsync();
      setIsSplashScreenHidden(true);
    }
    hideSplashScreen();
  }, []);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded || !isSplashScreenHidden) {
    return null;
  }

  // Render the app
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="LaunchScreen"
      >
        {/* Onboarding screens */}
        <Stack.Screen name="LaunchScreen" component={LaunchScreen} />
        <Stack.Screen
          name="Onboarding1"
          component={Onboarding1}
          options={{
            gestureEnabled: true,
            gestureDirection: "horizontal",
          }}
        />
        <Stack.Screen
          name="Onboarding2"
          component={Onboarding2}
          options={{
            gestureEnabled: true,
            gestureDirection: "horizontal",
          }}
        />
        <Stack.Screen
          name="Onboarding3"
          component={Onboarding3}
          options={{
            gestureEnabled: true,
            gestureDirection: "horizontal",
          }}
        />
        <Stack.Screen name="RoleSelect" component={RoleSelect} />

        {/* Recruit screens */}
        <Stack.Screen name="LoginRecruit" component={Login_Recruit} />
        <Stack.Screen name="RegisterRecruit" component={Register_Recruit} />
        <Stack.Screen name="HomeRecruit" component={Home_Recruit} />
        <Stack.Screen name="InternRecruit" component={Intern_Recruit} />
        <Stack.Screen
          name="InternUpdateRecruit"
          component={InternUpdate_Recruit}
        />
        <Stack.Screen name="ProfilePicRecruit" component={ProfilePic_Recruit} />
        <Stack.Screen name="ProfileRecruit" component={Profile_Recruit} />
        <Stack.Screen name="SettingsRecruit" component={Settings_Recruit} />
        <Stack.Screen
          name="NotificationsRecruit"
          component={Notifications_Recruit}
        />
        <Stack.Screen name="ContactRecruit" component={Contact_Recruit} />
        <Stack.Screen name="ApplicantsRecruit" component={Applicants_Recruit} />
        <Stack.Screen name="InterviewRecruit" component={Interview_Recruit} />
        <Stack.Screen
          name="ApplicationReviewRecruit"
          component={ApplicationReview_Recruit}
        />
        <Stack.Screen name="ForgotPassRecruit" component={ForgotPass_Recruit} />

        {/* Intern screens */}
        <Stack.Screen name="Register_Intern" component={Register_Intern} />
        <Stack.Screen
          name="ProfilePicture_Intern"
          component={ProfilePicture_Intern}
        />
        <Stack.Screen
          name="Preferences_Intern"
          component={Preferences_Intern}
        />
        <Stack.Screen name="Login_Intern" component={Login_Intern} />
        <Stack.Screen name="Home_Intern" component={Home_Intern} />
        <Stack.Screen name="Profile_Intern" component={Profile_Intern} />
        <Stack.Screen name="Apply_Intern" component={Apply_Intern} />
        <Stack.Screen
          name="Applications_Intern"
          component={Applications_Intern}
        />
        <Stack.Screen name="Settings_Intern" component={Settings_Intern} />
        <Stack.Screen
          name="Notifications_Intern"
          component={Notifications_Intern}
        />
        <Stack.Screen name="Contact_Intern" component={Contact_Intern} />

        <Stack.Screen
          name="JournalPage_Intern"
          component={JournalPage_Intern}
          options={{
            headerShown: true,
            title: "Journal Home", // Set your custom header title here
            headerTitleStyle: {
              color: "#023E8A", // Set the title color here
              fontSize: 22, // Optional: adjust the font size
            },
            headerTintColor: "#023E8A", // Color for the back button and any icons
          }}
        />

        <Stack.Screen
          name="JournalCreate_Intern"
          component={JournalCreate_Intern}
          options={{
            headerShown: true,
            title: "Create Journal",
            headerTitleStyle: {
              color: "#023E8A", // Change the title color
              fontSize: 20, // You can adjust the font size as needed
            },
          }}
        />

        <Stack.Screen name="ForgotPass_intern" component={ForgotPass_intern} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
