/**
 * Registro de conectores. Para acrescentar uma nova base governamental:
 * 1. crie um arquivo em conectores/ que implemente a interface Conector;
 * 2. inclua-o na lista abaixo;
 * 3. associe os requisitos do catálogo (dominio/requisitos.ts) que ele verifica.
 */
import { conectorCGU } from "./cgu";
import {
  conectorBcb,
  conectorCadin,
  conectorCnd,
  conectorCndt,
  conectorCnpj,
  conectorCrf,
  conectorSicaf,
  conectorTcu,
} from "./sem-consulta-automatica";
import type { Conector } from "./tipos";

export const CONECTORES: Conector[] = [
  conectorCnpj,
  conectorCnd,
  conectorCrf,
  conectorCndt,
  conectorCGU,
  conectorTcu,
  conectorCadin,
  conectorSicaf,
  conectorBcb,
];

export function conectorDoRequisito(requisitoId: string): Conector | undefined {
  return CONECTORES.find((c) => c.info.requisitos.includes(requisitoId));
}
