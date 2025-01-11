import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Button, Card, Title, Text, useTheme } from 'react-native-paper';
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
    <ScrollView style={styles.container}>
      <Title style={[styles.pageTitle, { color: theme.colors.primary }]}>
        Settings
      </Title>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loaderText}>Resetting Data...</Text>
        </View>
      ) : (
        <>
        <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>API Meal Data</Title>
              <Text style={styles.cardText}>
                Add Meals from online sources.
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('ApiMeal')}
                icon="plus"
                style={styles.actionButton}
              >
                ADD
              </Button>
            </Card.Actions>
          </Card>

        <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>History</Title>
              <Text style={styles.cardText}>
                View your meal history, including calorie data.
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('History')}
                icon="history"
                style={styles.actionButton}
              >
                View History
              </Button>
            </Card.Actions>
          </Card>

          <Card style={[styles.card, { borderColor: theme.colors.primary }]}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Reset Options</Title>
              <Button
                mode="outlined"
                onPress={() => AsyncStorage.removeItem('mealHistory')}
                style={styles.resetButton}
                icon="history"
              >
                Reset Calorie History
              </Button>
              <Button
                mode="outlined"
                onPress={() => AsyncStorage.removeItem('meals')}
                style={styles.resetButton}
                icon="food"
              >
                Reset Meals
              </Button>
              <Button
                mode="contained"
                onPress={resetData}
                style={styles.resetButton}
                icon="alert-circle"
              >
                Reset All Data
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Developer Mode</Title>
              <Text style={styles.cardText}>
                Access developer features and test data.
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Developermode')}
                icon="code-tags"
                style={styles.actionButton}
              >
                Open Developer Mode
              </Button>
            </Card.Actions>
          </Card>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 3,
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  cardText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  resetButton: {
    marginVertical: 8,
    borderRadius: 8,
    paddingVertical: 6,
  },
  actionButton: {
    flex: 1,
    margin: 4,
    borderRadius: 8,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 50,
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#777',
  },
});
