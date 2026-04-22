import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWallet } from '../context/WalletContext';
import { getWalletReceipts } from '../services/api';

const WorkScreen = () => {
  const { walletAddress } = useWallet();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [receipts, setReceipts] = useState<any[]>([]);

  const fetchReceipts = async () => {
    if (!walletAddress) return;
    try {
      const data = await getWalletReceipts(walletAddress);
      setReceipts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('Fetch Receipts Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [walletAddress]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReceipts();
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.receiptCard}>
      <View style={styles.header}>
        <Text style={styles.role}>{item.role}</Text>
        <View style={[styles.statusBadge, item.status === 'Attested' ? styles.statusAttested : styles.statusClaim]}>
          <Text style={[styles.statusText, item.status === 'Attested' ? styles.statusTextAttested : styles.statusTextClaim]}>
            {item.status === 'Attested' ? '✓ Attested' : 'Claim'}
          </Text>
        </View>
      </View>
      <Text style={styles.org}>{item.org}</Text>
      <Text style={styles.date}>{item.startDate} - {item.endDate}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Proof of Work</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 40 }} />
        ) : receipts.length > 0 ? (
          <FlatList
            data={receipts}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No work history found.</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    marginTop: 20,
  },
  list: {
    paddingBottom: 40,
  },
  receiptCard: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  role: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusAttested: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusClaim: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  statusTextAttested: {
    color: '#10b981',
  },
  statusTextClaim: {
    color: '#666',
  },
  org: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  date: {
    color: '#666',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#444',
    fontSize: 16,
  },
});

export default WorkScreen;
