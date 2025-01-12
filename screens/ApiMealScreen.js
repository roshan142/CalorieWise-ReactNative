import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Alert } from 'react-native';
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

      <View style={styles.searchContainer}>
        <TextInput
          mode="outlined"
          label="Search Meals"
          placeholder="e.g., rice, chicken"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
        />
        {searchQuery && (
          <Button mode="text" onPress={clearSearch} style={styles.clearButton}>
            Clear
          </Button>
        )}
      </View>

      <View style={styles.container}>
        <Button mode="contained" onPress={fetchNutritionData} style={styles.searchButton}>
          SEARCH
        </Button>

        {isLoading && <ActivityIndicator size="large" color="blue" style={styles.loader} />}

        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.details}>Calories: {item.calories} kcal</Text>
                <Divider />
                <Text style={styles.details}>Protein: {item.protein_g}g</Text>
                <Text style={styles.details}>Carbs: {item.carbohydrates_total_g}g</Text>
                <Text style={styles.details}>Fats: {item.fat_total_g}g</Text>
                <Divider />
                <Text style={styles.details}>Serving Size: {item.serving_size_g}g</Text>
                <Text style={styles.details}>Fibre: {item.fiber_g}g</Text>
                <Text style={styles.details}>Sugar: {item.sugar_g}g</Text>
                <Button
                  mode={isMealAdded(item) ? "outlined" :"contained"}
                  onPress={() => (isMealAdded(item) ? removeMeal(item) : addMeal(item))}
                  style={styles.actionButton}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
  },
  clearButton: {
    marginLeft: 8,
  },
  searchButton: {
    marginVertical: 16,
  },
  loader: {
    marginVertical: 20,
  },
  card: {
    marginVertical: 8,
    borderRadius: 10,
    elevation: 2,
  },
  foodName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  details: {
    fontSize: 14,
    marginBottom: 4,
  },
  actionButton: {
    marginTop: 12,
  },
});
