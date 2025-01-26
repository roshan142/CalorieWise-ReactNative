import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Alert } from 'react-native';
import { Card, Button, Title, Paragraph, ProgressBar, Divider, Avatar, IconButton } from 'react-native-paper';
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
  const [userData, setUserData] = useState({ name: '', calories: 0, protein: 0, carbs: 0, fats: 0,water:0 });
  const [waterIntake, setWaterIntake] = useState(0);

  useEffect(() => {
    const checkForStoredValue = async () => {
      const storedValue = await AsyncStorage.getItem('userData');
      if (!storedValue) {
        navigation.navigate('Input');
      }
      else {
        
        const waterdata = await AsyncStorage.getItem('waterIntake');
        const parsedData = JSON.parse(waterdata)
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          setUserData(userData);
          setWaterIntake(parsedData.water);
        } 
      }
    };
      const intervalId = setInterval(checkForStoredValue, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchMeals = async () => {
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
        await removeInvalidMealsFromCategories();
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch meals',error);
      }
    };

    const intervalId = setInterval(fetchMeals, 1000);
  
    return () => clearInterval(intervalId);
  }, []);

  const calculateTotals = (mealsData) => {
    const newTotals = { calories: 0, protein: 0, carbs: 0, fats: 0 };
    for (const category in mealsData) {
      mealsData[category].forEach(meal => {
        newTotals.calories += Math.round(meal.calories*meal.quantity) || 0;
        newTotals.protein += Math.round(meal.protein*meal.quantity) || 0;
        newTotals.carbs += Math.round(meal.carbs*meal.quantity) || 0;
        newTotals.fats += Math.round(meal.fats*meal.quantity) || 0;
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
    if (totals.calories === 0 && totals.protein === 0 && totals.carbs === 0 && totals.fats === 0 && waterIntake === 0) {
      return;
    }
    saveDailyTotals();
    resetMeals();
  };

  const saveDailyTotals = async () => {
    try {
      const todayDate = await AsyncStorage.getItem('MealAddedDate');
      const historyData = {
        date: todayDate,
        calories: totals.calories,
        protein: totals.protein,
        carbs: totals.carbs,
        fats: totals.fats,
        water: waterIntake
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
      await AsyncStorage.removeItem('MealAddedDate')
    } catch (error) {
      Alert.alert('Error', 'Failed to save data',error);
    }
  };

  const resetMeals = async () => {
    try {
      await AsyncStorage.multiRemove(['meals_breakfast', 'meals_lunch', 'meals_snack', 'meals_dinner']);
      setMeals({ breakfast: [], lunch: [], snack: [], dinner: [] });
      setTotals({ calories: 0, protein: 0, carbs: 0, fats: 0 });
      setWaterIntake(0);
      const water = {water: 0};
      await AsyncStorage.setItem('waterIntake', JSON.stringify(water));
    } catch (error) {
      Alert.alert('Error', 'Failed to reset meal data');
    }
  };

  const handleAddWater = async (amount) => {
    const updatedWaterIntake = waterIntake + amount;

    if (updatedWaterIntake < 0) {
      return;
    }

    setWaterIntake(updatedWaterIntake);
    const water = {water: updatedWaterIntake};
    await AsyncStorage.setItem('waterIntake', JSON.stringify(water)); 
    const todayDate = moment().format('D MMM YYYY');
    await AsyncStorage.setItem('MealAddedDate', todayDate)
    
  };

  const renderMealCard = (mealType, title) => (
    <Card className="mb-6 rounded-10 bg-white" key={mealType}>
      <Card.Content>
        <Title className="text-xl font-bold text-[#333] mb-2 ">{title}</Title>
        {(meals[mealType] || []).length > 0 ? (
          (meals[mealType] || []).map((meal, index) => (
            <Paragraph key={index} className="text-base my-2 text-[#555]">
              <Text className="font-bold">
              {meal.name}</Text> {"\n"}Qty: <Text className="font-bold">{meal.quantity}</Text>, Calories: <Text className="font-bold">{meal.calories}cal</Text>, Protein: <Text className="font-bold">{meal.protein}g</Text>, Carbs: <Text className="font-bold">{meal.carbs}g</Text>, Fats: <Text className="font-bold">{meal.fats}g</Text> 
            </Paragraph>
          ))
        ) : (
          <Paragraph className="font-bold text-base text-[#999] text-center my-1">No meals added</Paragraph>
        )}
      </Card.Content>
      <Card.Actions className="justify-between mt-2">
        <IconButton mode='contained' className="bg-white" onPress={() => AsyncStorage.removeItem(`meals_${mealType}`)} icon="delete-forever" size={30} iconColor='red'></IconButton>
        <IconButton className="bg-white" onPress={() => navigation.navigate('AddCategoryMealScreen', { category: mealType })} icon="plus-circle" size={30} iconColor='black'></IconButton>
      </Card.Actions>
    </Card>
  );

  const calorie_progress = userData.calories ? totals.calories / userData.calories : 0;
  const protein_progress = userData.protein ? totals.protein / userData.protein : 0;
  const carbs_progress = userData.carbs ? totals.carbs / userData.carbs : 0;
  const fats_progress = userData.fats ? totals.fats / userData.fats: 0;
  const waterProgress = userData.water ? Math.min(Math.max(waterIntake / userData.water, 0), 1) : 0;
  const todayDate = moment().format('dddd, MMMM D, YYYY');
  
  return (
    <ScrollView className="flex-1 bg-[#F5F5F5]">
      <Card className="rounded-10 bg-white p-1 m-5 mx-3">
        <Card.Title
          title="Today's Overview"
          left={(props) => <Avatar.Icon {...props} icon="calendar-today" />}
        />
        <Card.Content>
          <Title className="text-xl font-bold text-[#333] mb-4">Calorie and Nutrient Goals</Title>
          <Text className="font-bold text-lg text-[#555] mb-2">{todayDate}</Text> 

          <Divider className="my-5 h-0.5 bg-[#E0E0E0]" />
          {['Calories', 'Protein', 'Carbs', 'Fats'].map((nutrient, index) => (
      <View key={index}>
        <Text className="text-base font-bold mb-4 text-[#555]">{nutrient}</Text>
        <ProgressBar 
          progress={nutrient === 'Calories' ? calorie_progress : nutrient === 'Protein' ? protein_progress : nutrient === 'Carbs' ? carbs_progress : fats_progress} 
          color={totals[nutrient.toLowerCase()] > userData[nutrient.toLowerCase()] ? 'red' : nutrient === 'Calories' ? '#FF7043' : nutrient === 'Protein' ? '#4CAF50' : nutrient === 'Carbs' ? '#29B6F6' : nutrient === 'Fats' ? '#FFCA28' :''}  
          className="h-3 rounded-full bg-[#E0E0E0]"
        />
        <Text className="text-base text-center mt-4 text-[#333]">
          {totals[nutrient.toLowerCase()]} / <Text className="font-bold">{userData[nutrient.toLowerCase()]}{nutrient === 'Calories' ? "Cal " : "g "}</Text>
        ({Math.round((nutrient === 'Calories' ? calorie_progress : nutrient === 'Protein' ? protein_progress : nutrient === 'Carbs' ? carbs_progress : fats_progress) * 100)}%)
        </Text>
      </View>
    ))}
        </Card.Content>
      </Card>

      <Card className="m-3 rounded-10 bg-white p-2">
  <Card.Title
    title="Water Intake"
    left={(props) => <Avatar.Icon {...props} icon="cup-water" />}
  />
  <Card.Content>
    <View className="my-1">
      <Text className="text-base font-bold mb-4 text-[#555]">Here 1 cup = 250ml</Text>
      <ProgressBar progress={waterProgress} color="#42A5F5" className="h-3 rounded-full bg-[#E0E0E0]" />
      <Text className="text-base text-center mt-4 text-[#333]">
        {Math.floor(waterIntake / 250)} Cups / <Text className="font-bold">{Math.floor(userData.water / 250)} Cups</Text> ({Math.round(waterProgress * 100)}%)
      </Text>
    </View>
  </Card.Content>
  <Card.Actions>
    <IconButton mode="contained" onPress={() => handleAddWater(-250)} className="mx-8" icon="minus"></IconButton>
    <IconButton mode="contained" onPress={() => handleAddWater(250)} className="mx-8" icon="plus"></IconButton>
  </Card.Actions>
</Card>

      
      <View className="px-2 pb-10 bg-gray-200 rounded-xl mx-2 mt-3 py-1 bottom-2">
        <Text className="text-2xl font-bold text-center pb-2 pt-2">Meals</Text>
        {renderMealCard('breakfast', 'Breakfast')}
        {renderMealCard('lunch', 'Lunch')}
        {renderMealCard('snack', 'Snack')}
        {renderMealCard('dinner', 'Dinner')} 
        <Button mode="contained" onPress={savebutton} buttonColor='green' className="bg-[#4CAF50] p-2 rounded-8 self-center w-11/12 bottom-2" labelStyle={{fontSize:17,fontWeight:"bold"}}>SAVE</Button>
      </View>
    </ScrollView>
  );
}


