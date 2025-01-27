import React, { useState, useEffect } from 'react';
import { View,ScrollView, Text, Alert,ActivityIndicator  } from 'react-native';
import {TextInput, Card, Title, FAB, useTheme,SegmentedButtons  } from 'react-native-paper';
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
  const [cupsize, setcupsize] = useState(0);
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
        setcupsize(userData.cupsize ? userData.cupsize: '');
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
      water: parseFloat(water),
      cupsize: parseFloat(cupsize) 
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
    <View className="flex-1 bg-blue-50">
  <ScrollView className="flex-1 p-4">
    
    {/* Profile Information Card */}
    <Card className="bg-white mb-6 mt-5 rounded-xl shadow-lg">
      <Card.Content>
        <Title className="text-2xl font-semibold text-gray-800 mb-6">Profile Information</Title>
        <TextInput
          className="mb-4"
          value={name}
          onChangeText={setName}
          label="Name"
          mode="outlined"
          activeOutlineColor="#007bff"
          outlineColor="#ccc"
          style={{ backgroundColor: '#f9f9f9' }}
        />
        <TextInput
          className="mb-4"
          value={age}
          onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ''))}
          label="Age"
          keyboardType="numeric"
          mode="outlined"
          activeOutlineColor="#007bff"
          outlineColor="#ccc"
          style={{ backgroundColor: '#f9f9f9' }}
        />
        <TextInput
          className="mb-4"
          value={weight}
          onChangeText={(text) => setWeight(text.replace(/[^0-9.]/g, ''))}
          label="Weight (kg)"
          keyboardType="numeric"
          mode="outlined"
          activeOutlineColor="#007bff"
          outlineColor="#ccc"
          style={{ backgroundColor: '#f9f9f9' }}
        />
      </Card.Content>
    </Card>
    
    {/* Daily Macros Card */}
    <Card className="bg-white mb-6 rounded-xl shadow-lg">
      <Card.Content>
        <Title className="text-2xl font-semibold text-gray-800 mb-6">Daily Macros</Title>
        <TextInput
          className="mb-4"
          value={calories}
          onChangeText={(text) => setCalories(text.replace(/[^0-9]/g, ''))}
          label="Calories"
          keyboardType="numeric"
          mode="outlined"
          activeOutlineColor="#007bff"
          outlineColor="#ccc"
          style={{ backgroundColor: '#f9f9f9' }}
        />
        <TextInput
          className="mb-4"
          value={protein}
          onChangeText={(text) => setProtein(text.replace(/[^0-9.]/g, ''))}
          label="Protein (g)"
          keyboardType="numeric"
          mode="outlined"
          activeOutlineColor="#007bff"
          outlineColor="#ccc"
          style={{ backgroundColor: '#f9f9f9' }}
        />
        <TextInput
          className="mb-4"
          value={carbs}
          onChangeText={(text) => setCarbs(text.replace(/[^0-9.]/g, ''))}
          label="Carbs (g)"
          keyboardType="numeric"
          mode="outlined"
          activeOutlineColor="#007bff"
          outlineColor="#ccc"
          style={{ backgroundColor: '#f9f9f9' }}
        />
        <TextInput
          className="mb-4"
          value={fats}
          onChangeText={(text) => setFats(text.replace(/[^0-9.]/g, ''))}
          label="Fats (g)"
          keyboardType="numeric"
          mode="outlined"
          activeOutlineColor="#007bff"
          outlineColor="#ccc"
          style={{ backgroundColor: '#f9f9f9' }}
        />
        <TextInput
          className="mb-4"
          value={water}
          onChangeText={(text) => setWater(text.replace(/[^0-9.]/g, ''))}
          label="Water (ml)"
          keyboardType="numeric"
          mode="outlined"
          activeOutlineColor="#007bff"
          outlineColor="#ccc"
          style={{ backgroundColor: '#f9f9f9' }}
        />
      </Card.Content>
    </Card>
    
    {/* Units & Metrics Card */}
    <Card className="bg-white mb-6 rounded-xl shadow-lg">
      <Card.Content>
        <Title className="text-2xl font-semibold text-gray-800 mb-3">Units & Metrics</Title>
        <Text className="text-lg font-bold text-gray-600 mb-1">Cup Size (ml)</Text>
        <Text className="text-lg font-medium text-center text-gray-500">
        1 Cup = <Text className="font-bold">{cupsize}ml</Text></Text>
        <SegmentedButtons
          value={cupsize}
          onValueChange={setcupsize}
          buttons={[
            { value: 50, label: '50', icon: 'cup-water' },
            { value: 100, label: '100', icon: 'cup-water' },
            { value: 200, label: '200', icon: 'cup-water' },
            { value: 250, label: '250', icon: 'cup-water' }
          ]}
          className="mb-4"
          style={{
            backgroundColor: '#f5f5f5',
          }}
        />
      </Card.Content>
    </Card>

  </ScrollView>

  <FAB
  icon="check"
  color="gold"
  className="absolute bottom-6 right-6 shadow-lg"
  onPress={handleSave}
  style={{
    backgroundColor: 'rgba(0, 174, 0, 0.6)', // Adjust color and transparency
  }}
/>
</View>

  );
}

