import React from 'react';
import { Text, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appbar, Button, Card, Divider } from 'react-native-paper';
import moment from 'moment';
import jsonData from '../app.json';

const max = 10000;

export default function Developermode({ navigation }) {
  const Version= jsonData.expo.version;

  const savePredefinedMealHistory = async () => {
    try {
      // Predefined data for the last 7 days
      const predefinedData = [];
  
      for (let i = 0; i < 7; i++) {
        // Calculate the date for the last 'i' days
        const date = moment().subtract(i, 'days').format('D MMM YYYY');
  
        // Randomly generating some meal data or using a pattern
        const historyData = {
          date,
          calories: 1800 + i * 50, // Example values, incrementing each day
          protein: 100 + i * 10,
          carbs: 200 + i * 15,
          fats: 60 + i * 5,
          water: 1000 + i*5,
        };
  
        predefinedData.push(historyData);
      }
  
      // Fetch existing meal history
      const existingHistory = await AsyncStorage.getItem('mealHistory');
      let historyArray = existingHistory ? JSON.parse(existingHistory) : [];
  
      // Add the predefined history data to the existing history
      historyArray = [...predefinedData, ...historyArray];
  
      // Save the updated history to AsyncStorage
      await AsyncStorage.setItem('mealHistory', JSON.stringify(historyArray));
  
      Alert.alert('Success', 'Predefined meal history saved!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save predefined meal history');
    }
  };

  const addPredefinedMeals = async () => {
    // Predefined meal data
    const predefinedMeals = [
      {
        name: 'Grilled Chicken Breast',
        calories: 250,
        protein: 40,
        carbs: 1,
        fats: 10,
      },
      {
        name: 'Veggie Salad',
        calories: 150,
        protein: 5,
        carbs: 20,
        fats: 7,
      },
      {
        name: 'Omelette',
        calories: 300,
        protein: 25,
        carbs: 3,
        fats: 20,
      },
      {
        name: 'Protein Shake',
        calories: 200,
        protein: 30,
        carbs: 10,
        fats: 5,
      },
      {
        name: 'Avocado Toast',
        calories: 350,
        protein: 8,
        carbs: 45,
        fats: 15,
      },
      {
        name: 'Pasta with Tomato Sauce',
        calories: 450,
        protein: 15,
        carbs: 70,
        fats: 12,
      },
      {
        name: 'Beef Steak',
        calories: 500,
        protein: 50,
        carbs: 0,
        fats: 25,
      },
    ];
  
    try {
      const savedMeals = await AsyncStorage.getItem('meals');
      const meals = savedMeals ? JSON.parse(savedMeals) : [];
  
      // Add predefined meals to the existing meals list
      const updatedMeals = predefinedMeals.map((meal) => ({
        id: Math.floor(Math.random() * max), // Generate random IDs for each meal
        ...meal,
      }));
  
      const newMealsList = [...meals, ...updatedMeals];
  
      // Save the updated meal list to AsyncStorage
      await AsyncStorage.setItem('meals', JSON.stringify(newMealsList));
  
      Alert.alert('Success', 'Predefined meals added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add predefined meals');
    }
  };

  const calculateStorageSize = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      for (const key of keys) {
        const item = await AsyncStorage.getItem(key);
        totalSize += item ? item.length : 0;
      }
      Alert.alert('Storage Size', `Total storage used: ${totalSize} bytes`);
    } catch (error) {
      Alert.alert('Error', 'Failed to calculate storage size');
    }
  };
  
  



  return (
    <ScrollView className="flex-1 bg-[#f5f5f5] p16">
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Developer Mode" />
      </Appbar.Header>

      <Card className="mx-3 mb-5 rounded-10 bg-white">
        <Card.Title title="App Info" />
        <Card.Content>
          <Text className="text-base mb-8 text-[#333]">Version: {Version}</Text>
          <Text className="text-base mb-8 text-[#333]">Environment: {__DEV__ ? 'Development' : 'Production'}</Text>
        </Card.Content>
      </Card>

      <Card className="mx-3 rounded-10 bg-white">
        <Card.Title title="Predefined Datas" />
        <Card.Content>
        <Button mode="contained" onPress={savePredefinedMealHistory} className="mb-4" >
        Add History Data
      </Button>
      <Button mode="contained" onPress={addPredefinedMeals} className="mb-4">
        Add Meals Data
      </Button>
      <Button mode="contained" onPress={calculateStorageSize} className="mb-4">
        App Data Size
      </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

