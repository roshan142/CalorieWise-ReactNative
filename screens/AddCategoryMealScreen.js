import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appbar, Button, Card, List, FAB, Paragraph, useTheme,IconButton  } from 'react-native-paper';

export default function AddCategoryMealScreen({ route, navigation }) {
  const [meals, setMeals] = useState([]);
  const [categoryMeals, setCategoryMeals] = useState([]);
  const { category } = route.params || {}; 
  const { colors } = useTheme();
  const [sortOption, setSortOption] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const savedMeals = await AsyncStorage.getItem('meals');
        const parsedMeals = savedMeals ? JSON.parse(savedMeals) : [];
        const sortedMeals = sortMeals(parsedMeals, sortOption);
        setMeals([...sortedMeals]);
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
  }, [category,sortOption,sortDirection]);


  const sortMeals = (meals, option) => {
    let sortedMeals;
    switch (option) {
      case 'name':
        sortedMeals = meals.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'calories':
        sortedMeals = meals.sort((a, b) => a.calories - b.calories);
        break;
      default:
        sortedMeals = meals;
    }
    return sortDirection === 'asc' ? sortedMeals : sortedMeals.reverse();
  };

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

  const handleSave = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`Manage ${category.charAt(0).toUpperCase() + category.slice(1)}`} />
      </Appbar.Header>

      {meals.length !==0? (
        <View style={styles.sortButtonsContainer}>
          <Text style={styles.mealName}>Sort By</Text>
        <Button
          mode={sortOption === 'name' ? 'contained' : 'outlined'}
          onPress={() => setSortOption('name')}
          style={[
            styles.sortButton,
            sortOption === 'name' && styles.selectedButton,
          ]}
          labelStyle={[
            styles.sortButtonLabel,
            sortOption === 'name' && styles.selectedButtonLabel,
          ]}
        >
          A👉Z
        </Button>
        <Button
          mode={sortOption === 'calories' ? 'contained' : 'outlined'}
          onPress={() => setSortOption('calories')}
          style={[
            styles.sortButton,
            sortOption === 'calories' && styles.selectedButton,
          ]}
          labelStyle={[
            styles.sortButtonLabel,
            sortOption === 'calories' && styles.selectedButtonLabel,
          ]}
        >
          Cal
        </Button>
        <Button
          mode="outlined"
          onPress={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
          style={styles.toggleButton}
          labelStyle={styles.toggleButtonLabel}
        >
          {sortDirection === 'asc' ? '👆' : '👇'}
        </Button>
      </View>
      ): (null)}
      

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
    backgroundColor: '#f9f9f9',
  },
  mealCard: {
    marginVertical: 8,
    borderRadius: 12,
    elevation: 3,
    backgroundColor: '#ffffff',
    padding: 8,
  },
  mealInfo: {
    marginBottom: 8,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  nutrientText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  toggleButton: {
    alignSelf: 'flex-end',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginTop: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80,
    backgroundColor: '#007bff',
  },
  doneButton: {
    marginTop: 16,
    backgroundColor: '#4caf50',
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 18,
    color: '#95a5a6',
    textAlign: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  sortButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  sortButton: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#007bff',
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  selectedButton: {
    backgroundColor: '#007bff',
  },
  sortButtonLabel: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedButtonLabel: {
    color: '#ffffff',
  },
  toggleButton: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#f39c12',
    backgroundColor: '#f39c12',
    elevation: 2,
  },
  toggleButtonLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});
