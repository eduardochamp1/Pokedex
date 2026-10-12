import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Panes } from "../components/device/Panes";
import { useDevicePage } from "../components/device/DeviceContext";
import DexList from "../components/dex/DexList";
import DexEntry from "../components/dex/DexEntry";
import { useDebounce } from "../hooks/useDebounce";
import { useFeaturedPokemon } from "../hooks/useFeaturedPokemon";
import {
  ITEMS_PER_PAGE,
  usePokemonDetail,
  usePokemonList,
  usePokemonPage,
  usePokemonSelection,
} from "../hooks/usePokemon";
import { sortNamesAlphabetically } from "../lib/filters";
import { farStep, neighbor } from "../lib/dexNav";
import { TOTAL_SPECIES } from "../lib/daily";
import { useLang, tr } from "../i18n/lang";
import { parseHomeParams, toSearchParams, type HomeParams } from "../lib/homeParams";
import "../styles/dex.css";

/**
 * A Pokédex: lista à esquerda, ficha à direita.
 *
 * Serve `/` e `/pokemon/:nameOrId` — é a mesma tela, e o endereço só diz qual
 * ficha está aberta. Em `/`, sem seleção, a ficha mostra o pokémon do dia.
 */
const HomePage = () => {
  const [params, setParams] = useSearchParams();
  const { nameOrId } = useParams<{ nameOrId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const current = parseHomeParams(params);
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);

  /** Aplica uma mudanca parcial; qualquer criterio novo volta para a pagina 1. */
  const update = (patch: Partial<HomeParams>) => {
    const next = { ...current, ...patch };
    if (!("page" in patch)) next.page = 0;
    setParams(toSearchParams(next), { replace: true });
  };

  // Input local pra nao reescrever a URL a cada tecla; a busca debounced e que vai
  // para o parametro `q`.
  const [searchInput, setSearchInput] = useState(current.search);
  const debouncedSearch = useDebounce(searchInput.trim(), 350);

  useEffect(() => {
    if (debouncedSearch !== current.search) update({ search: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const selection = usePokemonSelection({
    search: debouncedSearch,
    type: current.type,
    generation: current.generation,
    pokedex: current.pokedex,
    rarity: current.rarity,
  });

  const orderedNames = useMemo(() => {
    if (!selection.names) return null;
    if (current.sort === "nome") return sortNamesAlphabetically(selection.names);
    // "id" ja vem ordenado por id de usePokemonSelection.
    return selection.names;
  }, [selection.names, current.sort]);

  const selected = usePokemonPage(orderedNames, current.page);
  const listQuery = usePokemonList(current.page);
  const isSelecting = selection.names !== null;

  const pokemons = isSelecting ? selected.pokemons : listQuery.data?.pokemons ?? [];
  const totalPages = isSelecting ? selected.totalPages : listQuery.data?.totalPages ?? 1;
  const isLoading = isSelecting ? selection.isLoading || selected.isLoading : listQuery.isLoading;
  const isError = isSelecting ? selection.isError || selected.isError : listQuery.isError;
  const total = isSelecting ? selected.total : undefined;

  // Sem seleção no endereço, a ficha abre no pokémon do dia.
  const featured = useFeaturedPokemon();
  const shown = nameOrId ?? featured.data?.name;
  // A mesma consulta que a ficha faz (o cache é compartilhado): daqui sai o
  // número para o rodapé e o nome canônico para marcar a linha da lista.
  const shownDetail = usePokemonDetail(shown);
  const shownName = shownDetail.data?.name ?? shown?.toLowerCase();

  const names = pokemons.map((p) => p.name);
  const go = (name: string) => navigate({ pathname: `/pokemon/${name}`, search: location.search });
  const step = (dir: 1 | -1) => {
    // A ficha aberta pode estar fora da página visível da lista (link direto
    // em /pokemon/eevee, lista na página 1): aí a seta anda a partir dela e
    // leva a lista junto, em vez de entrar pela ponta da página errada.
    if (shownName && names.length > 0 && !names.includes(shownName)) {
      const longe = farStep(
        { order: orderedNames, current: shownName, id: shownDetail.data?.id, total: TOTAL_SPECIES },
        dir,
        ITEMS_PER_PAGE
      );
      if (longe) {
        const busca = new URLSearchParams(location.search);
        if (longe.page > 0) busca.set("p", String(longe.page + 1));
        else busca.delete("p");
        return navigate({ pathname: `/pokemon/${longe.target}`, search: busca.toString() });
      }
    }
    const alvo = neighbor(names, shownName, dir);
    if (alvo) return go(alvo);
    // Ponta da página: a seta vira a página, e a próxima entra pela ponta.
    const pagina = current.page + dir;
    if (pagina >= 0 && pagina < totalPages) update({ page: pagina });
  };

  const { setPane } = useDevicePage({
    labels: [t("LISTA", "LIST"), t("FICHA", "ENTRY")],
    footer: shownDetail.data ? `NO. ${String(shownDetail.data.id).padStart(4, "0")}` : "NO. ----",
    hint: t("↑ ↓ NAVEGAR", "↑ ↓ BROWSE"),
    onUp: () => step(-1),
    onDown: () => step(1),
    onLeft: current.page > 0 ? () => update({ page: current.page - 1 }) : undefined,
    onRight: current.page + 1 < totalPages ? () => update({ page: current.page + 1 }) : undefined,
  });

  // Chegar por link direto numa ficha (`/pokemon/x`) abre a ficha no celular.
  useEffect(() => {
    if (nameOrId) setPane("right");
  }, [nameOrId, setPane]);

  return (
    <Panes
      leftLabel={t("Lista de Pokémon", "Pokémon list")}
      rightLabel={t("Ficha", "Entry")}
      left={
        <DexList
          current={current}
          update={update}
          searchInput={searchInput}
          onSearch={setSearchInput}
          pokemons={pokemons}
          total={total}
          totalPages={totalPages}
          isLoading={isLoading}
          isError={isError}
          selected={shownName}
          search={location.search}
          onPick={() => setPane("right")}
        />
      }
      right={<DexEntry nameOrId={shown} featured={!nameOrId} search={location.search} />}
    />
  );
};

export default HomePage;
