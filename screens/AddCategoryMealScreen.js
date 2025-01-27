import React, {useState, useEffect,  useCallback} from 'react';
import {View, Text, FlatList, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Button, Card, TextInput, FAB, Paragraph, useTheme,IconButton} from 'react-native-paper';
import moment from 'moment';

export default function AddCategoryMealScreen({ route, navigation }) {
  const [meals, setMeals] = useState([]);
  const [categoryMeals, setCategoryMeals] = useState([]);
  const { category } = route.params || {}; 
  const { colors } = useTheme();
  const [sortOption, setSortOption] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMeals, setFilteredMeals] = useState([]);
  const sortOptions = ['cal', 'protein', 'carbs', 'fats']; // Define the sorting options
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
        case 'cal':
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
      if (updatedCategoryMeals.length > 0) {
        const todayDate = moment().format('D MMM YYYY');
        await AsyncStorage.setItem('MealAddedDate', todayDate);
      } else {
        await AsyncStorage.removeItem('MealAddedDate');
      }
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
    <View className="flex-1 p-6 bg-blue-50">

  {/* Search Meal Section */}
  {meals.length !== 0 && (
    <View className="flex-row items-center mt-5 mb-4">
      <TextInput
        mode="outlined"
        label="Search Meals"
        value={searchQuery}
        onChangeText={setSearchQuery}
        className="flex-1 mr-2 bg-white rounded-12 shadow-md"
      />
      <IconButton 
        mode="contained" 
        icon="search-web" 
        onPress={handleSearch} 
        className="bg-blue-50 text-white rounded-12" 
        size={35} 
      />
      {searchQuery && (
        <IconButton 
          mode="contained" 
          icon="delete" 
          iconColor='red'
          onPress={handleClearSearch} 
          className="bg-blue-50 text-white rounded-12 ml-2" 
          size={35} 
        />
      )}
    </View>
  )}

  {/* Sorting Buttons */}
  {meals.length !== 0 && (
    <View className="flex-row justify-between items-center mt-4 mb-4">
      <Button
        mode={sortOption === 'name' ? 'contained' : 'outlined'}
        onPress={() => setSortOption('name')}
        className={`flex-1 mx-2 rounded-25 border-[#007bff] bg-white ${sortOption === 'name' ? 'bg-[#007bff]' : ''}`}
        labelStyle={[
          { color: '#007bff', fontSize: 14, fontWeight: '500' },
          sortOption === 'name' && { color: '#ffffff' },
        ]}
      >
        A👉Z
      </Button>
      <Button
        mode={sortOption === sortOptions[currentSortIndex] ? 'contained' : 'outlined'}
        onPress={cycleSortOption}
        className={`flex-1 mx-2 rounded-25 border-[#007bff] bg-white ${sortOption === sortOptions[currentSortIndex] ? 'bg-[#007bff]' : ''}`}
        labelStyle={[
          { color: '#007bff', fontSize: 12, fontWeight: 'bold' },
          sortOption === sortOptions[currentSortIndex] && { color: '#ffffff' },
        ]}
      >
        {sortOptions[currentSortIndex][0].toUpperCase() + sortOptions[currentSortIndex].slice(1)}
      </Button>
      <Button
        mode="outlined"
        onPress={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
        className="self-end rounded-20 px-4 border-[#f39c12] bg-[#f39c12] text-white"
        labelStyle={{ fontSize: 14, fontWeight: '500' }}
      >
        {sortDirection === 'asc' ? '👆' : '👇'}
      </Button>
    </View>
  )}

  {/* No Data Found Section */}
  {filteredMeals.length === 0 ? (
    <View className="flex-1 justify-center items-center mt-10">
      <Text className="font-bold text-base text-[#95a5a6] text-center">No Meal Data Found</Text>
    </View>
  ) : (
    <FlatList
      data={filteredMeals}
      renderItem={({ item }) => (
        <Card className="my-4 rounded-12 bg-white p-4 shadow-md">
          <Card.Content>
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-[#2c3e50]">{item.name}</Text>
              <IconButton
                onPress={() => handleMealToggle(item)}
                className="bg-white"
                icon={isMealInCategory(item.id) ? "delete" : "plus-circle"}
                iconColor={isMealInCategory(item.id) ? "red" : "black"}
              />
            </View>
            <View className="flex-row items-center mt-2">
              <IconButton
                icon="minus"
                size={20}
                onPress={() => handleQuantityChange(item, -1)}
                disabled={!isMealInCategory(item.id)}
              />
              <Text className="text-base font-bold">{getMealQuantity(item.id)}</Text>
              <IconButton
                icon="plus"
                size={20}
                onPress={() => handleQuantityChange(item, 1)}
                disabled={!isMealInCategory(item.id)}
              />
            </View>
            <Paragraph className="text-base text-[#7f8c8d] mt-2">
              Calories: <Text className="font-bold">{Math.round(item.calories * getMealQuantity(item.id))} cal</Text>
            </Paragraph>
            <Paragraph className="text-base text-[#7f8c8d]">
              Protein: <Text className="font-bold">{Math.round(item.protein * getMealQuantity(item.id))}g</Text>
            </Paragraph>
            <Paragraph className="text-base text-[#7f8c8d]">
              Carbs: <Text className="font-bold">{Math.round(item.carbs * getMealQuantity(item.id))}g</Text>
            </Paragraph>
            <Paragraph className="text-base text-[#7f8c8d]">
              Fats: <Text className="font-bold">{Math.round(item.fats * getMealQuantity(item.id))}g</Text>
            </Paragraph>
          </Card.Content>
        </Card>
      )}
      keyExtractor={(item, index) => `${item.id}-${index}`}
    />
  )}

  {/* Floating Action Button */}
  <FAB
    icon="plus"
    className="absolute m-4 right-4 bottom-16 bg-[#007bff] shadow-lg"
    onPress={() => navigation.navigate('AddMeal', "cat")}
  />

  {/* Done Button */}
  <Button
    mode="contained"
    onPress={() => navigation.navigate('Home')}
    className="mt-4 bg-[#4caf50] py-2 rounded-25 items-center shadow-lg"
  >
    Done
  </Button>
</View>

  );
}
