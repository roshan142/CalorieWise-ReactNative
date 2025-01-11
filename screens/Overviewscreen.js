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
          }

          setTimeout(() => {
            setIsLoading(false);
          }, 500);
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

  const charts = [
    {
      title: "Calorie Intake",
      data: caloriesData,
      color: 'rgba(0, 150, 136, 1)',
      target: targetCalories,
    },
    {
      title: "Protein Intake",
      data: proteinsData,
      color: 'rgba(255, 82, 82, 1)',
      target: targetProteins,
    },
    {
      title: "Fats Intake",
      data: fatsData,
      color: 'rgba(30, 136, 229, 1)',
      target: targetFats,
    },
    {
      title: "Carbs Intake",
      data: carbsData,
      color: 'rgba(0, 188, 212, 1)',
      target: targetCarbs,
    },
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.overviewCard}>
        <Card.Title
          title="Weekly Overview"
          titleStyle={styles.overviewTitle}
          left={(props) => <Avatar.Icon {...props} icon="calendar-today" />}
        />
      </Card>

      {historyData.length === 0 ? (
        <View style={styles.noDataOverlay}>
          <Text style={styles.noDataOverlayText}>No Data Saved</Text>
        </View>
      ) : (
        charts.map((chart, index) => (
          <Card key={index} style={styles.card}>
            <Card.Content>
              <Subheading style={[styles.title, { color: colors.primary }]}>{chart.title}</Subheading>
              <BarChart
                data={{
                  labels,
                  datasets: [{ data: chart.data, color: (opacity = 1) => chart.color }],
                }}
                width={screenWidth - 48}
                height={250}
                yAxisSuffix={chart.title.includes('Calorie Intake') ? ' cal' : ' g'}
                fromZero
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#e0f7fa',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => chart.color,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForHorizontalLabels: {
                    fontSize: 12,
                    color: '#00796b',
                  },
                  propsForVerticalLabels: {
                    fontSize: 12,
                    color: '#00796b',
                  },
                }}
                style={styles.chart}
                showValuesOnTopOfBars
                verticalLabelRotation={0}
              />
              <Divider style={styles.divider} />
              <Text style={styles.targetLabel}>{`Target: ${chart.target} ${chart.title.includes('Calorie Intake') ? 'cal' : 'g'}`}</Text>
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
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  overviewCard: {
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    elevation: 4,
    padding: 16,
  },
  overviewTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    marginVertical: 10,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: '#ffffff',
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  targetLabel: {
    textAlign: 'center',
    fontSize: 16,
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  noDataOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    marginTop: 20,
  },
  noDataOverlayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#757575',
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
    color: '#757575',
  },
  divider: {
    marginVertical: 8,
    backgroundColor: '#e0e0e0',
  },
});
