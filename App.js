import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {useEffect} from 'react';

// Import the screens
import Register_Recruit from './screens/Recruit/Register_Recruit';
import Login_Recruit from './screens/Recruit/Login_Recruit';
import Home_Recruit from './screens/Recruit/Home_Recruit';
import Intern_Recruit from './screens/Recruit/Intern_Recruit';
import InternUpdate_Recruit from './screens/Recruit/InternUpdate_Recruit';


SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

export default function App() {
  const [loaded, error] = useFonts({
    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }
  return (
    <NavigationContainer>
      <Stack.Navigator>
        
        <Stack.Screen name="RegisterRecruit" component={Register_Recruit} />
        <Stack.Screen name="LoginRecruit" component={Login_Recruit} />
        <Stack.Screen name='HomeRecruit' component={Home_Recruit} />
        <Stack.Screen name='InternRecruit' component={Intern_Recruit} />
        <Stack.Screen name='InternUpdateRecruit' component={InternUpdate_Recruit} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
