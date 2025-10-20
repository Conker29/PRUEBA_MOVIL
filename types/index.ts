// types/index.ts

export interface Participante {
  id: number;
  nombre: string;
}

export interface Gasto {
  id: string;
  descripcion: string;
  monto: number;
  pagador: Participante;
  participantes: Participante[];
  fotoUri: string;
  fecha: string;
}

export interface Balance {
  deudor: string;
  acreedor: string;
  monto: number;
}

export interface GastosContextType {
  gastos: Gasto[];
  agregarGasto: (gasto: Omit<Gasto, 'id' | 'fecha'>) => Promise<void>;
  eliminarGasto: (id: string) => Promise<void>;
  calcularBalances: () => Balance[];
  isLoading: boolean;
}

// Constantes
export const PARTICIPANTES: Participante[] = [
  { id: 1, nombre: 'Juan' },
  { id: 2, nombre: 'María' },
  { id: 3, nombre: 'Pedro' }
];