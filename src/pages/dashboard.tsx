import { AuthContext } from "@/contexts/AuthContext";
import { useContext } from "react";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  return <h1>Hello world: {user?.email}</h1>;
}
