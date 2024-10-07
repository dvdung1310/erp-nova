import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Login from './pages/Login';
import Home from './pages/Home';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import AuthContext from './contexts/AuthContext';

const router = createBrowserRouter([
  {
    path: "/login",
    element: <AuthContext element={<Login />} />, 
  },
  {
    path: "/", 
    element: <AuthContext element={<Home />} />, 
  },
]);

const rootElement = document.getElementById('root');
createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router}>
      <ToastContainer />
    </RouterProvider>
  </StrictMode>
);
