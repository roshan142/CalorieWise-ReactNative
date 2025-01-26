import React, { useState, useEffect } from 'react';
import { View,ScrollView, Text, Alert,ActivityIndicator  } from 'react-native';
import {TextInput, Card, Title, FAB, useTheme  } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Profile({ navigation }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [water, setwater] = useState('');

  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  

  useEffect(() => {
    const loadStoredData = async () => {
      const storedData = await AsyncStorage.getItem('userData');
      if (storedData) {
        const userData = JSON.parse(storedData);
        setName(userData.name || '');
        setAge(userData.age ? String(userData.age) : '');
        setWeight(userData.weight ? String(userData.weight) : '');
        setCalories(userData.calories ? String(userData.calories) : '');
        setProtein(userData.protein ? String(userData.protein) : '');
        setCarbs(userData.carbs ? String(userData.carbs) : '');
        setFats(userData.fats ? String(userData.fats) : '');
        setwater(userData.water ? String(userData.water) : '');
      }

      setTimeout(() => {
        setIsLoading(false);
      }, 100);

    };
    loadStoredData();
  }, []);

  const handleSave = async () => {
    const userData = { 
      name, 
      age: parseInt(age), 
      weight: parseFloat(weight), 
      calories: parseInt(calories), 
      protein: parseFloat(protein), 
      carbs: parseFloat(carbs), 
      fats: parseFloat(fats),
      water: parseFloat(water) 
    };

    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    Alert.alert('Success', 'Profile updated successfully');
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-green-50">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-10 text-10 text-gray-800">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className=" flex-1 bg-gray-100 p-2 ">
      <Card className="bg-white mb-6 mt-5 rounded-8 shadow-4">
        <Card.Content>
          <Title className="text-2xl font-bold mb-6 text-gray-700">Profile Information</Title>
          <TextInput
            className="mb-5 bg-white"
            value={name}
            onChangeText={setName}
            label="Name"
            mode="outlined"
          />
          <TextInput
            className="mb-5 bg-white"
            value={age}
            onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ''))}
            label="Age"
            keyboardType="numeric"
            mode="outlined"
          />
          <TextInput
            className="mb-5 bg-white"
            value={weight}
            onChangeText={(text) => setWeight(text.replace(/[^0-9.]/g, ''))}
            label="Weight (kg)"
            keyboardType="numeric"
            mode="outlined"
          />
        </Card.Content>
      </Card>
      <Card className="bg-white mb-6 rounded shadow-4">
        <Card.Content>
          <Title className="text-2xl font-bold mb-6 text-gray-700">Daily Macros</Title>
          <TextInput
            className="mb-5 bg-white"
            value={calories}
            onChangeText={(text) => setCalories(text.replace(/[^0-9]/g, ''))}
            label="Calories"
            keyboardType="numeric"
            mode="outlined"
          />
          <TextInput
            className="mb-5 bg-white"
            value={protein}
            onChangeText={(text) => setProtein(text.replace(/[^0-9.]/g, ''))}
            label="Protein (g)"
            keyboardType="numeric"
            mode="outlined"
          />
          <TextInput
            className="mb-5 bg-white"
            value={carbs}
            onChangeText={(text) => setCarbs(text.replace(/[^0-9.]/g, ''))}
            label="Carbs (g)"
            keyboardType="numeric"
            mode="outlined"
          />
          <TextInput
            className="mb-5 bg-white"
            value={fats}
            onChangeText={(text) => setFats(text.replace(/[^0-9.]/g, ''))}
            label="Fats (g)"
            keyboardType="numeric"
            mode="outlined"
          />
          <TextInput
            className="mb-5 bg-white"
            value={water}
            onChangeText={(text) => setwater(text.replace(/[^0-9.]/g, ''))}
            label="Water (ml)"
            keyboardType="numeric"
            mode="outlined"
          />
        </Card.Content>
      </Card>

      
      <FAB
    icon="check"
    color='gold'
    className="absolute bottom-5 right-1 bg-green-500"
    onPress={handleSave}
  />

    </ScrollView>
  );
}

