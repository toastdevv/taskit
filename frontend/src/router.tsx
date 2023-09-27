import { createBrowserRouter } from "react-router-dom";
import Login from "./pages/login";
import SignUp from "./pages/signup";
import Index from "./pages/index";
import Logout from "./pages/logout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/logout",
    element: <Logout />,
  },
]);

export default router;
