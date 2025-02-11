import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Login from './pages/Login';
import Home from './pages/Home';
import CreateExam from './pages/Exams/CreateExam';
import ListExam from './pages/exams/ListExam';
import AddQuestion from './pages/exams/AddQuestion';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import AuthContext from './contexts/AuthContext';

const router = createBrowserRouter([
  {
    path: "/create-exam",
    element: <CreateExam />,
  },
  {
    path: "/add-question",
    element: <AddQuestion />,
  },
  {
    path: "/list-exam",
    element: <ListExam />,
  },
  {
    path: "/", 
    element: <AuthContext element={<Home />} />, 
  },
  {
    path: "/login",
    element: <AuthContext element={<Login />} />, 
  },
]);

const rootElement = document.getElementById('root');
createRoot(rootElement).render(
  <StrictMode>
     <ToastContainer />
     <RouterProvider router={router} />
  </StrictMode>
);
