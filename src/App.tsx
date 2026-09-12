import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import { RouteFallback } from "./components/Skeleton";
import ErrorBoundary from "./components/ErrorBoundary";
import ComparatorButton from "./components/ComparatorButton";
import { FavoriteProvider } from "./contexts/favoritesContext";
import { useFavorites } from "./hooks/useFavorites";

// A Home entra no bundle inicial; o resto e carregado sob demanda — a Lore
// sozinha carrega ~2.000 linhas de dados curados.
const DetailPage = lazy(() => import("./pages/DetailPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
const LorePage = lazy(() => import("./pages/LorePage"));
const MapPage = lazy(() => import("./pages/MapPage"));
const PlayPage = lazy(() => import("./pages/PlayPage"));
const SizesPage = lazy(() => import("./pages/SizesPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function App() {
  const { favorites, toggle } = useFavorites();

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
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/favoritos" element={<FavoritesPage />} />
            <Route path="/comparar" element={<ComparePage />} />
            <Route path="/lore" element={<LorePage />} />
            <Route path="/mapa" element={<MapPage />} />
            <Route path="/jogar" element={<PlayPage />} />
            <Route path="/tamanhos" element={<SizesPage />} />
            <Route path="/pokemon/:nameOrId" element={<DetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      <ComparatorButton />
    </FavoriteProvider>
  );
}

export default App;
