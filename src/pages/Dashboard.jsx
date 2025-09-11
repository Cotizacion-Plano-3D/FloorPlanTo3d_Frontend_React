import { useEffect, useState } from "react";
import { fetchDashboard } from "../api/dashboard";

const Dashboard = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchDashboard();
        setMessage(data.message);
      } catch (error) {
        setMessage("No autorizado");
      }
    };

    getData();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>{message}</p>
    </div>
  );
};

export default Dashboard;
