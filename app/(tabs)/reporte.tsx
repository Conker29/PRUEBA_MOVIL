// app/(tabs)/reporte.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useGastos } from '../../context/gastosContext';

export default function ReporteScreen() {
  const { gastos, calcularBalances } = useGastos();
  const [generando, setGenerando] = useState(false);

  const generarHTMLReporte = () => {
    const balances = calcularBalances();
    const totalGeneral = gastos.reduce((sum, g) => sum + g.monto, 0);
    const promedioPorPersona = totalGeneral / 3;

    // Calcular totales por persona
    const totalesPorPersona: { [nombre: string]: number } = {
      'Juan': 0,
      'María': 0,
      'Pedro': 0
    };

    gastos.forEach(gasto => {
      totalesPorPersona[gasto.pagador.nombre] += gasto.monto;
    });

    const fechaReporte = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #333;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #007AFF;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #007AFF;
            margin: 0;
            font-size: 32px;
          }
          .header p {
            color: #666;
            margin: 10px 0 0 0;
            font-size: 14px;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #007AFF;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 2px solid #e0e0e0;
          }
          .summary-box {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #dee2e6;
          }
          .summary-item:last-child {
            border-bottom: none;
          }
          .summary-label {
            font-weight: 600;
            color: #495057;
          }
          .summary-value {
            font-weight: bold;
            color: #007AFF;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background-color: #007AFF;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #e0e0e0;
          }
          tr:last-child td {
            border-bottom: none;
          }
          tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          .balance-item {
            background-color: #fff3cd;
            padding: 15px;
            border-left: 4px solid #ffc107;
            margin-bottom: 10px;
            border-radius: 4px;
          }
          .balance-item strong {
            color: #856404;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
            color: #666;
            font-size: 12px;
          }
          .total-row {
            font-weight: bold;
            background-color: #e7f3ff !important;
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Reporte de Gastos Compartidos</h1>
          <p>Generado el ${fechaReporte}</p>
        </div>

        <!-- Resumen General -->
        <div class="section">
          <div class="section-title">💰 Resumen General</div>
          <div class="summary-box">
            <div class="summary-item">
              <span class="summary-label">Total de gastos:</span>
              <span class="summary-value">${gastos.length}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Monto total gastado:</span>
              <span class="summary-value">$${totalGeneral.toFixed(2)}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Promedio por persona:</span>
              <span class="summary-value">$${promedioPorPersona.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <!-- Gastos por Persona -->
        <div class="section">
          <div class="section-title">👥 Gastos por Persona</div>
          <table>
            <thead>
              <tr>
                <th>Persona</th>
                <th>Total Pagado</th>
                <th>Debe Pagar</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(totalesPorPersona).map(([nombre, total]) => {
                const balance = total - promedioPorPersona;
                const balanceText = Math.abs(balance) < 0.01 ? 'Equilibrado' :
                                  balance > 0 ? `Le deben ${balance.toFixed(2)}` :
                                  `Debe ${Math.abs(balance).toFixed(2)}`;
                return `
                  <tr>
                    <td><strong>${nombre}</strong></td>
                    <td>${total.toFixed(2)}</td>
                    <td>${promedioPorPersona.toFixed(2)}</td>
                    <td>${balanceText}</td>
                  </tr>
                `;
              }).join('')}
              <tr class="total-row">
                <td>TOTAL</td>
                <td>${totalGeneral.toFixed(2)}</td>
                <td>${totalGeneral.toFixed(2)}</td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Detalle de Gastos -->
        <div class="section">
          <div class="section-title">📝 Detalle de Gastos</div>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Pagador</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              ${gastos.map(gasto => {
                const fecha = new Date(gasto.fecha).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                });
                return `
                  <tr>
                    <td>${fecha}</td>
                    <td>${gasto.descripcion}</td>
                    <td>${gasto.pagador.nombre}</td>
                    <td><strong>${gasto.monto.toFixed(2)}</strong></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Liquidación de Deudas -->
        ${balances.length > 0 ? `
        <div class="section">
          <div class="section-title">💳 Liquidación de Deudas</div>
          <p style="color: #666; margin-bottom: 15px;">
            Para equilibrar las cuentas, se deben realizar las siguientes transferencias:
          </p>
          ${balances.map(balance => `
            <div class="balance-item">
              <strong>${balance.deudor}</strong> debe transferir 
              <strong>${balance.monto.toFixed(2)}</strong> a 
              <strong>${balance.acreedor}</strong>
            </div>
          `).join('')}
        </div>
        ` : `
        <div class="section">
          <div class="section-title">✅ Estado de Cuentas</div>
          <div class="summary-box" style="text-align: center; background-color: #d4edda;">
            <p style="color: #155724; font-weight: bold; margin: 0;">
              ¡Todas las cuentas están equilibradas!
            </p>
            <p style="color: #155724; margin: 10px 0 0 0;">
              Todos han pagado su parte equitativamente.
            </p>
          </div>
        </div>
        `}

        <div class="footer">
          <p>Reporte generado automáticamente por Gastos Compartidos App</p>
          <p>Participantes: Juan, María y Pedro</p>
        </div>
      </body>
      </html>
    `;
  };

  const generarPDF = async () => {
    if (gastos.length === 0) {
      Alert.alert('Sin datos', 'No hay gastos registrados para generar el reporte');
      return;
    }

    setGenerando(true);

    try {
      const html = generarHTMLReporte();
      const { uri } = await Print.printToFileAsync({ html });
      
      Alert.alert(
        '¡PDF Generado!',
        '¿Qué deseas hacer con el reporte?',
        [
          {
            text: 'Compartir',
            onPress: async () => {
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
              } else {
                Alert.alert('Error', 'No se puede compartir en este dispositivo');
              }
            }
          },
          {
            text: 'Ver PDF',
            onPress: () => {
              Alert.alert('PDF guardado', `El PDF se guardó en: ${uri}`);
            }
          },
          {
            text: 'Cancelar',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Error al generar PDF:', error);
      Alert.alert('Error', 'No se pudo generar el PDF');
    } finally {
      setGenerando(false);
    }
  };

  const calcularEstadisticas = () => {
    if (gastos.length === 0) return null;

    const totalGeneral = gastos.reduce((sum, g) => sum + g.monto, 0);
    const promedio = totalGeneral / gastos.length;
    const gastoMayor = Math.max(...gastos.map(g => g.monto));
    const gastoMenor = Math.min(...gastos.map(g => g.monto));

    return { totalGeneral, promedio, gastoMayor, gastoMenor };
  };

  const stats = calcularEstadisticas();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reporte</Text>
        <Text style={styles.headerSubtitle}>
          Genera un PDF con el resumen completo
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {gastos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📄</Text>
            <Text style={styles.emptyTitle}>No hay datos para reportar</Text>
            <Text style={styles.emptyText}>
              Agrega gastos para poder generar un reporte
            </Text>
          </View>
        ) : (
          <>
            {/* Vista previa de estadísticas */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Estadísticas</Text>
              
              {stats && (
                <View style={styles.statsContainer}>
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Total Gastos</Text>
                    <Text style={styles.statValue}>{gastos.length}</Text>
                  </View>
                  
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Monto Total</Text>
                    <Text style={styles.statValue}>${stats.totalGeneral.toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Promedio</Text>
                    <Text style={styles.statValue}>${stats.promedio.toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Gasto Mayor</Text>
                    <Text style={styles.statValue}>${stats.gastoMayor.toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Gasto Menor</Text>
                    <Text style={styles.statValue}>${stats.gastoMenor.toFixed(2)}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Información del reporte */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📄 Contenido del Reporte</Text>
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>✓ Resumen general de gastos</Text>
                <Text style={styles.infoText}>✓ Gastos por persona</Text>
                <Text style={styles.infoText}>✓ Detalle completo de cada gasto</Text>
                <Text style={styles.infoText}>✓ Balance y liquidación de deudas</Text>
                <Text style={styles.infoText}>✓ Formato profesional en PDF</Text>
              </View>
            </View>

            {/* Botón generar */}
            <TouchableOpacity
              style={[styles.generateButton, generando && styles.generateButtonDisabled]}
              onPress={generarPDF}
              disabled={generando}
            >
              {generando ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#fff" />
                  <Text style={styles.generateButtonText}>Generando PDF...</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.generateButtonIcon}>📄</Text>
                  <Text style={styles.generateButtonText}>Generar Reporte PDF</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.helpText}>
              El PDF incluirá toda la información de los gastos registrados y podrás compartirlo en redes sociales o guardarlo en tu dispositivo.
            </Text>
          </>
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  generateButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  generateButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  generateButtonIcon: {
    fontSize: 24,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
    lineHeight: 18,
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
});