import React, { useState, useEffect,  useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appbar, Button, Card, TextInput, FAB, Paragraph, useTheme,IconButton  } from 'react-native-paper';

export default function AddCategoryMealScreen({ route, navigation }) {
  const [meals, setMeals] = useState([]);
  const [categoryMeals, setCategoryMeals] = useState([]);
  const { category } = route.params || {}; 
  const { colors } = useTheme();
  const [sortOption, setSortOption] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMeals, setFilteredMeals] = useState([]);
  const sortOptions = ['calories', 'protein', 'carbs', 'fats']; // Define the sorting options
  const [currentSortIndex, setCurrentSortIndex] = useState(0);
  

  const fetchMeals = useCallback(async () => {
    try {
      const savedMeals = await AsyncStorage.getItem('meals');
      const parsedMeals = savedMeals ? JSON.parse(savedMeals) : [];
      const sortedMeals = sortMeals(parsedMeals,sortOption);
      setMeals(sortedMeals);
      if (!searchQuery) setFilteredMeals(sortedMeals);
    } catch {
      Alert.alert('Error', 'Failed to load meals');
    }
  }, [sortOption, sortDirection, searchQuery]);

  const fetchCategoryMeals = useCallback(async () => {
    try {
      const savedCategoryMeals = await AsyncStorage.getItem(`meals_${category}`);
      setCategoryMeals(savedCategoryMeals ? JSON.parse(savedCategoryMeals) : []);
    } catch {
      Alert.alert('Error', 'Failed to load category meals');
    }
  }, [category]);

  useEffect(() => {
    fetchMeals();
    fetchCategoryMeals();
  }, [fetchMeals, fetchCategoryMeals]);

  const sortMeals = (meals, option) => {
    const sortedMeals = [...meals].sort((a, b) => {
      switch (option) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'calories':
          return a.calories - b.calories;
        case 'protein':
          return a.protein - b.protein;
        case 'carbs':
          return a.carbs - b.carbs;
        case 'fats':
          return a.fats - b.fats;
        default:
          return 0;
      }
    });
    return sortDirection === 'asc' ? sortedMeals : sortedMeals.reverse();
  };

  const handleSearch = () => {
    const filtered = meals.filter((meal) =>
      meal.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMeals(filtered);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredMeals(meals);
  };
  const cycleSortOption = () => {
    const nextIndex = (currentSortIndex + 1) % sortOptions.length; // Cycle to the next index
    setSortOption(sortOptions[nextIndex]); // Set the new sort option
    setCurrentSortIndex(nextIndex); // Update the current index
  };

  const isMealInCategory = (mealId) =>
    categoryMeals.some((meal) => meal.id === mealId);

  const handleMealToggle = async (meal) => {
    const updatedCategoryMeals = isMealInCategory(meal.id)
      ? categoryMeals.filter((m) => m.id !== meal.id)
      : [...categoryMeals, { ...meal, quantity: 1 }];
    try {
      await AsyncStorage.setItem(`meals_${category}`, JSON.stringify(updatedCategoryMeals));
      setCategoryMeals(updatedCategoryMeals);
    } catch {
      Alert.alert('Error', 'Failed to update meal in category');
    }
  };

  const getMealQuantity = (mealId) =>
    categoryMeals.find((meal) => meal.id === mealId)?.quantity || 1;

  const handleQuantityChange = async (meal, delta) => {
    const updatedCategoryMeals = categoryMeals.map((m) =>
      m.id === meal.id
        ? { ...m, quantity: Math.max(1, m.quantity + delta) }
        : m
    );
    try {
      await AsyncStorage.setItem(`meals_${category}`, JSON.stringify(updatedCategoryMeals));
      setCategoryMeals(updatedCategoryMeals);
    } catch {
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.navigate('Home')} />
        <Appbar.Content title={`Manage ${category.charAt(0).toUpperCase() + category.slice(1)}`} />
      </Appbar.Header>

      {meals.length !==0? (
      <View style={styles.searchContainer}>
                <TextInput
                  mode="outlined"
                  label="Search Meals"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={styles.searchBar}
                />
                <Button mode="contained" onPress={handleSearch} style={styles.searchButton}>
                  Search
                </Button>
                {searchQuery ? (
                  <Button mode="text" onPress={handleClearSearch} style={styles.clearButton}>
                    Clear
                  </Button>
                ) : null}
              </View>
      ):(null)}

      {meals.length !==0? (
        <View style={styles.sortButtonsContainer}>
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
          mode={sortOption === sortOptions[currentSortIndex] ? 'contained' : 'outlined'}
          onPress={cycleSortOption}
          style={[styles.sortButton, sortOption === sortOptions[currentSortIndex] && styles.selectedButton]}
          labelStyle={[styles.sortButtonLabel, sortOption === sortOptions[currentSortIndex] && styles.selectedButtonLabel]}
        >
          {sortOptions[currentSortIndex][0].toUpperCase() + sortOptions[currentSortIndex].slice(1)} {/* Display option */}
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
      

      {filteredMeals.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No Meal Data Found</Text>
        </View>
      ) : (
        <FlatList
  data={filteredMeals}
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

      <Button mode="contained" onPress={() => navigation.navigate('Home')} style={styles.doneButton}>
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
    fontWeight: 'bold',
    fontSize: 38,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#007bff',
    marginHorizontal: 4,
  },
  clearButton: {
    marginHorizontal: 4,
    color: '#f00',
  },
});
