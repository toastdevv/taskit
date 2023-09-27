import { useNavigate } from "react-router-dom";

export default function Logout() {
  localStorage.removeItem("token");
  const navigate = useNavigate();
  navigate("/login");
  return <h1>Logout successful</h1>;
}
