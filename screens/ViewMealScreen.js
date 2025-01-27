import React, { useState,useCallback } from 'react';
import { View, FlatList, Text, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FAB, Card, Title, Paragraph, Button,TextInput,IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

export default function ViewMealScreen({ navigation }) {
  const [meals, setMeals] = useState([]);
  const [visibleMeals, setVisibleMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 4;
  const [sortOption, setSortOption] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const sortOptions = ['calories', 'protein', 'carbs', 'fats']; // Define the sorting options
  const [currentSortIndex, setCurrentSortIndex] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const fetchMeals = async () => {
        try {
          const savedMeals = await AsyncStorage.getItem('meals');
          const parsedMeals = savedMeals ? JSON.parse(savedMeals) : [];
          const sortedMeals = sortMeals(parsedMeals, sortOption);
          setMeals([...sortedMeals]);
          setVisibleMeals(sortedMeals.slice(0, itemsPerPage));
        } catch (error) {
          console.error('Failed to load meals', error);
        }
      };

      fetchMeals();
    }, [sortOption, sortDirection])
  );

  const loadMoreMeals = () => {
    if (!loading && visibleMeals.length < meals.length) {
      setLoading(true);
      setTimeout(() => {
        const newPage = page + 1;
        setVisibleMeals(meals.slice(0, newPage * itemsPerPage));
        setPage(newPage);
        setLoading(false);
      }, 500); // Simulate a network delay
    }
  };

  const deleteMeal = async (mealId) => {
    try {
      const savedMeals = await AsyncStorage.getItem('meals');
      const meals = savedMeals ? JSON.parse(savedMeals) : [];
      const updatedMeals = meals.filter((m) => m.id !== mealId);
      await AsyncStorage.setItem('meals', JSON.stringify(updatedMeals));
      setMeals(updatedMeals);
      setVisibleMeals(updatedMeals.slice(0, page * itemsPerPage));
    } catch (error) {
      Alert.alert('Error', 'Failed to delete the meal');
    }
  };

  const sortMeals = (meals, option) => {
    let sortedMeals;
    switch (option) {
      case 'name':
        sortedMeals = [...meals].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'calories':
        sortedMeals = [...meals].sort((a, b) => a.calories - b.calories);
        break;
      case 'protein':
        sortedMeals = [...meals].sort((a, b) => a.protein - b.protein);
        break;
      case 'carbs':
        sortedMeals = [...meals].sort((a, b) => a.carbs - b.carbs);
        break;
      case 'fats':
        sortedMeals = [...meals].sort((a, b) => a.fats - b.fats);
        break;
      default:
        sortedMeals = meals;
    }
    return sortDirection === 'asc' ? sortedMeals : sortedMeals.reverse();
  };

  const handleSearch = useCallback(() => {
    setDebouncedQuery(searchQuery.trim().toLowerCase());
  }, [searchQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
    setVisibleMeals(meals.slice(0, page * itemsPerPage)); // Reset to paginated meals
  }, [meals, page]);

  const cycleSortOption = () => {
    const nextIndex = (currentSortIndex + 1) % sortOptions.length; // Cycle to the next index
    setSortOption(sortOptions[nextIndex]); // Set the new sort option
    setCurrentSortIndex(nextIndex); // Update the current index
  };

  const renderMeal = ({ item }) => (
    <Card className="mb-5 bg-white rounded-xl shadow-lg p-4">
      <Card.Content>
        <View className="flex-row items-center justify-between">
          <Title className="text-lg font-bold text-[#333]">{item.name}</Title>
          <View className="flex-row">
            <IconButton
              mode="contained"
              onPress={() => navigation.navigate('EditMeal', { meal: item })}
              icon="square-edit-outline"
              iconColor="#007bff"
              size={25}
              className="bg-[#eaf2ff] rounded-full"
            />
            <IconButton
              onPress={() => deleteMeal(item.id)}
              icon="delete"
              iconColor="#e74c3c"
              size={25}
              className="bg-[#fdecea] rounded-full"
            />
          </View>
        </View>
        <Paragraph className="text-sm text-[#555] mt-2">
          Calories: <Text className="font-semibold">{item.calories} cal</Text>
        </Paragraph>
        <Paragraph className="text-sm text-[#555]">
          Protein: <Text className="font-semibold">{item.protein}g</Text>
        </Paragraph>
        <Paragraph className="text-sm text-[#555]">
          Carbs: <Text className="font-semibold">{item.carbs}g</Text>
        </Paragraph>
        <Paragraph className="text-sm text-[#555]">
          Fats: <Text className="font-semibold">{item.fats}g</Text>
        </Paragraph>
      </Card.Content>
    </Card>
  );
  
  return (
    <View className="flex-1 bg-blue-50">
      {meals.length > 0 && (
        <View className="bg-white p-4 mb-3 rounded-b-lg shadow-md">
          <View className="flex-row items-center">
            <TextInput
              mode="outlined"
              label="Search Meals"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 mr-4"
              style={{
                backgroundColor: "#F5F5F5",
              }}
              outlineColor="#007bff"
              activeOutlineColor="#0056b3"
            />
            <IconButton
              icon="magnify"
              onPress={handleSearch}
              size={30}
              className="bg-[#eaf2ff] rounded-full"
              iconColor="#007bff"
            />
            {searchQuery && (
              <IconButton
                icon="close"
                onPress={clearSearch}
                size={30}
                className="bg-[#fdecea] rounded-full"
                iconColor="#e74c3c"
              />
            )}
          </View>
        </View>
      )}
  
      {meals.length > 0 && (
        <View className="flex-row justify-evenly items-center my-4">
          <Button
            mode={sortOption === 'name' ? 'contained' : 'outlined'}
            onPress={() => setSortOption('name')}
            className={`rounded-full px-4 py-2 ${
              sortOption === 'name' ? 'bg-[#007bff]' : 'border border-[#007bff]'
            }`}
            labelStyle={{
              color: sortOption === 'name' ? '#fff' : '#007bff',
              fontSize: 14,
              fontWeight: '500',
            }}
          >
            A👉Z
          </Button>
          <Button
            mode={sortOption === sortOptions[currentSortIndex] ? 'contained' : 'outlined'}
            onPress={cycleSortOption}
            className={`rounded-full px-4 py-2 ${
              sortOption === sortOptions[currentSortIndex] ? 'bg-[#007bff]' : 'border border-[#007bff]'
            }`}
            labelStyle={{
              color: sortOption === sortOptions[currentSortIndex] ? '#fff' : '#007bff',
              fontSize: 14,
              fontWeight: '500',
            }}
          >
            {sortOptions[currentSortIndex][0].toUpperCase() + sortOptions[currentSortIndex].slice(1)}
          </Button>
          <Button
            mode="contained"
            onPress={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            className="rounded-full px-4 py-2 bg-[#f39c12]"
            labelStyle={{
              color: '#fff',
              fontSize: 14,
              fontWeight: '500',
            }}
          >
            {sortDirection === 'asc' ? '👆' : '👇'}
          </Button>
        </View>
      )}
  
      {debouncedQuery ? (
        meals.filter((meal) => meal.name.toLowerCase().includes(debouncedQuery)).length === 0 ? (
          <Paragraph className="text-xl text-[#999] text-center mt-20">
            No Meals Found
          </Paragraph>
        ) : (
          <FlatList
            data={meals.filter((meal) =>
              meal.name.toLowerCase().includes(debouncedQuery)
            )}
            renderItem={renderMeal}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          />
        )
      ) : visibleMeals.length === 0 ? (
        <Paragraph className="text-xl text-[#999] text-center mt-20">
          No Meals Found
        </Paragraph>
      ) : (
        <FlatList
          data={visibleMeals}
          renderItem={renderMeal}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          onEndReached={loadMoreMeals}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? <ActivityIndicator size="large" color="#007bff" /> : null
          }
        />
      )}
  
      <FAB
        icon="plus"
        className="absolute m-4 right-0 bottom-0 bg-[#007bff] rounded-full shadow-lg"
        onPress={() => navigation.navigate('AddMeal', 'cat')}
      />
    </View>
  );
  
}

