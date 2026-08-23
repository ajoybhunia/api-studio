import { useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { RequestPage } from "@/pages/request/RequestPage";
import { CollectionPage } from "@/pages/collection/CollectionPage";
import { EnvironmentPage } from "@/pages/environment/EnvironmentPage";
import { SettingsPage } from "@/pages/settings/SettingsPage";
import { useThemeStore } from "@/stores/themeStore";

function App() {
  const initTheme = useThemeStore((s) => s.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="request/:id" element={<RequestPage />} />
          <Route path="collections" element={<CollectionPage />} />
          <Route path="collections/:id" element={<CollectionPage />} />
          <Route path="environments" element={<EnvironmentPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<DashboardPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
