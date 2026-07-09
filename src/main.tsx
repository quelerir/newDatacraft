import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AssistantsPage } from './pages/AssistantsPage';
import { AiChatPage } from './pages/AiChatPage';
import { AgentsPage } from './pages/AgentsPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { ExtrasPage, ShowcasesPage, SourceShowcasesPage, SourcesPage, StreamsPage } from './pages/SourcesCatalogPages';
import '@assistant-ui/react-ui/styles/index.css';
import './styles/global.css';

const queryClient = new QueryClient();

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/superset/welcome" element={<DashboardPage />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/assistants" element={<AssistantsPage />} />
        <Route path="/ai-chat" element={<AiChatPage />} />
        <Route path="/sources" element={<SourcesPage />} />
        <Route path="/showcases" element={<ShowcasesPage />} />
        <Route path="/source-showcases" element={<SourceShowcasesPage />} />
        <Route path="/streams" element={<StreamsPage />} />
        <Route path="/extras" element={<ExtrasPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/superset/welcome" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  </React.StrictMode>,
);
