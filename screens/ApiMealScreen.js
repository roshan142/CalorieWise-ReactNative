import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Alert } from 'react-native';
import { Appbar, Button, Card, TextInput } from 'react-native-paper';
import app from '../api.json';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ApiMealScreen({ navigation }) {
  const API_KEY = app.expo.extra.apiKey;
  const BASE_URL = "https://api.calorieninjas.com/v1/nutrition?query=";
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [meals, setMeals] = useState([]);
  const max = 10000;

  // Fetch nutrition data from the API
  const fetchNutritionData = async () => {
    const apiUrl = BASE_URL + encodeURIComponent(searchQuery);
    try {
      setIsLoading(true);
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'X-Api-Key': API_KEY,
        },
      });
      if (response.ok) {
        const result = await response.json();
        setData(result.items);  // Set fetched data
      } else {
        const errorText = await response.text();
        alert(`Error: ${response.status} - ${errorText}`);
      }
    } catch (err) {
      alert(`Fetch Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear search query
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setData([]);
  }, []);

  // Load meals from AsyncStorage on initial render
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const savedMeals = await AsyncStorage.getItem('meals');
        const parsedMeals = savedMeals ? JSON.parse(savedMeals) : [];
        setMeals(parsedMeals);
      } catch (error) {
        console.error('Failed to load meals', error);
      }
    };

    fetchMeals();
  }, []);

  // Add a meal to the list and store it in AsyncStorage
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
      const savedMeals = await AsyncStorage.getItem('meals');
      const mealsList = savedMeals ? JSON.parse(savedMeals) : [];
      const updatedMeals = [...mealsList, newMeal];
      await AsyncStorage.setItem('meals', JSON.stringify(updatedMeals));
      setMeals(updatedMeals);  // Update local state to reflect added meal
      Alert.alert('Success', 'Meal added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add the meal');
    }
  };

  // Remove a meal from the list and AsyncStorage
  const removeMeal = async (item) => {
    try {
      const savedMeals = await AsyncStorage.getItem('meals');
      const mealsList = savedMeals ? JSON.parse(savedMeals) : [];
      const updatedMeals = mealsList.filter(meal => meal.name !== item.name);  // Remove by name or ID
      await AsyncStorage.setItem('meals', JSON.stringify(updatedMeals));
      setMeals(updatedMeals);  // Update local state
      Alert.alert('Success', 'Meal removed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove the meal');
    }
  };

  // Check if the meal is already added
  const isMealAdded = (item) => {
    return meals.some(meal => meal.name === item.name);
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Api Meal" />
      </Appbar.Header>

      <View style={styles.searchContainer}>
        <TextInput
          mode="outlined"
          label="Search Meals"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
        />
        {searchQuery ? (
          <Button mode="text" onPress={clearSearch} style={styles.clearButton}>
            Clear
          </Button>
        ) : null}
      </View>

      <View style={styles.container}>
        <Button mode="contained" onPress={fetchNutritionData} style={styles.button}>
          Fetch Nutrition Data
        </Button>

        {isLoading && <ActivityIndicator size="large" color="blue" style={styles.loader} />}

        {data && (
          <FlatList
            data={data}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Card style={styles.card}>
                <Card.Content>
                  <Text style={styles.itemText}>Food: {item.name}</Text>
                  <Text>Size: {item.serving_size_g}g</Text>
                  <Text>Calories: {item.calories}cal</Text>
                  <Text>Protein: {item.protein_g}g</Text>
                  <Text>Carbs: {item.carbohydrates_total_g}g</Text>
                  <Text>Fats: {item.fat_total_g}g</Text>
                  <Button
                    mode="contained"
                    onPress={() => isMealAdded(item) ? removeMeal(item) : addMeal(item)}
                    style={styles.addButton}
                    icon={isMealAdded(item) ? 'minus' : 'plus'}
                  >
                    {isMealAdded(item) ? 'Remove' : 'Add'}
                  </Button>
                </Card.Content>
              </Card>
            )}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginVertical: 20,
    paddingVertical: 10,
  },
  loader: {
    marginVertical: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
  },
  clearButton: {
    marginLeft: 8,
  },
  card: {
    marginVertical: 10,
    borderRadius: 8,
    elevation: 3,
  },
  itemText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    marginTop: 10,
    marginBottom: 10,
  },
});
