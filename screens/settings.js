import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { Button, TextInput, Card, Title, Appbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Setting({ navigation }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');

  const resetData = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('Data Reset', 'All data has been reset.');
    } catch (error) {
      Alert.alert('Error', 'Failed to reset data');
    }
  };

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
      }
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
      fats: parseFloat(fats) 
    };

    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    Alert.alert('Success', 'Profile updated successfully');
  };

  return (
    <ScrollView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Settings" />
      </Appbar.Header>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Profile Information</Title>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            label="Name"
            mode="outlined"
          />
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ''))}
            label="Age"
            keyboardType="numeric"
            mode="outlined"
          />
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={(text) => setWeight(text.replace(/[^0-9.]/g, ''))}
            label="Weight (kg)"
            keyboardType="numeric"
            mode="outlined"
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Daily Macros</Title>
          <TextInput
            style={styles.input}
            value={calories}
            onChangeText={(text) => setCalories(text.replace(/[^0-9]/g, ''))}
            label="Calories"
            keyboardType="numeric"
            mode="outlined"
          />
          <TextInput
            style={styles.input}
            value={protein}
            onChangeText={(text) => setProtein(text.replace(/[^0-9.]/g, ''))}
            label="Protein (g)"
            keyboardType="numeric"
            mode="outlined"
          />
          <TextInput
            style={styles.input}
            value={carbs}
            onChangeText={(text) => setCarbs(text.replace(/[^0-9.]/g, ''))}
            label="Carbs (g)"
            keyboardType="numeric"
            mode="outlined"
          />
          <TextInput
            style={styles.input}
            value={fats}
            onChangeText={(text) => setFats(text.replace(/[^0-9.]/g, ''))}
            label="Fats (g)"
            keyboardType="numeric"
            mode="outlined"
          />
        </Card.Content>
      </Card>

      <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
        Save
      </Button>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Reset Options</Title>
          <Button mode="outlined" onPress={() => AsyncStorage.removeItem('mealHistory')} style={styles.resetButton}>
            Reset Calorie History
          </Button>
          <Button mode="outlined" onPress={() => AsyncStorage.removeItem('meals')} style={styles.resetButton}>
            Reset Meals
          </Button>
          <Button mode="outlined" onPress={resetData} style={styles.resetButton}>
            Reset All Data
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 4,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#3e3e3e',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  saveButton: {
    marginVertical: 20,
    paddingVertical: 10,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  resetButton: {
    marginVertical: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
});
