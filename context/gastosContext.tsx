// context/GastosContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Gasto, Balance, GastosContextType } from '../types';

const GastosContext = createContext<GastosContextType | undefined>(undefined);

const STORAGE_KEY = '@gastos_compartidos';

export const GastosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar gastos al iniciar la app
  useEffect(() => {
    cargarGastos();
  }, []);

  const cargarGastos = async () => {
    try {
      const gastosGuardados = await AsyncStorage.getItem(STORAGE_KEY);
      if (gastosGuardados) {
        setGastos(JSON.parse(gastosGuardados));
      }
    } catch (error) {
      console.error('Error al cargar gastos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const guardarEnStorage = async (nuevosGastos: Gasto[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nuevosGastos));
    } catch (error) {
      console.error('Error al guardar gastos:', error);
    }
  };

  const agregarGasto = async (gastoData: Omit<Gasto, 'id' | 'fecha'>) => {
    const nuevoGasto: Gasto = {
      ...gastoData,
      id: Date.now().toString(),
      fecha: new Date().toISOString(),
    };

    const nuevosGastos = [...gastos, nuevoGasto];
    setGastos(nuevosGastos);
    await guardarEnStorage(nuevosGastos);
  };

  const eliminarGasto = async (id: string) => {
    const nuevosGastos = gastos.filter(g => g.id !== id);
    setGastos(nuevosGastos);
    await guardarEnStorage(nuevosGastos);
  };

  const calcularBalances = (): Balance[] => {
    if (gastos.length === 0) return [];

    // 1. Calcular cuánto gastó cada persona
    const totalPorPersona: { [nombre: string]: number } = {
      'Juan': 0,
      'María': 0,
      'Pedro': 0
    };

    gastos.forEach(gasto => {
      totalPorPersona[gasto.pagador.nombre] += gasto.monto;
    });

    // 2. Calcular el total general
    const totalGeneral = Object.values(totalPorPersona).reduce((sum, val) => sum + val, 0);
    
    // 3. Calcular promedio que debe pagar cada uno
    const promedioPorPersona = totalGeneral / 3;

    // 4. Calcular balance de cada persona (positivo = le deben, negativo = debe)
    const balances: { [nombre: string]: number } = {};
    Object.keys(totalPorPersona).forEach(nombre => {
      balances[nombre] = totalPorPersona[nombre] - promedioPorPersona;
    });

    // 5. Generar lista de deudas
    const deudas: Balance[] = [];
    const acreedores = Object.entries(balances).filter(([_, balance]) => balance > 0);
    const deudores = Object.entries(balances).filter(([_, balance]) => balance < 0);

    // Algoritmo simple de compensación
    deudores.forEach(([deudor, montoDeuda]) => {
      let deudaRestante = Math.abs(montoDeuda);
      
      acreedores.forEach(([acreedor, montoAcreedor]) => {
        if (deudaRestante > 0 && montoAcreedor > 0) {
          const montoAPagar = Math.min(deudaRestante, montoAcreedor);
          
          deudas.push({
            deudor,
            acreedor,
            monto: parseFloat(montoAPagar.toFixed(2))
          });

          deudaRestante -= montoAPagar;
          acreedores[acreedores.findIndex(([n]) => n === acreedor)][1] -= montoAPagar;
        }
      });
    });

    return deudas;
  };

  return (
    <GastosContext.Provider
      value={{
        gastos,
        agregarGasto,
        eliminarGasto,
        calcularBalances,
        isLoading
      }}
    >
      {children}
    </GastosContext.Provider>
  );
};

export const useGastos = () => {
  const context = useContext(GastosContext);
  if (!context) {
    throw new Error('useGastos debe usarse dentro de GastosProvider');
  }
  return context;
};