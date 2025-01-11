import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, Alert } from 'react-native';
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
    if (!name || !age || !calories || !protein || !carbs || !fats) {
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
    };

    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Error', 'Failed to save data');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.label, { color: colors.primary }]}>Profile</Text>
      <Divider style={styles.divider} />

      <View style={styles.inputContainer}>
        <TextInput
          label="Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Age"
          value={age}
          onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Weight (kg)"
          value={weight}
          onChangeText={(text) => setWeight(text.replace(/[^0-9.]/g, ''))}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        />
      </View>

      <Text style={[styles.label, { color: colors.primary }]}>Daily Macros Goals</Text>
      <Divider style={styles.divider} />

      <View style={styles.inputContainer}>
        <TextInput
          label="Calorie (cal)"
          value={calories}
          onChangeText={(text) => setCalories(text.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Protein (g)"
          value={protein}
          onChangeText={(text) => setProtein(text.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Carbs (g)"
          value={carbs}
          onChangeText={(text) => setCarbs(text.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Fats (g)"
          value={fats}
          onChangeText={(text) => setFats(text.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSave}
        style={[styles.button, { backgroundColor: colors.primary }]}
        contentStyle={styles.buttonContent}
        icon="check"
      >
        Save & Continue
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 20,
    borderRadius: 30,
  },
  buttonContent: {
    paddingVertical: 10,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#e0e0e0',
    height: 1.5,
  },
});
