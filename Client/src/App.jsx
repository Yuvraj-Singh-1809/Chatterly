import Routes from "./Routes";
import axios from "axios";
import {  UserContextProvider } from "./UserContext";

function App() {
axios.defaults.baseURL="https://chatterly-yt36.onrender.com";
axios.defaults.withCredentials= true;
  return (
    <UserContextProvider>
       <Routes/>
    </UserContextProvider>
  
  )
}

export default App
