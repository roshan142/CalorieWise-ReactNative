import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appbar, Button, Card, List, FAB, Paragraph, useTheme,IconButton  } from 'react-native-paper';

export default function AddCategoryMealScreen({ route, navigation }) {
  const [meals, setMeals] = useState([]);
  const [categoryMeals, setCategoryMeals] = useState([]);
  const { category } = route.params || {}; 
  const { colors } = useTheme();

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const savedMeals = await AsyncStorage.getItem('meals');
        const parsedMeals = savedMeals ? JSON.parse(savedMeals) : [];
        setMeals(parsedMeals);
      } catch (error) {
        Alert.alert('Error', 'Failed to load meals');
      }
    };

    const fetchCategoryMeals = async () => {
      try {
        const existingMeals = await AsyncStorage.getItem(`meals_${category}`);
        const parsedCategoryMeals = existingMeals ? JSON.parse(existingMeals) : [];
        setCategoryMeals(parsedCategoryMeals);
      } catch (error) {
        Alert.alert('Error', 'Failed to load category meals');
      }
    };

    fetchMeals();
    fetchCategoryMeals();
    const intervalId = setInterval(fetchMeals, 100);
    return () => clearInterval(intervalId);
  }, [category]);

  const isMealInCategory = (mealId) => {
    return categoryMeals.some(meal => meal.id === mealId);
  };

  const handleMealToggle = async (meal) => {
    try {
      let updatedCategoryMeals = [...categoryMeals];
      if (isMealInCategory(meal.id)) {
        updatedCategoryMeals = updatedCategoryMeals.filter(m => m.id !== meal.id);
      } else {
        meal.quantity = 1;
        updatedCategoryMeals.push(meal);
      }
      await AsyncStorage.setItem(`meals_${category}`, JSON.stringify(updatedCategoryMeals));
      setCategoryMeals(updatedCategoryMeals);
    } catch (error) {
      Alert.alert('Error', 'Failed to update meal in category');
    }
  };
  const getMealQuantity = (mealId) => {
    const meal = categoryMeals.find((meal) => meal.id === mealId);
    return meal ? meal.quantity : 1;
  };
  const handleQuantityChange = (meal, delta) => {
    const existingMealIndex = categoryMeals.findIndex((m) => m.id === meal.id);
    let updatedCategoryMeals = [...categoryMeals];
  
    if (existingMealIndex !== -1) {
      updatedCategoryMeals[existingMealIndex].quantity = Math.max(
        1,
        updatedCategoryMeals[existingMealIndex].quantity + delta
      );
    } else {
      meal.quantity = Math.max(1, 1 + delta);
      updatedCategoryMeals.push(meal);
    }
  
    setCategoryMeals(updatedCategoryMeals);
    AsyncStorage.setItem(`meals_${category}`, JSON.stringify(updatedCategoryMeals));
  };

  const removeDuplicateMeals = (meals) => {
    const uniqueMeals = [];
    const mealIds = new Set();
  
    meals.forEach((meal) => {
      if (!mealIds.has(meal.id)) {
        uniqueMeals.push(meal);
        mealIds.add(meal.id);
      }
    });
  
    return uniqueMeals;
  };
  
  

  const handleSave = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`Manage ${category.charAt(0).toUpperCase() + category.slice(1)}`} />
      </Appbar.Header>

      {meals.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No Meal Data Found</Text>
        </View>
      ) : (
        <FlatList
  data={meals}
  renderItem={({ item }) => (
    <Card style={styles.mealCard}>
      <Card.Content>
        <View style={styles.mealInfo}>
          <Text style={styles.mealName}>{item.name}</Text>
          <Paragraph style={styles.nutrientText}>Calories: {item.calories * getMealQuantity(item.id)} cal</Paragraph>
          <Paragraph style={styles.nutrientText}>Protein: {item.protein * getMealQuantity(item.id)}g</Paragraph>
          <Paragraph style={styles.nutrientText}>Carbs: {item.carbs * getMealQuantity(item.id)}g</Paragraph>
          <Paragraph style={styles.nutrientText}>Fats: {item.fats * getMealQuantity(item.id)}g</Paragraph>
        </View>
        <View style={styles.quantityContainer}>
          <IconButton
            icon="minus"
            size={20}
            onPress={() => handleQuantityChange(item, -1)}
            disabled={!isMealInCategory(item.id)}
          />
          <Text style={styles.quantityText}>{getMealQuantity(item.id)}</Text>
          <IconButton
            icon="plus"
            size={20}
            onPress={() => handleQuantityChange(item, 1)}
            disabled={!isMealInCategory(item.id)}
          />
        </View>

        <Button
          mode={isMealInCategory(item.id) ? "outlined" : "contained"}
          onPress={() => handleMealToggle(item)}
          style={[
            styles.toggleButton,
            {
              backgroundColor: isMealInCategory(item.id) ? colors.surface : colors.primary,
              borderColor: colors.primary,
            },
          ]}
          labelStyle={{
            color: isMealInCategory(item.id) ? colors.primary : colors.background,
          }}
        >
          {isMealInCategory(item.id) ? "Remove" : "Add"}
        </Button>
      </Card.Content>
    </Card>
  )}
  keyExtractor={(item, index) => `${item.id}-${index}`} // Ensure unique keys
/>

      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddMeal', "cat")}
      />

      <Button mode="contained" onPress={handleSave} style={styles.doneButton}>
        Done
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  mealCard: {
    marginVertical: 8,
    borderRadius: 8,
    elevation: 4,
    backgroundColor: '#fff',
  },
  mealInfo: {
    marginBottom: 8,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  nutrientText: {
    fontSize: 14,
    color: '#555',
  },
  toggleButton: {
    alignSelf: 'flex-end',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80,
    backgroundColor: 'grey',
  },
  doneButton: {
    marginTop: 16,
    backgroundColor: '#6750a5',
    paddingVertical: 8,
    borderRadius: 25,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 18,
    color: '#888',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});
