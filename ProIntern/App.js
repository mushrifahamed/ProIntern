import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Register_Recruit from './screens/Register_Recruit';
import Login_Recruit from './screens/Login_Recruit';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="LoginRecruit" component={Login_Recruit} />
        <Stack.Screen name="RegisterRecruit" component={Register_Recruit} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
