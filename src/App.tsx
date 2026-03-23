import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthPage from "./pages/AuthPage";
import AppLayout from "./components/AppLayout";
import GenerationPage from "./pages/GenerationPage";
import GalleryPage from "./pages/GalleryPage";
import HistoryPage from "./pages/HistoryPage";
import PromptLibraryPage from "./pages/PromptLibraryPage";
import StatsPage from "./pages/StatsPage";
import TeamPage from "./pages/TeamPage";
import ApiKeysPage from "./pages/ApiKeysPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<GenerationPage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="prompts" element={<PromptLibraryPage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="api-keys" element={<ApiKeysPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
