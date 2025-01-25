import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator, FlatList, Alert } from 'react-native';
import { Appbar, Button, Card, TextInput,Divider } from 'react-native-paper';
import app from './api.json';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ApiMealScreen({ navigation }) {
  const API_KEYS = [app.expo.apiKey.a, app.expo.apiKey.b, app.expo.apiKey.c, app.expo.apiKey.d];
  const BASE_URL = "https://api.calorieninjas.com/v1/nutrition?query=";
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [meals, setMeals] = useState([]);
  const max = 10000;

  const fetchNutritionData = async () => {
    if (!searchQuery.trim()) {
      Alert.alert("Invalid Input", "Please enter a valid query.");
      return;
    }

    let success = false;
    for (const apiKey of API_KEYS) {
      try {
        setIsLoading(true);
        const response = await fetch(`${BASE_URL}${encodeURIComponent(searchQuery)}`, {
          method: 'GET',
          headers: { 'X-Api-Key': apiKey },
        });

        if (response.ok) {
          const result = await response.json();
          setData(result.items);
          success = true;
          break;
        } else {
          console.warn(`API Key ${apiKey} failed with status ${response.status}`);
        }
      } catch (err) {
        console.warn(`Error with API Key ${apiKey}: ${err.message}`);
      }
    }

    if (!success) Alert.alert("Error", "All API keys failed. Please try again later.");
    setIsLoading(false);
  };

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setData(null);
  }, []);

  useEffect(() => {
    const loadMeals = async () => {
      try {
        const storedMeals = await AsyncStorage.getItem('meals');
        setMeals(storedMeals ? JSON.parse(storedMeals) : []);
      } catch (error) {
        console.error("Failed to load meals", error);
      }
    };

    loadMeals();
  }, []);

  const addMeal = async (item) => {
    const newMeal = {
      id: Math.floor(Math.random() * max),
      name: item.name,
      calories: item.calories,
      protein: item.protein_g,
      carbs: item.carbohydrates_total_g,
      fats: item.fat_total_g,
    };

    try {
      const storedMeals = await AsyncStorage.getItem('meals');
      const updatedMeals = [...(storedMeals ? JSON.parse(storedMeals) : []), newMeal];
      await AsyncStorage.setItem('meals', JSON.stringify(updatedMeals));
      setMeals(updatedMeals);
      Alert.alert("Success", "Meal added successfully.");
    } catch {
      Alert.alert("Error", "Failed to add the meal.");
    }
  };

  const removeMeal = async (item) => {
    try {
      const storedMeals = await AsyncStorage.getItem('meals');
      const updatedMeals = storedMeals
        ? JSON.parse(storedMeals).filter((meal) => meal.name !== item.name)
        : [];
      await AsyncStorage.setItem('meals', JSON.stringify(updatedMeals));
      setMeals(updatedMeals);
      Alert.alert("Success", "Meal removed successfully.");
    } catch {
      Alert.alert("Error", "Failed to remove the meal.");
    }
  };

  const isMealAdded = (item) => meals.some((meal) => meal.name === item.name);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="API Meal Search" />
      </Appbar.Header>

      <View className="flex-row items-center">
        <TextInput
          mode="outlined"
          label="Search Meals"
          placeholder="e.g., rice, chicken"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 mr-4"
        />
        {searchQuery && (
          <Button mode="text" onPress={clearSearch} className="ml-4">
            Clear
          </Button>
        )}
      </View>

      <View className="flex-1 p-6 bg-[#f9f9f9]">
        <Button mode="contained" onPress={fetchNutritionData} className="my-2">
          SEARCH
        </Button>

        {isLoading && <ActivityIndicator size="large" color="blue" className="my-20" />}

        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Card className="my-8 rounded-10">
              <Card.Content>
                <Text className="text-xl font-bold mb-3">{item.name}</Text>
                <Text className="text-base mb-2">Calories: {item.calories} kcal</Text>
                <Divider />
                <Text className="text-base mb-2">Protein: {item.protein_g}g</Text>
                <Text className="text-base mb-2">Carbs: {item.carbohydrates_total_g}g</Text>
                <Text className="text-base mb-2">Fats: {item.fat_total_g}g</Text>
                <Divider />
                <Text className="text-base mb-2">Serving Size: {item.serving_size_g}g</Text>
                <Text className="text-base mb-2">Fibre: {item.fiber_g}g</Text>
                <Text className="text-base mb-2">Sugar: {item.sugar_g}g</Text>
                <Button
                  mode={isMealAdded(item) ? "outlined" :"contained"}
                  onPress={() => (isMealAdded(item) ? removeMeal(item) : addMeal(item))}
                  className="mt-2"
                  icon={isMealAdded(item) ? "minus" : "plus"}
                >
                  {isMealAdded(item) ? "Remove" : "Add"}
                </Button>
              </Card.Content>
            </Card>
          )}
        />
      </View>
    </>
  );
}


