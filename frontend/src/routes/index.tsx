import { createBrowserRouter, type RouteObject, Navigate } from 'react-router-dom';
import App from '../App';
import { Login } from '../pages/Login';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Dashboard } from '../pages/Dashboard';
import { Upload } from '../pages/Upload';
import { Candidates } from '../pages/Candidates';
import { CandidateDetail } from '../pages/CandidateDetail';
import { Shortlist } from '../pages/Shortlist';
import { Reports } from '../pages/Reports';
import { Metrics } from '../pages/Metrics';
import { Settings } from '../pages/Settings';

const routes: RouteObject[] = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <App />,
    children: [
      {
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          {
            path: 'upload',
            element: <Upload />,
          },
          {
            path: 'candidates',
            element: <Candidates />,
          },
          {
            path: 'candidates/:id',
            element: <CandidateDetail />,
          },
          {
            path: 'shortlist',
            element: <Shortlist />,
          },
          {
            path: 'reports',
            element: <Reports />,
          },
          {
            path: 'metrics',
            element: <Metrics />,
          },
          {
            path: 'settings',
            element: <Settings />,
          },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
