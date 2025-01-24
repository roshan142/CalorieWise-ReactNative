import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Card, Divider, Subheading, useTheme, Avatar } from 'react-native-paper';
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

  const labels = historyData.length > 0 ? historyData.map(entry => moment(entry.date, 'D MMM YYYY').format('ddd')) : [];
  const caloriesData = historyData.length > 0 ? historyData.map(entry => entry.calories) : [];
  const proteinsData = historyData.length > 0 ? historyData.map(entry => entry.protein) : [];
  const fatsData = historyData.length > 0 ? historyData.map(entry => entry.fats) : [];
  const carbsData = historyData.length > 0 ? historyData.map(entry => entry.carbs) : [];
  const waterData = historyData.length > 0 ? historyData.map(entry => entry.water) : [];

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
      <View className="flex-1 justify-center items-center bg-gray-800 ">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-10 text-base text-gray-600">Fetching data...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-4 bg-blue-100">
      <Card className="mb-1 rounded-2 bg-white p-6 ">
        <Card.Title
          title="Weekly Overview"
          titleStyle={{
            fontSize: 22,
            fontWeight: 'bold',
            color: '#333',
          }}
          left={(props) => <Avatar.Icon {...props} icon="chart-bar" />}
        />
      </Card>

      {historyData.length === 0 ? (
        <View className="flex-1 justify-center items-center mt-20">
          <Text className="text-xl font-bold text-gray-400">No Data Available</Text>
        </View>
      ) : (
        charts.map((chart, index) => (
          <Card key={index} className="my-3 rounded-12 bg-white">
            <Card.Content>
              <Subheading className="text-center text-xl font-bold" style={[{ color: chart.color }]}>{chart.title}</Subheading>
              <BarChart
                data={{
                  labels,
                  datasets: [{ data: chart.data }],
                }}
                width={screenWidth - 53}
                height={250}
                yAxisSuffix={chart.title.includes('Calorie') ? ' cal' : chart.title.includes('Water') ? ' ml' : ' g'}
                fromZero
                chartConfig={{
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#f4f4f4',
                  decimalPlaces: 0,
                  barPercentage: 0.6,
                  color: () => chart.color,
                  labelColor: () => '#333',
                }}
                className="my-2 rounded-12"
              />
              <Divider className="my-2 text-gray-300"/>
              <Text className="text-center text-base text-gray-400">
                Target: <Text className="font-bold">{chart.target} {chart.title.includes('Calorie') ? 'cal' : chart.title.includes('Water') ? 'ml' :  'g'}</Text>
              </Text>
            </Card.Content>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

