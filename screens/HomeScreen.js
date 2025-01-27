import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Alert } from 'react-native';
import { Card, Button, Title, Paragraph, ProgressBar, Avatar, IconButton } from 'react-native-paper';
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
      const intervalId = setInterval(checkForStoredValue, 500);
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
    <Card className="mb-6 rounded-2xl bg-gray-50 shadow-md" key={mealType}>
      <Card.Content>
        <View className="flex-row justify-between items-center mb-4">
          <Title className="text-lg font-bold text-[#333]">{title}</Title>
          <Avatar.Icon size={40} icon="silverware" color="#4CAF50" style={{ backgroundColor: "#E8F5E9" }} />
        </View>
        {(meals[mealType] || []).length > 0 ? (
          (meals[mealType] || []).map((meal, index) => (
            <Paragraph key={index} className="text-base my-1 text-[#555]">
              <Text className="font-bold">{meal.name}</Text> {"\n"}
              Qty: <Text className="font-bold">{meal.quantity}</Text>, Calories: <Text className="font-bold">{meal.calories}cal</Text>, 
              Protein: <Text className="font-bold">{meal.protein}g</Text>, 
              Carbs: <Text className="font-bold">{meal.carbs}g</Text>, 
              Fats: <Text className="font-bold">{meal.fats}g</Text>
            </Paragraph>
          ))
        ) : (
          <Paragraph className="font-bold text-base text-[#999] text-center my-2">
            No meals added
          </Paragraph>
        )}
      </Card.Content>
      <Card.Actions className="flex-row justify-end mt-2">
        <IconButton
          mode="contained"
          className="bg-[#E8F5E9] shadow-md"
          onPress={() => AsyncStorage.removeItem(`meals_${mealType}`)}
          icon="delete-forever"
          size={28}
          iconColor="red"
        />
        <IconButton
          className="bg-[#E8F5E9] shadow-md ml-2"
          onPress={() => navigation.navigate('AddCategoryMealScreen', { category: mealType })}
          icon="plus-circle"
          size={28}
          iconColor="#333"
        />
      </Card.Actions>
    </Card>
  );


  const waterProgress = userData.water ? Math.min(Math.max(waterIntake / userData.water, 0), 1) : 0;
  const todayDate = moment().format('dddd, MMMM D, YYYY');
  const cupsize= userData.cupsize;
  
  return (
    <ScrollView className="flex-1 bg-blue-50">
    {/* Welcome Section */}
    <View className="mt-6 bg-white p-6 m-4 rounded-2xl shadow-lg">
      <Text className="text-xl font-semibold text-gray-600">👋 Welcome Back,</Text>
      <Text className="text-4xl font-extrabold text-blue-600 mt-2">
        {userData.name}!
      </Text>
      <Text className="text-base text-gray-500 mt-2">
        Let’s keep track of your calories and stay healthy!
      </Text>
    </View>
  
    {/* Water Intake Card */}
    <Card className="m-4 rounded-2xl bg-white shadow-lg p-5">
      <Card.Title
        title="Water Intake"
        titleStyle={{
          fontSize: 22,
          fontWeight: 'bold',
          color: '#333',
          marginBottom: 5,
        }}
        left={(props) => (
          <Avatar.Icon
            {...props}
            icon="cup-water"
            color="#42A5F5"
            size={50}
            className="bg-white"
          />
        )}
        leftStyle={{ marginRight: 10 }}
      />
      <Card.Content>
        <View className="my-3">
          <Text className="text-lg font-medium mb-4 text-center text-gray-500">
            1 Cup = <Text className="font-bold">{cupsize}ml</Text>
          </Text>
          <ProgressBar
            progress={waterProgress}
            color="#42A5F5"
            className="h-4 rounded-full bg-gray-200"
          />
          <Text className="text-base text-center mt-4 text-gray-600">
            <Text className="font-bold">
              {Math.floor(waterIntake / cupsize)} Cups
            </Text>{' '}
            /{' '}
            <Text className="font-bold">
              {Math.floor(userData.water / cupsize)} Cups
            </Text>{' '}
            ({Math.round(waterProgress * 100)}%)
          </Text>
        </View>
      </Card.Content>
      <Card.Actions className="flex justify-between">
        <IconButton
          mode="contained"
          onPress={() => handleAddWater(-cupsize)}
          className="bg-red-400 rounded-full"
          icon="minus"
          iconColor="#fff"
        />
        <IconButton
          mode="contained"
          onPress={() => handleAddWater(cupsize)}
          className="bg-green-400 rounded-full"
          icon="plus"
          iconColor="#fff"
        />
      </Card.Actions>
    </Card>
  
    {/* Meals Section */}
    <View className="px-4 py-6 bg-white rounded-2xl shadow-lg mx-4 mt-6">
      <Text className="text-2xl font-bold text-center pb-4 text-gray-700">
        Today's Meals
      </Text>
      {['breakfast', 'lunch', 'snack', 'dinner'].map((mealType, index) =>
        renderMealCard(mealType, mealType.charAt(0).toUpperCase() + mealType.slice(1))
      )}
      <Button
        mode="contained"
        onPress={savebutton}
        buttonColor="#4CAF50"
        className="mt-6 py-3 rounded-full self-center w-11/12 shadow-lg"
        labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}
      >
        SAVE
      </Button>
    </View>
  </ScrollView>
  
  );
}


