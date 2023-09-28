import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  localStorage.removeItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/login");
  }, [navigate]);

  return <h1>Logout successful</h1>;
}
