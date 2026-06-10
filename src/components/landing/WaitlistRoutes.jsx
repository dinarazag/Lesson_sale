import { Navigate, Route, Routes } from 'react-router-dom';
import { pagesConfig } from '@/pages.config';
import Landing from '@/pages/Landing';
import Privacy from '@/pages/Privacy';
import Layout from '@/Layout';

const { Layout: AppLayout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? 'Landing';
const LayoutWrapper = AppLayout || Layout;

export default function WaitlistRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <LayoutWrapper currentPageName={mainPageKey}>
            <Landing />
          </LayoutWrapper>
        }
      />
      <Route
        path="/Privacy"
        element={
          <LayoutWrapper currentPageName="Privacy">
            <Privacy />
          </LayoutWrapper>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
