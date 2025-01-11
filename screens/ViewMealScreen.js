import React, { useState,useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FAB, Card, Title, Paragraph, Button,TextInput } from 'react-native-paper';
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
      setTimeout(() => {
        const newPage = page + 1;
        setLoading(true);
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
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.cardTitle}>{item.name}</Title>
        <Paragraph style={styles.cardParagraph}>Calories: {item.calories} cal</Paragraph>
        <Paragraph style={styles.cardParagraph}>Protein: {item.protein}g</Paragraph>
        <Paragraph style={styles.cardParagraph}>Carbs: {item.carbs}g</Paragraph>
        <Paragraph style={styles.cardParagraph}>Fats: {item.fats}g</Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button mode="contained" onPress={() => navigation.navigate('EditMeal', { meal: item })}>
          Edit
        </Button>
        <Button mode="contained" onPress={() => deleteMeal(item.id)} style={[styles.button, styles.deleteButton]}>
          Delete
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      {meals.length !== 0 && (
      <View style={styles.headerContainer}>
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
            <Button mode="text" onPress={clearSearch} style={styles.clearButton}>
              Clear
            </Button>
          ) : null}
        </View>
      </View>
      )}

      {meals.length !== 0 && (
        <View style={styles.sortButtonsContainer}>
          <Button
            mode={sortOption === 'name' ? 'contained' : 'outlined'}
            onPress={() => setSortOption('name')}
            style={[styles.sortButton, sortOption === 'name' && styles.selectedButton]}
            labelStyle={[styles.sortButtonLabel, sortOption === 'name' && styles.selectedButtonLabel]}
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
      )}

{debouncedQuery ? (
  meals.filter((meal) => meal.name.toLowerCase().includes(debouncedQuery)).length === 0 ? (
    <Paragraph style={styles.noMeals}>No Meals Found</Paragraph>
  ) : (
    <FlatList
      data={meals.filter((meal) =>
        meal.name.toLowerCase().includes(debouncedQuery)
      )}
      renderItem={renderMeal}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.list}
    />
  )
) : (
  visibleMeals.length === 0 ? (
    <Paragraph style={styles.noMeals}>No Meals Found</Paragraph>
  ) : (
    <FlatList
      data={visibleMeals}
      renderItem={renderMeal}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.list}
      onEndReached={loadMoreMeals}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loading ? <ActivityIndicator size="large" color="#000" /> : null
      }
    />
  )
)}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddMeal', 'cat')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  headerContainer: {
    backgroundColor: '#fff',
    padding: 20,
    elevation: 4,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  noMeals: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#999',
    textAlign: 'center',
    marginTop: 300,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 80, // Make space for FAB
  },
  card: {
    marginBottom: 16,
    elevation: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardParagraph: {
    fontSize: 16,
    color: '#555',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#007bff',
  },
  deleteButton: {
    backgroundColor: 'red',
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
