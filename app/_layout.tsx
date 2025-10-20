// app/(tabs)/index.tsx
import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGastos } from '../context/gastosContext';
import { Gasto } from '../types';

export default function HomeScreen() {
  const router = useRouter();
  const { gastos, isLoading, eliminarGasto } = useGastos();

  const formatFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatMonto = (monto: number) => {
    return `$${monto.toFixed(2)}`;
  };

  const handleEliminar = (id: string, descripcion: string) => {
    // Opcional: agregar confirmación
    if (window.confirm(`¿Eliminar "${descripcion}"?`)) {
      eliminarGasto(id);
    }
  };

  const renderGasto = ({ item }: { item: Gasto }) => (
    <TouchableOpacity 
      style={styles.gastoCard}
      activeOpacity={0.7}
    >
      <View style={styles.gastoHeader}>
        <Image 
          source={{ uri: item.fotoUri }} 
          style={styles.thumbnail}
        />
        <View style={styles.gastoInfo}>
          <Text style={styles.descripcion} numberOfLines={2}>
            {item.descripcion}
          </Text>
          <Text style={styles.fecha}>{formatFecha(item.fecha)}</Text>
        </View>
      </View>

      <View style={styles.gastoFooter}>
        <View>
          <Text style={styles.pagadorLabel}>Pagó:</Text>
          <Text style={styles.pagadorNombre}>{item.pagador.nombre}</Text>
        </View>

        <View style={styles.montoContainer}>
          <Text style={styles.monto}>{formatMonto(item.monto)}</Text>
        </View>
      </View>

      <View style={styles.participantesContainer}>
        <Text style={styles.participantesLabel}>Participantes: </Text>
        <Text style={styles.participantes}>
          {item.participantes.map(p => p.nombre).join(', ')}
        </Text>
      </View>

      {/* Botón eliminar opcional */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleEliminar(item.id, item.descripcion)}
      >
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💸</Text>
      <Text style={styles.emptyTitle}>No hay gastos registrados</Text>
      <Text style={styles.emptyText}>
        Presiona el botón + para agregar tu primer gasto
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando gastos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Gastos Compartidos</Text>
          <Text style={styles.headerSubtitle}>
            {gastos.length} {gastos.length === 1 ? 'gasto' : 'gastos'} registrados
          </Text>
        </View>
      </View>

      {/* Lista de gastos */}
      <FlatList
        data={gastos}
        renderItem={renderGasto}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />

      {/* Botón flotante para agregar */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/modal')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  gastoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gastoHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  gastoInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  descripcion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  fecha: {
    fontSize: 12,
    color: '#999',
  },
  gastoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  pagadorLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  pagadorNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  montoContainer: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  monto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  participantesContainer: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  participantesLabel: {
    fontSize: 12,
    color: '#666',
  },
  participantes: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
});