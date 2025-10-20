// app/(tabs)/recibos.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { useGastos } from '../../context/gastosContext';
import { Gasto } from '../../types';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 48) / 3; // 3 columnas con margen

export default function RecibosScreen() {
  const { gastos } = useGastos();
  const [modalVisible, setModalVisible] = useState(false);
  const [gastoSeleccionado, setGastoSeleccionado] = useState<Gasto | null>(null);

  const abrirModal = (gasto: Gasto) => {
    setGastoSeleccionado(gasto);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setGastoSeleccionado(null);
  };

  const formatFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderRecibo = ({ item }: { item: Gasto }) => (
    <TouchableOpacity
      style={styles.reciboItem}
      onPress={() => abrirModal(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.fotoUri }} style={styles.reciboImage} />
      <View style={styles.reciboOverlay}>
        <Text style={styles.reciboMonto}>${item.monto.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📸</Text>
      <Text style={styles.emptyTitle}>No hay recibos</Text>
      <Text style={styles.emptyText}>
        Los recibos de tus gastos aparecerán aquí
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Galería de Recibos</Text>
        <Text style={styles.headerSubtitle}>
          {gastos.length} {gastos.length === 1 ? 'recibo' : 'recibos'}
        </Text>
      </View>

      <FlatList
        data={gastos}
        renderItem={renderRecibo}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal para ver recibo grande */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={cerrarModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={cerrarModal}
          >
            <View style={styles.modalContent}>
              {gastoSeleccionado && (
                <>
                  <Image 
                    source={{ uri: gastoSeleccionado.fotoUri }} 
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                  
                  <View style={styles.modalInfo}>
                    <Text style={styles.modalDescripcion}>
                      {gastoSeleccionado.descripcion}
                    </Text>
                    
                    <View style={styles.modalDetails}>
                      <View style={styles.modalDetailRow}>
                        <Text style={styles.modalLabel}>Monto:</Text>
                        <Text style={styles.modalValue}>
                          ${gastoSeleccionado.monto.toFixed(2)}
                        </Text>
                      </View>
                      
                      <View style={styles.modalDetailRow}>
                        <Text style={styles.modalLabel}>Pagó:</Text>
                        <Text style={styles.modalValue}>
                          {gastoSeleccionado.pagador.nombre}
                        </Text>
                      </View>
                      
                      <View style={styles.modalDetailRow}>
                        <Text style={styles.modalLabel}>Fecha:</Text>
                        <Text style={styles.modalValue}>
                          {formatFecha(gastoSeleccionado.fecha)}
                        </Text>
                      </View>
                      
                      <View style={styles.modalDetailRow}>
                        <Text style={styles.modalLabel}>Participantes:</Text>
                        <Text style={styles.modalValue}>
                          {gastoSeleccionado.participantes.map(p => p.nombre).join(', ')}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={cerrarModal}
                    >
                      <Text style={styles.closeButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
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
  grid: {
    padding: 12,
  },
  reciboItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  reciboImage: {
    width: '100%',
    height: '100%',
  },
  reciboOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
    alignItems: 'center',
  },
  reciboMonto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  modalInfo: {
    padding: 20,
  },
  modalDescripcion: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  modalDetails: {
    gap: 12,
    marginBottom: 20,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  modalValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});