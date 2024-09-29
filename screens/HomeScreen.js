import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert } from 'react-native';
import { Card, Button, Title, Paragraph, ProgressBar, Divider, Avatar } from 'react-native-paper';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const [meals, setMeals] = useState({
    breakfast: [],
    lunch: [],
    snack: [],
    dinner: [],
  });
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
  const [userData, setUserData] = useState({ name: '', calories: 0, protein: 0, carbs: 0, fats: 0 });

  useEffect(() => {

    const checkForStoredValue = async () => {
      const storedValue = await AsyncStorage.getItem('userData');
      if (!storedValue) {
        navigation.navigate('Input');
      }
    };

    
    const fetchMeals = async () => {
      checkForStoredValue();
      try {
        const savedMeals = await AsyncStorage.multiGet(['meals_breakfast', 'meals_lunch', 'meals_snack', 'meals_dinner']);
        const mealData = {
          breakfast: JSON.parse(savedMeals[0][1]) || [],
          lunch: JSON.parse(savedMeals[1][1]) || [],
          snack: JSON.parse(savedMeals[2][1]) || [],
          dinner: JSON.parse(savedMeals[3][1]) || [],
        };
    
        setMeals(mealData);
        calculateTotals(mealData);



        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          setUserData(userData);
        }
        
        await removeInvalidMealsFromCategories();
  
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch meals');
      }
    };
      
    fetchMeals();
  
    const intervalId = setInterval(fetchMeals, 1000);
  
    return () => clearInterval(intervalId);
  }, []);

  const calculateTotals = (mealsData) => {
    const newTotals = { calories: 0, protein: 0, carbs: 0, fats: 0 };

    for (const category in mealsData) {
      mealsData[category].forEach(meal => {
        newTotals.calories += meal.calories || 0;
        newTotals.protein += meal.protein || 0;
        newTotals.carbs += meal.carbs || 0;
        newTotals.fats += meal.fats || 0;
      });
    }

    setTotals(newTotals);
  };

  const removeInvalidMealsFromCategories = async () => {
    try {
      const mainMealsJson = await AsyncStorage.getItem('meals');
      const mainMeals = mainMealsJson ? JSON.parse(mainMealsJson) : [];
  
      const validMealIds = new Set(mainMeals.map(meal => meal.id));
      const categories = ['breakfast', 'lunch', 'snack', 'dinner'];
  
      for (const category of categories) {
        const categoryMealsJson = await AsyncStorage.getItem(`meals_${category}`);
        const categoryMeals = categoryMealsJson ? JSON.parse(categoryMealsJson) : [];
  
        const updatedCategoryMeals = categoryMeals.filter(meal => validMealIds.has(meal.id));
  
        if (updatedCategoryMeals.length !== categoryMeals.length) {
          await AsyncStorage.setItem(`meals_${category}`, JSON.stringify(updatedCategoryMeals));
        }
      }
  
    } catch (error) {
      Alert.alert('Error', 'Failed to remove invalid meals from categories');
    }
  };
  
  const savebutton = () => {
    if (totals.calories === 0 || totals.protein === 0 || totals.carbs === 0 || totals.fats === 0) {
      return;
    }
    saveDailyTotals();
    resetMeals();
  };

  const saveDailyTotals = async () => {
    try {
      const todayDate = moment().format('D MMM YYYY');
      const historyData = {
        date: todayDate,
        calories: totals.calories,
        protein: totals.protein,
        carbs: totals.carbs,
        fats: totals.fats,
      };

      const existingHistory = await AsyncStorage.getItem('mealHistory');
      let historyArray = existingHistory ? JSON.parse(existingHistory) : [];

      const existingDateIndex = historyArray.findIndex(entry => entry.date === todayDate);
      if (existingDateIndex > -1) {
        historyArray[existingDateIndex] = historyData;
      } else {
        historyArray.push(historyData);
      }

      await AsyncStorage.setItem('mealHistory', JSON.stringify(historyArray));

    } catch (error) {
      Alert.alert('Error', 'Failed to save data');
    }
  };

  const resetMeals = async () => {
    try {
      await AsyncStorage.multiRemove(['meals_breakfast', 'meals_lunch', 'meals_snack', 'meals_dinner']);
      setMeals({ breakfast: [], lunch: [], snack: [], dinner: [] });
      setTotals({ calories: 0, protein: 0, carbs: 0, fats: 0 });

    } catch (error) {
      Alert.alert('Error', 'Failed to reset meal data');
    }
  };

  const renderMealCard = (mealType, title) => (
    <Card style={styles.mealCard} key={mealType}>
      <Card.Content>
        <Title style={styles.mealTitle}>{title}</Title>
        {(meals[mealType] || []).length > 0 ? (
          (meals[mealType] || []).map((meal, index) => (
            <Paragraph key={index} style={styles.mealText}>
              {meal.name} - Calories: {meal.calories}, Protein: {meal.protein}g, Carbs: {meal.carbs}g, Fats: {meal.fats}g 
            </Paragraph>
          ))
        ) : (
          <Paragraph style={styles.noMealsText}>No meals added</Paragraph>
        )}
      </Card.Content>
      <Card.Actions style={styles.cardActions}>
        <Button mode="outlined" onPress={() => AsyncStorage.removeItem(`meals_${mealType}`)}>Clear</Button>
        <Button mode="contained" onPress={() => navigation.navigate('AddCategoryMealScreen', { category: mealType })} icon="plus-circle">Add Meal</Button>
      </Card.Actions>
    </Card>
  );

  const calorie_progress = userData.calories ? totals.calories / userData.calories : 0;
  const protein_progress = userData.protein ? totals.protein / userData.protein : 0;
  const carbs_progress = userData.carbs ? totals.carbs / userData.carbs : 0;
  const fats_progress = userData.fats ? totals.fats / userData.fats : 0;
  const todayDate = moment().format('dddd, MMMM D, YYYY');
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>Hello, {userData.name}</Text>
      </View>

      <Card style={styles.overviewCard}>
        <Card.Title
          title="Today's Overview"
          left={(props) => <Avatar.Icon {...props} icon="calendar-today" />}
        />
        <Card.Content>
          <Divider style={styles.divider} />
          <Title style={styles.overviewTitle}>Calorie and Nutrient Goals</Title>
          <Text style={styles.dateText}>{todayDate}</Text>
        </Card.Content>
      </Card>

      {['Calories', 'Protein', 'Carbs', 'Fats'].map((nutrient, index) => (
        <View style={styles.progressBarContainer} key={index}>
          <Text style={styles.progressTitle}>{nutrient}</Text>
          <ProgressBar 
            progress={nutrient === 'Calories' ? calorie_progress : nutrient === 'Protein' ? protein_progress : nutrient === 'Carbs' ? carbs_progress : fats_progress} 
            color={totals[nutrient.toLowerCase()] > userData[nutrient.toLowerCase()] ? 'red' : 'green'}  
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>
            {totals[nutrient.toLowerCase()]} / {userData[nutrient.toLowerCase()]} {nutrient} ({Math.round((nutrient === 'Calories' ? calorie_progress : nutrient === 'Protein' ? protein_progress : nutrient === 'Carbs' ? carbs_progress : fats_progress) * 100)}%)
          </Text>
        </View>
      ))}

      <View style={styles.mealsContainer}>
        {renderMealCard('breakfast', 'Breakfast')}
        {renderMealCard('lunch', 'Lunch')}
        {renderMealCard('snack', 'Snack')}
        {renderMealCard('dinner', 'Dinner')}
        <Button mode="contained" onPress={savebutton} buttonColor='green' style={styles.saveButton}>SAVE</Button>
      </View>
      
      {['Overview','Calories History', 'View Meals', 'Settings'].map((title, index) => (
        <Card style={styles.card} key={index}>
          <Card.Content>
            <Title>{title}</Title>
            <Paragraph>See the {title.toLowerCase()} for all your meals</Paragraph>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" onPress={() => navigation.navigate(title === 'Calories History' ? 'History' : title === 'View Meals' ? 'ViewMeal' : title === 'Overview'?'Overview':'Settings')} icon={title === 'Calories History' ? 'history' : title === 'View Meals' ? 'plus-circle' : title ==='Overview'?'chart-line': 'cog'}>
              {title === 'View Meals' ? 'Add' : title === 'Overview'?'View':'Open'}
            </Button>
          </Card.Actions>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mealsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  mealCard: {
    marginBottom: 16,
    borderRadius: 10,
    elevation: 4,
    backgroundColor: '#ffffff',
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  mealText: {
    fontSize: 14,
    marginVertical: 2,
    color: '#333',
  },
  noMealsText: {
    fontSize: 14,
    color: '#999',
  },
  cardActions: {
    justifyContent: 'space-between',
  },
  progressBarContainer: {
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    color: '#333',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  greetingContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    marginTop: 16,
    borderRadius: 10,
    elevation: 4,
    marginHorizontal: 16,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  overviewCard: {
    margin: 16,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    elevation: 4,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#555',
  },
  saveButton: {
    marginTop: 16,
  },
});
