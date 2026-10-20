import { useGetList, useGetOne, Identifier } from "react-admin";
import { evaluarMedicion, Evaluacion, Sexo } from "../utils/nutricion.js";

/**
 * ? Datos de crecimiento de un infante: el infante, sus mediciones
 * (de la más antigua a la más reciente) y la evaluación CDC de cada una.
 *
 * El servidor ya filtra por rol: un tutor solo recibe a sus hijos, el
 * personal solo los de su estancia, etc.
 */
export interface Infante {
  id: Identifier;
  nombre: string;
  apellidos: string;
  fechaNacimiento: string;
  sexo: Sexo;
  expediente: string;
  estanciaId: number;
  tutorId: number;
}

export interface Medicion {
  id: Identifier;
  infanteId: number;
  fecha: string;
  peso: number;
  talla: number;
  perimetroCefalico: number;
}

export interface MedicionEvaluada extends Medicion {
  evaluacion: Evaluacion;
}

export const useCrecimiento = (infanteId?: Identifier | null) => {
  const activo =
    infanteId !== undefined && infanteId !== null && infanteId !== "";
  const { data: infante, isPending: cargandoInfante } = useGetOne<Infante>(
    "infantes",
    { id: infanteId as Identifier },
    { enabled: activo },
  );
  const { data: mediciones = [], isPending: cargandoMediciones } =
    useGetList<Medicion>(
      "mediciones",
      {
        filter: { infanteId },
        sort: { field: "fecha", order: "ASC" },
        pagination: { page: 1, perPage: 200 },
      },
      { enabled: activo },
    );

  const evaluadas: MedicionEvaluada[] = infante
    ? mediciones.map((m) => ({ ...m, evaluacion: evaluarMedicion(infante, m) }))
    : [];

  return {
    infante,
    mediciones: evaluadas,
    ultima: evaluadas.at(-1),
    cargando: activo && (cargandoInfante || cargandoMediciones),
  };
};
