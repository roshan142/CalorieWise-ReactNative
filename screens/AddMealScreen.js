import React, { useState } from 'react';
import {View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput, Button, Card, Title,FAB,Text } from 'react-native-paper';

const max = 10000;

export default function AddMealScreen({ route,navigation }) {
  const { from } = route.params;
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');

  const addMeal = async () => {
    if (!mealName || !calories || !protein || !carbs || !fats) {
      Alert.alert('Error', 'Please fill out all fields');
      return;
    }

    const newMeal = {
      id: Math.floor(Math.random() * max),
      name: mealName,
      calories: parseInt(calories),
      protein: parseInt(protein),
      carbs: parseInt(carbs),
      fats: parseInt(fats),
    };

    try {
      const savedMeals = await AsyncStorage.getItem('meals');
      const meals = savedMeals ? JSON.parse(savedMeals) : [];
      const updatedMeals = [...meals, newMeal];
      await AsyncStorage.setItem('meals', JSON.stringify(updatedMeals));
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to add the meal');
    }
  };

  const fromtab = () =>{ 
    if(from ==="cat"){
      navigation.navigate('ViewMeal')
    } else {
      navigation.goBack()
    }

  };

  return (
    <View className="flex-1 justify-center">
      <Card className="rounded-lg bg-gray-50">
        <Card.Content>
          <Title className="text-3xl font-bold mb-1 text-center">Add a New Meal</Title>
          <TextInput
            mode="outlined"
            label="Meal Name"
            value={mealName}
            onChangeText={setMealName}
            className="mb-3"
          />
          <TextInput
            mode="outlined"
            label="Calories"
            keyboardType="numeric"
            value={calories}
            onChangeText={setCalories}
            className="mb-3"
          />
          <TextInput
            mode="outlined"
            label="Protein (g)"
            keyboardType="numeric"
            value={protein}
            onChangeText={setProtein}
            className="mb-3"
          />
          <TextInput
            mode="outlined"
            label="Carbs (g)"
            keyboardType="numeric"
            value={carbs}
            onChangeText={setCarbs}
            className="mb-3"
          />
          <TextInput
            mode="outlined"
            label="Fats (g)"
            keyboardType="numeric"
            value={fats}
            onChangeText={setFats}
            className="mb-3"
          />
        </Card.Content>
      </Card>
      <FAB
          icon="keyboard-backspace"
          className="absolute m-4 left-0 bottom-0 bg-green-500"
          onPress={() => fromtab()}
        />
        <FAB
          icon="check"
          className="absolute m-4 right-0 bottom-0 bg-green-500"
          onPress={addMeal}
        />
    </View>
  );
}


