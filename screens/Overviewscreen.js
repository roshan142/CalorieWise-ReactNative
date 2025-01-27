import React, { useState, useCallback,useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Card, Divider, Subheading, useTheme, Avatar,SegmentedButtons,Title,ProgressBar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart } from 'react-native-chart-kit';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';

export default function Overview({ navigation }) {
  const [historyData, setHistoryData] = useState([]);
  const [targetCalories, setTargetCalories] = useState(0);
  const [targetProteins, setTargetProteins] = useState(0);
  const [targetFats, setTargetFats] = useState(0);
  const [targetCarbs, setTargetCarbs] = useState(0);
  const [targetWater, setTargetWater] = useState(0);
  const screenWidth = Dimensions.get('window').width;
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [viewchart, setViewchart] = useState('Calorie');
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
  const [userData, setUserData] = useState({ name: '', calories: 0, protein: 0, carbs: 0, fats: 0,water:0 });
  

  useFocusEffect(
    useCallback(() => {
      const fetchHistoryData = async () => {
        try {
          const storedHistory = await AsyncStorage.getItem('mealHistory');
          const parsedHistory = storedHistory ? JSON.parse(storedHistory) : [];
          const last7Days = parsedHistory.slice(-7);
          setHistoryData(last7Days);

          const userData = await AsyncStorage.getItem('userData');
          if (userData) {
            const parsedUserData = JSON.parse(userData);
            setTargetCalories(parsedUserData.calories);
            setTargetProteins(parsedUserData.protein);
            setTargetFats(parsedUserData.fats);
            setTargetCarbs(parsedUserData.carbs);
            setTargetWater(parsedUserData.water);
          }

          setTimeout(() => {
            setIsLoading(false);
          }, 800); // Slight delay for a smoother loading experience
        } catch (error) {
          console.error('Error fetching history data:', error);
        }
      };

      fetchHistoryData();
    }, [])
  );

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
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
        setUserData(userData);
        }
        calculateTotals(mealData);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch progress',error);
      }
    };

    const intervalId = setInterval(fetchMeals, 500);
  
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

  const labels = historyData.length > 0 ? historyData.map(entry => moment(entry.date, 'D MMM YYYY').format('ddd')) : [];
  const caloriesData = historyData.length > 0 ? historyData.map(entry => entry.calories) : [];
  const proteinsData = historyData.length > 0 ? historyData.map(entry => entry.protein) : [];
  const fatsData = historyData.length > 0 ? historyData.map(entry => entry.fats) : [];
  const carbsData = historyData.length > 0 ? historyData.map(entry => entry.carbs) : [];
  const waterData = historyData.length > 0 ? historyData.map(entry => entry.water) : [];

  const todayDate = moment().format('dddd, MMMM D, YYYY');

  const calorie_progress = userData.calories ? totals.calories / userData.calories : 0;
  const protein_progress = userData.protein ? totals.protein / userData.protein : 0;
  const carbs_progress = userData.carbs ? totals.carbs / userData.carbs : 0;
  const fats_progress = userData.fats ? totals.fats / userData.fats: 0;

  const charts = [
    {
      title: "Calorie Intake",
      data: caloriesData,
      color: '#FF7043', // Vibrant orange for energy (calories)
      target: targetCalories,
    },
    {
      title: "Protein Intake",
      data: proteinsData,
      color: '#4CAF50', // Fresh green for proteins (healthy and natural)
      target: targetProteins,
    },
    {
      title: "Fats Intake",
      data: fatsData,
      color: '#FFCA28', // Yellow for fats (rich, buttery feel)
      target: targetFats,
    },
    {
      title: "Carbs Intake",
      data: carbsData,
      color: '#29B6F6', // Light blue for carbs (energy and hydration)
      target: targetCarbs,
    },
    {
      title: "Water Intake",
      data: waterData,
      color: '#42A5F5', // Clear blue for water (freshness)
      target: targetWater,
    },
  ];
  

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-blue-100 ">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-10 text-base text-gray-600">Fetching data...</Text>
      </View>
    );
  }
  const selectedChart = charts.find((chart) =>
    chart.title.toLowerCase().includes(viewchart.toLowerCase())
  );
  if (!selectedChart) return null;

  return (
    <ScrollView className="flex-1 p-4 bg-blue-50">
<Card className="rounded-10 bg-white shadow-lg p-4 mb-5">
  <Card.Title
    title="Today's Overview"
    titleStyle={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}
    left={(props) => <Avatar.Icon {...props} icon="calendar-today" color="#4CAF50" className="bg-white" size={60} />}
    leftStyle={{ marginRight: 10 }}
  />
  <Card.Content>
    <Title className="text-xl font-bold text-[#333] mb-4">
      Calorie and Nutrient Goals
    </Title>
    <Text className="font-medium text-base text-[#777] mb-4">{todayDate}</Text>

    <Divider className="my-5 h-0.5 bg-[#E0E0E0]" />

    {['Calories', 'Protein', 'Carbs', 'Fats'].map((nutrient, index) => (
      <View key={index} className="mb-6">
        <Text className="text-base font-semibold text-[#555] mb-2">{nutrient}</Text>
        <ProgressBar
          progress={
            nutrient === 'Calories'
              ? calorie_progress
              : nutrient === 'Protein'
              ? protein_progress
              : nutrient === 'Carbs'
              ? carbs_progress
              : fats_progress
          }
          color={
            totals[nutrient.toLowerCase()] > userData[nutrient.toLowerCase()]
              ? 'red'
              : nutrient === 'Calories'
              ? '#FF7043'
              : nutrient === 'Protein'
              ? '#4CAF50'
              : nutrient === 'Carbs'
              ? '#29B6F6'
              : '#FFCA28'
          }
          className="h-4 rounded-full bg-[#F0F0F0]"
        />
        <Text className="text-sm text-center mt-3 text-[#444]">
          <Text className="font-bold">{totals[nutrient.toLowerCase()]}</Text> /{' '}
          <Text className="font-bold">
            {userData[nutrient.toLowerCase()]}
            {nutrient === 'Calories' ? ' Cal' : ' g'}
          </Text>{' '}
          (<Text className="font-bold">{Math.round(
            (nutrient === 'Calories'
              ? calorie_progress
              : nutrient === 'Protein'
              ? protein_progress
              : nutrient === 'Carbs'
              ? carbs_progress
              : fats_progress) * 100
          )}%</Text>)
        </Text>
      </View>
    ))}
  </Card.Content>
</Card>

{historyData.length === 0 ? (
  ''
  ) : (
    <View>

  <Card className="mb-4 rounded-2 bg-white p-4 shadow-lg">
    <Card.Title
      title="Weekly Overview"
      titleStyle={{
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8
      }}
      left={(props) => <Avatar.Icon {...props} icon="chart-bar" color='#4CAF50' className="bg-white" size={60} />}
    />
  </Card>
  <View>
  <SegmentedButtons
    value={viewchart}
    onValueChange={setViewchart}
    buttons={[
      { value: 'Calorie', label: 'Cal', icon: 'food' },
      { value: 'Protein', label: 'Pro', icon: 'food-drumstick' },
      { value: 'Carbs', label: 'Carb', icon: 'food-fork-drink' },
      { value: 'Fats', label: 'Fat', icon: 'food-variant' },
      { value: 'water', label: 'Water', icon: 'cup-water' }
    ]}
    className="mb-2"
  />
</View>
      <Card className="my-4 rounded-12 bg-white shadow-md">
        <Card.Content>
          <Subheading
            className="text-center text-xl font-semibold"
            style={{ color: selectedChart.color }}
          >
            {selectedChart.title}
          </Subheading>
          <BarChart
            data={{
              labels,
              datasets: [{ data: selectedChart.data }],
            }}
            width={screenWidth - 40}  // Reduced width for more margin
            height={250}
            yAxisSuffix={
              selectedChart.title.includes('Calorie')
                ? ' cal'
                : selectedChart.title.includes('Water')
                ? ' ml'
                : ' g'
            }
            fromZero
            chartConfig={{
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#f4f4f4',
              decimalPlaces: 0,
              barPercentage: 0.6,
              color: () => selectedChart.color,
              labelColor: () => '#333',
            }}
            style={{
              marginTop: 8,
              borderRadius: 12,
              backgroundColor: '#fff',
            }}
          />
          <Divider className="my-4 text-gray-300" />
          <Text className="text-center text-base text-gray-600">
            Target: <Text className="font-bold">{selectedChart.target} {selectedChart.title.includes('Calorie') ? 'cal' : selectedChart.title.includes('Water') ? 'ml' : 'g'}</Text>
          </Text>
        </Card.Content>
      </Card>
      </View>
  )}
</ScrollView>
  );
}

