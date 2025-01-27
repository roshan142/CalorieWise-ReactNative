import React, { useState } from 'react';
import { View, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Button, Card, Title, Text, useTheme,FAB } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Setting({ navigation }) {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const resetData = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.clear();
      Alert.alert('Data Reset', 'All data has been reset.');
    } catch (error) {
      Alert.alert('Error', 'Failed to reset data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-blue-100 ">
    <ScrollView className="flex-1 p-5">
      {isLoading ? (
        <View className="flex-1 items-center justify-center my-50">
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text className="mt-10 text-base text-[#777]">Resetting Data...</Text>
        </View>
      ) : (
        <>
        <Card className="mb-5 rounded-12 border bg-white">
            <Card.Content>
              <Title className="text-2xl font-bold mb-2 text-[#333]">API Meal Data</Title>
              <Text className="text-xl text-[#555] mb-1">
                Add Meals from online sources.
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('ApiMeal')}
                icon="plus"
                className="flex-1 m-4 rounded-lg py-2"
              >
                <Text className="text-white text-base font-bold">ADD</Text>
              </Button>
            </Card.Actions>
          </Card>

        <Card className="mb-5 rounded-12 border bg-white">
            <Card.Content>
              <Title className="text-2xl font-bold mb-2 text-[#333]">History</Title>
              <Text className="text-xl text-[#555] mb-1">
                View your meal history, including calorie data.
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('History')}
                icon="history"
                className="flex-1 m-4 rounded-lg py-2"
              >
                <Text className="text-white text-base font-bold">View History</Text>
              </Button>
            </Card.Actions>
          </Card>

          <Card className="mb-5 rounded-12 border bg-white" style={{ borderColor: theme.colors.primary }}>
            <Card.Content>
              <Title className="text-2xl font-bold mb-2 text-[#333]">Reset Options</Title>
              <Button
                mode="outlined"
                onPress={() => AsyncStorage.removeItem('mealHistory')}
                className="my-4 rounded-lg py-2"
                icon="history"
              >
                <Text className="text-[#6750a4] text-base font-bold">
                Reset Calorie History
                </Text>
              </Button>
              <Button
                mode="outlined"
                onPress={() => AsyncStorage.removeItem('meals')}
                className="my-4 rounded-lg py-2"
                icon="food"
              >
                <Text className="text-[#6750a4] text-base font-bold">Reset Meals</Text>
                
              </Button>
              <Button
                mode="contained"
                onPress={resetData}
                className="my-4 rounded-lg py-2"
                icon="alert-circle"
              >
                <Text className="text-white text-base font-bold">Reset All Data</Text>
              </Button>
            </Card.Content>
          </Card>

          <Card className="mb-10 rounded-12 border bg-white">
            <Card.Content>
              <Title className="text-2xl font-bold mb-2 text-[#333]">Developer Mode</Title>
              <Text className="text-xl text-[#555] mb-1">
                Access developer features and test data.
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Developermode')}
                icon="code-tags"
                className="flex-1 m-4 rounded-8"
              >
                Open Developer Mode
              </Button>
            </Card.Actions>
          </Card>
        </>
      )}
    </ScrollView>
    <FAB
            icon="keyboard-backspace"
            className="absolute bottom-1 left-2 shadow-lg rounded-full"
            onPress={() => {navigation.goBack()}}
            style={{
              backgroundColor: 'rgba(0, 123, 255, 0.3)', // Adjust color and transparency
            }}
          />


    </View>
  );
}