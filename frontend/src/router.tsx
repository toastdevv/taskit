import { createBrowserRouter } from "react-router-dom";
import Index from "./pages/index";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
]);

export default router;
