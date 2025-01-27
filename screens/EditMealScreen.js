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
    <View className="flex-1 justify-center bg-gray-100">

    {/* Meal Edit Card */}
    <Card className="m-4 rounded-xl bg-white shadow-lg">
      <Card.Content>
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-3xl font-bold text-[#2c3e50]">Edit Meal</Text>
          <IconButton 
            mode="contained" 
            onPress={deleteMeal} 
            className="bg-white  border-red-500 p-2 rounded-full"
            icon="delete" 
            iconColor="red" 
            size={35} 
          />
        </View>
  
        {/* Meal Name Input */}
        <TextInput
          mode="outlined"
          label="Meal Name"
          value={mealName}
          onChangeText={setMealName}
          className="mb-4 rounded-12 shadow-md"
        />
  
        {/* Calories Input */}
        <TextInput
          mode="outlined"
          label="Calories"
          keyboardType="numeric"
          value={calories}
          onChangeText={setCalories}
          className="mb-4 rounded-12 shadow-md"
        />
  
        {/* Protein Input */}
        <TextInput
          mode="outlined"
          label="Protein (g)"
          keyboardType="numeric"
          value={protein}
          onChangeText={setProtein}
          className="mb-4 rounded-12 shadow-md"
        />
  
        {/* Carbs Input */}
        <TextInput
          mode="outlined"
          label="Carbs (g)"
          keyboardType="numeric"
          value={carbs}
          onChangeText={setCarbs}
          className="mb-4 rounded-12 shadow-md"
        />
  
        {/* Fats Input */}
        <TextInput
          mode="outlined"
          label="Fats (g)"
          keyboardType="numeric"
          value={fats}
          onChangeText={setFats}
          className="mb-4 rounded-12 shadow-md"
        />
      </Card.Content>
    </Card>
  
    {/* Floating Action Buttons */}
    <FAB
      icon="keyboard-backspace"
      className="absolute left-4 bottom-10 bg-green-500 p-4 rounded-3 shadow-lg"
      onPress={() => navigation.goBack()}
    />
    <FAB
      icon="check"
      className="absolute right-4 bottom-10 bg-green-500 p-4 rounded-3 shadow-lg"
      onPress={updateMeal}
    />
  
  </View>
  
  );
}
