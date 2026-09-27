import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import CommandLauncher from "./components/CommandLauncher";
import { OfflineBanner } from "./components/AppStatus";
import { useT } from "./i18n/lang";
import HomePage from "./pages/HomePage";
import { RouteFallback } from "./components/Skeleton";
import ErrorBoundary from "./components/ErrorBoundary";
import ComparatorButton from "./components/ComparatorButton";
import { FavoriteProvider } from "./contexts/favoritesContext";
import { useFavorites } from "./hooks/useFavorites";
import { DetailPage } from "./pages/routeModules";

// A Home entra no bundle inicial; o resto e carregado sob demanda — a Lore
// sozinha carrega ~2.000 linhas de dados curados.
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
const LorePage = lazy(() => import("./pages/LorePage"));
const MapPage = lazy(() => import("./pages/MapPage"));
const PlayPage = lazy(() => import("./pages/PlayPage"));
const SizesPage = lazy(() => import("./pages/SizesPage"));
const TrainerPage = lazy(() => import("./pages/TrainerPage"));
const SaveComparePage = lazy(() => import("./pages/SaveComparePage"));
const DamagePage = lazy(() => import("./pages/DamagePage"));
const GymsPage = lazy(() => import("./pages/GymsPage"));
const EvolutionsPage = lazy(() => import("./pages/EvolutionsPage"));
const GamesPage = lazy(() => import("./pages/GamesPage"));
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
      <Navbar />
      <CommandLauncher />
      <OfflineBanner />
      {/* tabIndex -1 para o link acima conseguir mover o foco para cá; o
          leitor de tela anuncia a região ao chegar. */}
      <div id="conteudo" tabIndex={-1}>
      <ErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/favoritos" element={<FavoritesPage />} />
            <Route path="/comparar" element={<ComparePage />} />
            <Route path="/lore" element={<LorePage />} />
            <Route path="/mapa" element={<MapPage />} />
            <Route path="/jogar" element={<PlayPage />} />
            <Route path="/tamanhos" element={<SizesPage />} />
            <Route path="/treinador" element={<TrainerPage />} />
            <Route path="/treinador/comparar" element={<SaveComparePage />} />
            <Route path="/dano" element={<DamagePage />} />
            <Route path="/ginasios" element={<GymsPage />} />
            <Route path="/evolucoes" element={<EvolutionsPage />} />
            <Route path="/jogos" element={<GamesPage />} />
            <Route path="/time" element={<TeamBuilderPage />} />
            <Route path="/habilidade/:slug" element={<AbilityPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/pokemon/:nameOrId" element={<DetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      </div>
      <ComparatorButton />
    </FavoriteProvider>
  );
}

export default App;
