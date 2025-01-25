import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput, Text, FAB, Card,IconButton } from 'react-native-paper';

export default function EditMealScreen({ route, navigation }) {
  const { meal } = route.params;
  const [mealName, setMealName] = useState(meal.name);
  const [calories, setCalories] = useState(meal.calories.toString());
  const [protein, setProtein] = useState(meal.protein.toString());
  const [carbs, setCarbs] = useState(meal.carbs.toString());
  const [fats, setFats] = useState(meal.fats.toString());

  const updateMeal = async () => {
    try {
      const savedMeals = await AsyncStorage.getItem('meals');
      const meals = savedMeals ? JSON.parse(savedMeals) : [];

      const updatedMeals = meals.map((m) =>
        m.id === meal.id
          ? { ...m, name: mealName, calories: parseInt(calories), protein: parseInt(protein), carbs: parseInt(carbs), fats: parseInt(fats) }
          : m
      );

      await AsyncStorage.setItem('meals', JSON.stringify(updatedMeals));
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update the meal');
    }
  };

  const deleteMeal = async () => {
    try {
      const savedMeals = await AsyncStorage.getItem('meals');
      const meals = savedMeals ? JSON.parse(savedMeals) : [];

      const updatedMeals = meals.filter((m) => m.id !== meal.id);
      await AsyncStorage.setItem('meals', JSON.stringify(updatedMeals));
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete the meal');
    }
  };

  return (
      <View className="flex-1 justify-center">
        <Card className="m-2 rounded-8 bg-white">
          <Card.Content>
            <View className="flex-row items-center">
            <Text className="text-3xl">Edit Meal</Text>
            <IconButton mode="contained" onPress={deleteMeal} className="bg-white" icon="delete" iconColor='red' size={35}></IconButton>
            </View>
            <TextInput
              mode="outlined"
              label="Meal Name"
              value={mealName}
              onChangeText={setMealName}
              className="mb-2"
            />
            <TextInput
              mode="outlined"
              label="Calories"
              keyboardType="numeric"
              value={calories}
              onChangeText={setCalories}
              className="mb-2"
            />
            <TextInput
              mode="outlined"
              label="Protein (g)"
              keyboardType="numeric"
              value={protein}
              onChangeText={setProtein}
              className="mb-2"
            />
            <TextInput
              mode="outlined"
              label="Carbs (g)"
              keyboardType="numeric"
              value={carbs}
              onChangeText={setCarbs}
              className="mb-2"
            />
            <TextInput
              mode="outlined"
              label="Fats (g)"
              keyboardType="numeric"
              value={fats}
              onChangeText={setFats}
              className="mb-2"
            />
          </Card.Content>

        </Card>
          <FAB
            icon="keyboard-backspace"
            className="absolute m-4 left-0 bottom-0 bg-green-500"
            onPress={() => navigation.goBack()}
          />
            <FAB
              icon="check"
              className="absolute m-4 right-0 bottom-0 bg-green-500"
              onPress={updateMeal}
            />
      </View>
  );
}
