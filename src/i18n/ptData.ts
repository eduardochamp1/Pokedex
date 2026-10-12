/**
 * O que a PokéAPI não tem em português, traduzido aqui.
 *
 * A PokéAPI não traz pt-BR para o texto da Pokédex, para as habilidades nem
 * para os golpes, e o site caía no inglês no meio de uma tela em português.
 * Os três conjuntos foram traduzidos e moram em `src/data/pt/*.json`:
 *
 * - `flavor.json`    — o texto da Pokédex de cada espécie (id → texto), a
 *                      partir da entrada em inglês do jogo mais recente
 * - `abilities.json` — nome, resumo e efeito completo (slug → …)
 * - `moves.json`     — nome de cada golpe (slug → nome)
 * - `move-desc.json` — descrição de cada golpe (slug → texto)
 *
 * Não são traduções oficiais: os jogos nunca saíram em português. Por isso o
 * nome original em inglês de golpes e habilidades continua à vista ao lado do
 * traduzido — é por ele que quem joga os conhece, e é ele que aparece nos
 * textos de efeito.
 *
 * Cada arquivo é um pedaço separado do bundle, baixado só quando o idioma é
 * português: quem usa o site em inglês não paga por eles.
 */
import { useQuery } from "@tanstack/react-query";
import { useLang } from "./lang";

export interface AbilityPt {
  name: string;
  short: string;
  /** Ausente quando o texto longo é igual ao resumo. */
  effect?: string;
}

type Mapa<T> = Record<string, T>;

function usePt<T>(chave: string, carregar: () => Promise<Mapa<T>>, ativo = true): Mapa<T> | undefined {
  const lang = useLang();
  const { data } = useQuery({
    queryKey: ["pt-data", chave],
    queryFn: carregar,
    enabled: lang === "pt" && ativo,
    staleTime: Infinity,
    gcTime: Infinity,
  });
  // Em inglês, nada: mesmo que o arquivo já esteja em cache de uma visita em
  // português, o texto traduzido não pode vazar para a tela em inglês.
  return lang === "pt" ? data : undefined;
}

/** id da espécie → texto da Pokédex. */
export const usePtFlavor = () =>
  usePt<string>("flavor", () => import("../data/pt/flavor.json").then((m) => m.default as Mapa<string>));

/** slug da habilidade → nome, resumo e efeito. */
export const usePtAbilities = () =>
  usePt<AbilityPt>("abilities", () => import("../data/pt/abilities.json").then((m) => m.default as Mapa<AbilityPt>));

/** slug do golpe → nome. */
export const usePtMoves = () =>
  usePt<string>("moves", () => import("../data/pt/moves.json").then((m) => m.default as Mapa<string>));

/**
 * slug do golpe → descrição. Só baixa quando `ativo`: a descrição aparece ao
 * abrir um golpe da lista, e não vale carregar 110 kB antes disso.
 */
export const usePtMoveDesc = (ativo: boolean) =>
  usePt<string>("move-desc", () => import("../data/pt/move-desc.json").then((m) => m.default as Mapa<string>), ativo);
