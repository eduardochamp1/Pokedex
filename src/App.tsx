import { Route, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import DetailPage from "./pages/DetailPage";
import FavoritesPage from "./pages/FavoritesPage";
import ComparePage from "./pages/ComparePage";
import LorePage from "./pages/LorePage";
import { FavoriteProvider } from "./contexts/favoritesContext";
import { useFavorites } from "./hooks/useFavorites";

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
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/favoritos" element={<FavoritesPage />} />
        <Route path="/comparar" element={<ComparePage />} />
        <Route path="/lore" element={<LorePage />} />
        <Route path="/pokemon/:nameOrId" element={<DetailPage />} />
      </Routes>
    </FavoriteProvider>
  );
}

export default App;
