import { useContext } from "react";
import { UserContext } from "./UserContext";
import RegisterAndLoginForm from "./RegisterAndLoginForm";
import Chat from "./Chat";

export default function Router(){
const { loggedUsername, id } = useContext(UserContext);
if(loggedUsername)
{
  return <Chat />
}

  return <RegisterAndLoginForm />;
}