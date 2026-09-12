import { Suspense, lazy, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { Route, Routes, useLocation, type Location } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import { RouteFallback } from "./components/Skeleton";
import ErrorBoundary from "./components/ErrorBoundary";
import { FavoriteProvider } from "./contexts/favoritesContext";
import { useFavorites } from "./hooks/useFavorites";
import { startTransition as startViewTransitionWrapper } from "./lib/motion";

// A Home entra no bundle inicial; o resto e carregado sob demanda — a Lore
// sozinha carrega ~2.000 linhas de dados curados.
const DetailPage = lazy(() => import("./pages/DetailPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
const LorePage = lazy(() => import("./pages/LorePage"));
const MapPage = lazy(() => import("./pages/MapPage"));
const PlayPage = lazy(() => import("./pages/PlayPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

/**
 * Segura a renderizacao da nova localizacao ate o browser ter feito o snapshot
 * do estado antigo — a receita para o View Transitions API animar de A pra B.
 */
function useAnimatedLocation(): Location {
  const location = useLocation();
  const [displayed, setDisplayed] = useState(location);
  useEffect(() => {
    if (location === displayed) return;
    startViewTransitionWrapper(() => {
      flushSync(() => setDisplayed(location));
    });
  }, [location, displayed]);
  return displayed;
}

function App() {
  const { favorites, toggle } = useFavorites();
  const displayedLocation = useAnimatedLocation();

  return (
    <FavoriteProvider
      value={{
        favoritePokemons: favorites,
        updateFavoritePokemons: toggle,
      }}
    >
      <Navbar />
      <ErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <Routes location={displayedLocation}>
            <Route path="/" element={<HomePage />} />
            <Route path="/favoritos" element={<FavoritesPage />} />
            <Route path="/comparar" element={<ComparePage />} />
            <Route path="/lore" element={<LorePage />} />
            <Route path="/mapa" element={<MapPage />} />
            <Route path="/jogar" element={<PlayPage />} />
            <Route path="/pokemon/:nameOrId" element={<DetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </FavoriteProvider>
  );
}

export default App;
