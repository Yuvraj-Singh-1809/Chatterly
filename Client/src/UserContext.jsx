import React, { useEffect, useState } from "react";
import { createContext } from "react";
import axios from "axios";

export const UserContext = createContext({});

export function UserContextProvider({children}){
    const[loggedUsername,setLoggedUsername]= useState(null);
    const[id,setId] = useState(null);
    useEffect(()=>{
        axios.get("/profile").then(response => {
        setId(response.data.userId);
        setLoggedUsername(response.data.username);
        });
    },[]);
    return(
        <UserContext.Provider value={{loggedUsername,setLoggedUsername,id,setId}}>
            {children}
        </UserContext.Provider>
    );
}