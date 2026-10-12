import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Device from "./components/device/Device";
import { SinglePane } from "./components/device/Panes";
import CommandLauncher from "./components/CommandLauncher";
import { OfflineBanner } from "./components/AppStatus";
import { useT } from "./i18n/lang";
import HomePage from "./pages/HomePage";
import { RouteFallback } from "./components/Skeleton";
import ErrorBoundary from "./components/ErrorBoundary";
import { FavoriteProvider } from "./contexts/favoritesContext";
import { useFavorites } from "./hooks/useFavorites";

// A Home entra no bundle inicial; o resto e carregado sob demanda — a Lore
// sozinha carrega ~2.000 linhas de dados curados.
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
const LorePage = lazy(() => import("./pages/LorePage"));
const MapPage = lazy(() => import("./pages/MapPage"));
const SizesPage = lazy(() => import("./pages/SizesPage"));
const EvolutionsPage = lazy(() => import("./pages/EvolutionsPage"));
const GamesPage = lazy(() => import("./pages/GamesPage"));
const DataPage = lazy(() => import("./pages/DataPage"));
const TeamBuilderPage = lazy(() => import("./pages/TeamBuilderPage"));
const AbilityPage = lazy(() => import("./pages/AbilityPage"));
const QuizPage = lazy(() => import("./pages/QuizPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function App() {
  const { favorites, toggle } = useFavorites();
  // Ler o idioma aqui, na raiz, faz a árvore inteira re-renderizar na troca —
  // inclusive quem só usa pickLocalized e não chama useT.
  const t = useT();

  return (
    <FavoriteProvider
      value={{
        favoritePokemons: favorites,
        updateFavoritePokemons: toggle,
      }}
    >
      {/* Primeiro foco tabulável da página: sem ele, quem navega por teclado
          passa pelos 7 links do menu em toda troca de rota. */}
      <a className="skip-link" href="#conteudo">
        {t("Pular para o conteúdo", "Skip to content")}
      </a>
      <CommandLauncher />
      <OfflineBanner />
      {/* O <main> do site mora dentro do aparelho (ver Device). Página que ainda
          não se dividiu em dois painéis entra numa tela só. */}
      <Device>
      <ErrorBoundary>
        <Suspense fallback={<SinglePane><RouteFallback /></SinglePane>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/favoritos" element={<FavoritesPage />} />
            <Route path="/comparar" element={<ComparePage />} />
            <Route path="/lore" element={<LorePage />} />
            <Route path="/mapa" element={<MapPage />} />
            <Route path="/tamanhos" element={<SizesPage />} />
            <Route path="/evolucoes" element={<SinglePane><EvolutionsPage /></SinglePane>} />
            <Route path="/jogos" element={<SinglePane><GamesPage /></SinglePane>} />
            <Route path="/dados" element={<SinglePane><DataPage /></SinglePane>} />
            <Route path="/time" element={<TeamBuilderPage />} />
            <Route path="/habilidade/:slug" element={<SinglePane><AbilityPage /></SinglePane>} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/pokemon/:nameOrId" element={<HomePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      </Device>
    </FavoriteProvider>
  );
}

export default App;
