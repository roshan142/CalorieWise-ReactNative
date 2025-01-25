import React, { useState, useEffect } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { Appbar, Card, Title, Paragraph } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const savedHistory = await AsyncStorage.getItem('mealHistory');
        if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory);
          const aggregatedHistory = aggregateHistory(parsedHistory);
          setHistory(aggregatedHistory);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load history');
      }
    };

    fetchHistory();
  }, []);

  const aggregateHistory = (entries) => {
    const aggregated = {};

    entries.forEach(entry => {
      const { date, calories, protein, carbs, fats,water } = entry;
      if (!aggregated[date]) {
        aggregated[date] = { date, calories: 0, protein: 0, carbs: 0, fats: 0,water:0 };
      }
      aggregated[date].calories += calories;
      aggregated[date].protein += protein;
      aggregated[date].carbs += carbs;
      aggregated[date].fats += fats;
      aggregated[date].water += water;
    });

    return Object.values(aggregated);
  };

  return (
    <ScrollView className="flex-1 bg-[#f5f5f5]">
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      </Appbar.Header>

      <View className="p-3">
        {history.length === 0 ? (
          <Paragraph>No history available</Paragraph>
        ) : (
          history.map((entry, index) => (
            <Card key={index} className="mb-6 rounded-8">
              <Card.Content>
                <Title>{entry.date}</Title>
                <Paragraph>Calories: {entry.calories}</Paragraph>
                <Paragraph>Protein: {entry.protein}g</Paragraph>
                <Paragraph>Carbs: {entry.carbs}g</Paragraph>
                <Paragraph>Fats: {entry.fats}g</Paragraph>
                <Paragraph>Water: {entry.water}ml</Paragraph>
              </Card.Content>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
};
