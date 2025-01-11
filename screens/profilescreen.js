import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, ActivityIndicator  } from 'react-native';
import { Button, TextInput, Card, Title, Appbar, useTheme  } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Profile({ navigation }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');

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
      fats: parseFloat(fats) 
    };

    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    Alert.alert('Success', 'Profile updated successfully');
  };

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
      <Button mode="contained" onPress={handleSave} style={styles.saveButton} labelStyle={{fontSize:17,fontWeight:"bold"}}>
        SAVE
      </Button>
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
    backgroundColor:"#4CAF50"
  },
  resetButton: {
    marginVertical: 10,
    paddingVertical: 5,
    borderRadius: 8,
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
});
