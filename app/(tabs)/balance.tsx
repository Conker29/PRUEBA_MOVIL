// app/(tabs)/balance.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useGastos } from '../../context/gastosContext';

export default function BalanceScreen() {
  const { gastos, calcularBalances } = useGastos();

  // Calcular totales por persona
  const calcularTotalesPorPersona = () => {
    const totales: { [nombre: string]: number } = {
      'Juan': 0,
      'María': 0,
      'Pedro': 0
    };

    gastos.forEach(gasto => {
      totales[gasto.pagador.nombre] += gasto.monto;
    });

    return totales;
  };

  const totales = calcularTotalesPorPersona();
  const balances = calcularBalances();
  const totalGeneral = Object.values(totales).reduce((sum, val) => sum + val, 0);
  const promedioPorPersona = totalGeneral / 3;

  const renderResumenPersona = (nombre: string, total: number) => {
    const balance = total - promedioPorPersona;
    const isPositivo = balance > 0;
    const isNeutral = Math.abs(balance) < 0.01;

    return (
      <View key={nombre} style={styles.personaCard}>
        <View style={styles.personaHeader}>
          <Text style={styles.personaNombre}>{nombre}</Text>
          <Text style={styles.personaTotal}>${total.toFixed(2)}</Text>
        </View>
        <View style={styles.personaBalance}>
          <Text style={styles.balanceLabel}>Balance:</Text>
          <Text style={[
            styles.balanceAmount,
            isPositivo && styles.balancePositivo,
            !isPositivo && !isNeutral && styles.balanceNegativo,
            isNeutral && styles.balanceNeutral,
          ]}>
            {isNeutral ? 'Equilibrado' : 
             isPositivo ? `Le deben $${balance.toFixed(2)}` : 
             `Debe $${Math.abs(balance).toFixed(2)}`}
          </Text>
        </View>
      </View>
    );
  };

  const renderDeuda = (deudor: string, acreedor: string, monto: number, index: number) => (
    <View key={index} style={styles.deudaCard}>
      <View style={styles.deudaIconContainer}>
        <Text style={styles.deudaIcon}>💸</Text>
      </View>
      <View style={styles.deudaInfo}>
        <Text style={styles.deudaTexto}>
          <Text style={styles.deudorNombre}>{deudor}</Text>
          {' debe a '}
          <Text style={styles.acreedorNombre}>{acreedor}</Text>
        </Text>
        <Text style={styles.deudaMonto}>${monto.toFixed(2)}</Text>
      </View>
    </View>
  );

  if (gastos.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Balance</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💰</Text>
          <Text style={styles.emptyTitle}>No hay gastos para calcular</Text>
          <Text style={styles.emptyText}>
            Agrega gastos para ver el balance del grupo
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Balance del Grupo</Text>
        <Text style={styles.headerSubtitle}>
          Total gastado: ${totalGeneral.toFixed(2)}
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Resumen General */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Resumen por Persona</Text>
          <View style={styles.promedioCard}>
            <Text style={styles.promedioLabel}>Promedio por persona:</Text>
            <Text style={styles.promedioMonto}>${promedioPorPersona.toFixed(2)}</Text>
          </View>
        </View>

        {/* Gastos por persona */}
        <View style={styles.section}>
          {Object.entries(totales).map(([nombre, total]) => 
            renderResumenPersona(nombre, total)
          )}
        </View>

        {/* Liquidación de deudas */}
        {balances.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💳 Liquidación de Deudas</Text>
            <Text style={styles.sectionSubtitle}>
              Estas son las transferencias necesarias para equilibrar las cuentas:
            </Text>
            {balances.map((balance, index) => 
              renderDeuda(balance.deudor, balance.acreedor, balance.monto, index)
            )}
          </View>
        )}

        {balances.length === 0 && (
          <View style={styles.equilibradoContainer}>
            <Text style={styles.equilibradoIcon}>✅</Text>
            <Text style={styles.equilibradoTitle}>¡Todo equilibrado!</Text>
            <Text style={styles.equilibradoText}>
              Todos pagaron su parte equitativamente
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  promedioCard: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promedioLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  promedioMonto: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  personaCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  personaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  personaNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  personaTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  personaBalance: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  balanceAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  balancePositivo: {
    color: '#34C759',
  },
  balanceNegativo: {
    color: '#FF3B30',
  },
  balanceNeutral: {
    color: '#8E8E93',
  },
  deudaCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deudaIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deudaIcon: {
    fontSize: 24,
  },
  deudaInfo: {
    flex: 1,
  },
  deudaTexto: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  deudorNombre: {
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  acreedorNombre: {
    fontWeight: 'bold',
    color: '#34C759',
  },
  deudaMonto: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  equilibradoContainer: {
    alignItems: 'center',
    padding: 32,
  },
  equilibradoIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  equilibradoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 8,
  },
  equilibradoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
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
});