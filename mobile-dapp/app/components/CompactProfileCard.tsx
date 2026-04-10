import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CompactProfileCardProps {
  walletAddress: string;
}

const CompactProfileCard = ({ walletAddress }: CompactProfileCardProps) => {
  const shortAddress = walletAddress 
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : 'Not Connected';

  return (
    <View style={styles.card}>
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{shortAddress[0]}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.walletLabel}>Connected Wallet</Text>
        <Text style={styles.address}>{shortAddress}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222',
    width: '100%',
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  walletLabel: {
    color: '#666',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  address: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
});

export default CompactProfileCard;
