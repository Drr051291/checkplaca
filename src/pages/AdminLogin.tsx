import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to new auth page
    navigate("/auth");
  }, [navigate]);

  return null;
};

export default AdminLogin;
