import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput, Button, Divider, useTheme } from 'react-native-paper';

export default function InputScreen({ navigation }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [water, setWater] = useState('');

  const { colors } = useTheme();

  useEffect(() => {
    const checkStoredValue = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          navigation.replace('Home');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to check stored data');
      }
    };
    checkStoredValue();
  }, []);

  const handleSave = async () => {
    if (!name || !age || !calories || !protein || !carbs || !fats){
      Alert.alert('Missing Fields', 'Please fill out all fields');
      return;
    }

    const userData = {
      name,
      age: parseInt(age),
      weight: parseFloat(weight),
      calories: parseInt(calories),
      protein: parseInt(protein),
      carbs: parseInt(carbs),
      fats: parseInt(fats),
      water: parseInt(water)
    };

    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Error', 'Failed to save data');
    }
  };

  return (
    <ScrollView className="grow p-8 bg-[#f5f5f5]">
      <Text style={{ color: colors.primary }} className="text-xl font-bold mb-2">Profile</Text>
      <Divider className="my-2 bg-[#e0e0e0] h-0.5" />
      <View className="mb-5">
        <TextInput
          label="Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          className="mb-4"
        />
        <TextInput
          label="Age"
          value={age}
          onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
          mode="outlined"
          className="mb-4"        />
        <TextInput
          label="Weight (kg)"
          value={weight}
          onChangeText={(text) => setWeight(text.replace(/[^0-9.]/g, ''))}
          keyboardType="numeric"
          mode="outlined"
          className="mb-4"        />
      </View>

      <Text style={{ color: colors.primary }} className="text-xl font-bold mb-2">Daily Macros Goals</Text>
      <Divider className="my-2 bg-[#e0e0e0] h-0.5" />

      <View className="mb-2">
        <TextInput
          label="Calorie (cal)"
          value={calories}
          onChangeText={(text) => setCalories(text.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
          mode="outlined"
          className="mb-4"        />
        <TextInput
          label="Protein (g)"
          value={protein}
          onChangeText={(text) => setProtein(text.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
          mode="outlined"
          className="mb-4"        />
        <TextInput
          label="Carbs (g)"
          value={carbs}
          onChangeText={(text) => setCarbs(text.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
          mode="outlined"
          className="mb-4"        />
        <TextInput
          label="Fats (g)"
          value={fats}
          onChangeText={(text) => setFats(text.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
          mode="outlined"
          className="mb-4"        />
          <TextInput
          label="Water (ml)"
          value={water}
          onChangeText={(text) => setWater(text.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
          mode="outlined"
          className="mb-4"        />
      </View>

      <Button
        mode="contained"
        onPress={handleSave}
        style={{ backgroundColor: colors.primary }}
        className="rounded-30"
        contentStyle={{paddingVertical: 10}}
        icon="check"
      >
        Save & Continue
      </Button>
    </ScrollView>
  );
}


