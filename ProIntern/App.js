import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Register_Recruit from './screens/Register_Recruit';
import Login_Recruit from './screens/Login_Recruit';
import Home_Recruit from './screens/Home_Recruit';
import Intern_Recruit from './screens/Intern_Recruit';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="RegisterRecruit" component={Register_Recruit} />
        <Stack.Screen name="LoginRecruit" component={Login_Recruit} />
        <Stack.Screen name='HomeRecruit' component={Home_Recruit} />
        <Stack.Screen name='InternRecruit' component={Intern_Recruit} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
