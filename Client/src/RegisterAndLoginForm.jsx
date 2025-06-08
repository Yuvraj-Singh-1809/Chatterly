import { useState ,useContext} from "react";
import axios from "axios";
import { UserContext } from "./UserContext";

export default function RegisterAndLoginForm(){
   const[username,setusername]=useState('');
   const[password,setpassword]=useState(''); 
   const[isLoginOrRegister,setIsLoginOrRegister]=useState("Login");
   const {setLoggedUsername,setId}=useContext(UserContext)
   async function handleSubmit(e){ 
      e.preventDefault();
      const url=isLoginOrRegister==="register" ? "register":"login";  
  const{data}=await axios.post(url,{username,password});
  setLoggedUsername(username);
  setId(data.id);
   }
return(
    <div className="bg-blue-50 h-screen flex items-center">
        <form className="w-64 mx-auto" onSubmit={handleSubmit}>
            <input value={username} 
            onChange={e=>setusername(e.target.value)} 
            type="text" placeholder="username" 
            className="bg-white block w-full rounded-sm p-2 mb-2 border border-gray-200 focus:outline-blue-400"/>

            <input value={password} 
            onChange={e=>setpassword(e.target.value)}
             type="password" placeholder="password" 
             className="bg-white block w-full rounded-sm p-2 mb-2 border border-gray-200 focus:outline-blue-400 "/>

            <button type="submit" className="bg-blue-500 text-white block w-full rounded-sm p-2 cursor-pointer">
                {isLoginOrRegister==="register" ? "Register" : "Login"}
            </button>
            <div className="text-center mt-2">
                {isLoginOrRegister==="register"&&(
                    <div>
                   Already a member? <button className="text-blue-500 border-b cursor-pointer" onClick={()=>setIsLoginOrRegister("Login")}>
                    Login here
                    </button>
                    </div>
                )}
                {isLoginOrRegister==="Login"&&(
                    <div>
                   Dont have an account ? <button className="text-blue-500 border-b cursor-pointer" onClick={()=>setIsLoginOrRegister("register")}>
                    Register
                    </button>
                    </div>
                )}

            </div>
        </form>
    </div>
);
}