// app/modal-gasto.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useGastos } from '../context/gastosContext';
import { PARTICIPANTES, Participante } from '../types';

export default function ModalGasto() {
  const router = useRouter();
  const { agregarGasto } = useGastos();

  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [pagador, setPagador] = useState<Participante | null>(null);
  const [participantesSeleccionados, setParticipantesSeleccionados] = useState<Participante[]>([]);
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Solicitar permisos y abrir cámara
  const tomarFoto = async () => {
    try {
      // Solicitar permisos
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Necesitamos acceso a la cámara para tomar fotos de los recibos.'
        );
        return;
      }

      // Abrir cámara
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFotoUri(result.assets[0].uri);
        setError(''); // Limpiar error si había
      }
    } catch (error) {
      console.error('Error al tomar foto:', error);
      Alert.alert('Error', 'No se pudo abrir la cámara');
    }
  };

  // Seleccionar de galería (alternativa)
  const seleccionarDeGaleria = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Necesitamos acceso a tu galería.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFotoUri(result.assets[0].uri);
        setError('');
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo acceder a la galería');
    }
  };

  const togglePagador = (persona: Participante) => {
    setPagador(persona);
  };

  const toggleParticipante = (persona: Participante) => {
    if (participantesSeleccionados.find(p => p.id === persona.id)) {
      setParticipantesSeleccionados(participantesSeleccionados.filter(p => p.id !== persona.id));
    } else {
      setParticipantesSeleccionados([...participantesSeleccionados, persona]);
    }
  };

  const validarFormulario = (): boolean => {
    if (!descripcion.trim()) {
      setError('La descripción es obligatoria');
      return false;
    }

    if (!monto || parseFloat(monto) <= 0) {
      setError('Ingresa un monto válido mayor a 0');
      return false;
    }

    if (!pagador) {
      setError('Selecciona quién pagó');
      return false;
    }

    if (participantesSeleccionados.length === 0) {
      setError('Selecciona al menos un participante');
      return false;
    }

    if (!fotoUri) {
      setError('⚠️ Debes tomar una foto del recibo antes de guardar');
      return false;
    }

    return true;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) {
      return;
    }

    try {
      await agregarGasto({
        descripcion: descripcion.trim(),
        monto: parseFloat(monto),
        pagador: pagador!,
        participantes: participantesSeleccionados,
        fotoUri: fotoUri!,
      });

      Alert.alert('¡Éxito!', 'Gasto registrado correctamente', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el gasto');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Descripción */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descripción del gasto</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Cena en restaurante"
            value={descripcion}
            onChangeText={setDescripcion}
          />
        </View>

        {/* Monto */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Monto ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={monto}
            onChangeText={setMonto}
          />
        </View>

        {/* Quién pagó */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>¿Quién pagó?</Text>
          <View style={styles.optionsContainer}>
            {PARTICIPANTES.map(persona => (
              <TouchableOpacity
                key={persona.id}
                style={[
                  styles.option,
                  pagador?.id === persona.id && styles.optionSelected
                ]}
                onPress={() => togglePagador(persona)}
              >
                <Text style={[
                  styles.optionText,
                  pagador?.id === persona.id && styles.optionTextSelected
                ]}>
                  {persona.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Participantes */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Participantes (selecciona todos los que apliquen)</Text>
          <View style={styles.optionsContainer}>
            {PARTICIPANTES.map(persona => (
              <TouchableOpacity
                key={persona.id}
                style={[
                  styles.option,
                  participantesSeleccionados.find(p => p.id === persona.id) && styles.optionSelected
                ]}
                onPress={() => toggleParticipante(persona)}
              >
                <Text style={[
                  styles.optionText,
                  participantesSeleccionados.find(p => p.id === persona.id) && styles.optionTextSelected
                ]}>
                  {persona.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Foto del Recibo */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Foto del Recibo *</Text>
          
          {fotoUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: fotoUri }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.changePhotoButton}
                onPress={tomarFoto}
              >
                <Text style={styles.changePhotoText}>Cambiar Foto</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoButtons}>
              <TouchableOpacity style={styles.photoButton} onPress={tomarFoto}>
                <Text style={styles.photoButtonText}>📸 Tomar Foto</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoButtonSecondary} onPress={seleccionarDeGaleria}>
                <Text style={styles.photoButtonTextSecondary}>🖼️ Galería</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Botones */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleGuardar}
          >
            <Text style={styles.saveButtonText}>Guardar Gasto</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
  },
  errorContainer: {
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f00',
  },
  errorText: {
    color: '#c00',
    fontSize: 14,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  optionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#fff',
  },
  photoButtons: {
    gap: 10,
  },
  photoButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  photoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  photoButtonSecondary: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  photoButtonTextSecondary: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 12,
  },
  changePhotoButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    width: '100%',
    alignItems: 'center',
  },
  changePhotoText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#34C759',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});