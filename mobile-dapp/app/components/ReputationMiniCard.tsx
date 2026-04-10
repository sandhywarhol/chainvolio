import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ReputationMiniCardProps {
  score: number;
  trust: number;
  confidence: number;
}

const ReputationMiniCard = ({ score, trust, confidence }: ReputationMiniCardProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.metric}>
        <Text style={styles.label}>Reputation</Text>
        <Text style={styles.value}>{score}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.metric}>
        <Text style={styles.label}>Trust</Text>
        <Text style={styles.value}>{trust}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.metric}>
        <Text style={styles.label}>Confidence</Text>
        <Text style={styles.value}>{confidence}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#111',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#222',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    color: '#666',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  value: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#222',
  },
});

export default ReputationMiniCard;
