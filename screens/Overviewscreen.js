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
      color: '#FF7043',
      target: targetCalories,
    },
    {
      title: "Protein Intake",
      data: proteinsData,
      color: '#66BB6A',
      target: targetProteins,
    },
    {
      title: "Fats Intake",
      data: fatsData,
      color: '#42A5F5',
      target: targetFats,
    },
    {
      title: "Carbs Intake",
      data: carbsData,
      color: '#FFA726',
      target: targetCarbs,
    },
    {
      title: "Water Intake",
      data: waterData,
      color: '#FFA726',
      target: targetWater,
    },
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Fetching data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.overviewCard}>
        <Card.Title
          title="Weekly Overview"
          titleStyle={styles.overviewTitle}
          left={(props) => <Avatar.Icon {...props} icon="chart-bar" />}
        />
      </Card>

      {historyData.length === 0 ? (
        <View style={styles.noDataOverlay}>
          <Text style={styles.noDataOverlayText}>No Data Available</Text>
        </View>
      ) : (
        charts.map((chart, index) => (
          <Card key={index} style={styles.card}>
            <Card.Content>
              <Subheading style={[styles.title, { color: chart.color }]}>{chart.title}</Subheading>
              <BarChart
                data={{
                  labels,
                  datasets: [{ data: chart.data }],
                }}
                width={screenWidth - 48}
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
                style={styles.chart}
              />
              <Divider style={styles.divider} />
              <Text style={styles.targetLabel}>
                Target: {chart.target} {chart.title.includes('Calorie') ? 'cal' : chart.title.includes('Water') ? 'ml' :  'g'}
              </Text>
            </Card.Content>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3f2fd',
    padding: 16,
  },
  overviewCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    elevation: 4,
    padding: 16,
  },
  overviewTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    marginVertical: 10,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#ffffff',
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
  },
  targetLabel: {
    textAlign: 'center',
    fontSize: 14,
    color: '#757575',
  },
  noDataOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  noDataOverlayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9e9e9e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#616161',
  },
  divider: {
    marginVertical: 8,
    backgroundColor: '#eeeeee',
  },
});
