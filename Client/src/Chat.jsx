import { useContext, useRef, useState } from "react";
import { useEffect } from "react";
import Avatar from "./Avatar";
import Logo from "./Logo";
import { UserContext } from "./UserContext";
import {uniqBy} from "lodash";
import axios from "axios";
import Contacts from "./Contacts";

export default function Chat(){
    const[ws,setWs]=useState(null);
    const[onlinePeople,setOnlinePeople]=useState({});
    const[offlinePeople,setOfflinePeople]=useState({});
    const[selectedUserId,setSelectedUserId]=useState(null);
    const{loggedUsername,id,setId,setLoggedUsername}=useContext(UserContext);
    const[newMessageText,setNewMessageText]=useState("");
    const[messages,setMessages]=useState([]);
    const lastMessageRef=useRef(null);
    const [allPeople, setAllPeople] = useState([]);    
    useEffect(()=>{
     connectToWs();
    },[]);

     function connectToWs(){
      const ws=  new WebSocket("wss://chatterly-yt36.onrender.com");
      setWs(ws);
      ws.addEventListener("message",handleMessage);
      ws.addEventListener("close",()=>{
        setTimeout(()=>{
            console.log("Disconnected. Trying to reconnect.");
            connectToWs();
        },1000);
    });
     } 

    function showOnlinePeople(peopleArray){
     const people={}
     peopleArray.forEach(({userId,username}) => {
        people[userId]=username;
     });
     setOnlinePeople(people);
    }
    function handleMessage(e){
        const messageData=JSON.parse(e.data);
        console.log({e,messageData});
        
        if("online" in messageData){
            showOnlinePeople(messageData.online);
        }
      else if ("text" in messageData || "file" in messageData) {
    const isMine = messageData.recipient === id || messageData.sender === id;
    if (isMine) {
      setMessages(prev => [...prev, messageData]);
    }
  }
    }

    function logout (){
     axios.post("/logout").then(() => {
     setWs(null);   
     setId(null);
     setLoggedUsername(null);
     });
    }

    function sendMessage(e,file=null){
        if(e) e.preventDefault();
        ws.send(JSON.stringify({
             recipient: selectedUserId,
             text: newMessageText,
             file,
        }));
        if(file) {
        axios.get("/messages/"+selectedUserId).then(res => {
        setMessages(res.data);
       });
        }
        else {
            setNewMessageText("");
            setMessages(prev => ([...prev,{text: newMessageText,
            isOur:true,
            _id: Date.now() + Math.random(),
            sender:id,
            recipient:selectedUserId
        }]));
        }
    }

    function sendFile(e){
    const reader =new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
        sendMessage(null,{
            name: e.target.files[0].name,
            data: reader.result,
        });
    };
    }

   useEffect(()=>{
    const lastMessage=lastMessageRef.current;
    if(lastMessage){
        lastMessage.scrollIntoView({behavior: "smooth"});
    }
   },[messages]);

   useEffect(() => {
  axios.get("/people").then((res) => {
    setAllPeople(res.data);
    const offlinePeopleArr = allPeople.filter(p => 
  p._id !== id && !onlinePeople[p._id]
);
  const offlinePeople ={};
  offlinePeopleArr.forEach(p => {
  offlinePeople[p._id] = p;
  });
  setOfflinePeople(offlinePeople);
  });
   },[onlinePeople]);

   useEffect(()=>{
    if(selectedUserId){
       axios.get("/messages/"+selectedUserId).then(res => {
        setMessages(res.data);
       });
    }
   },[selectedUserId])

    const onlinePeopleExcludingUser= {...onlinePeople};
    delete onlinePeopleExcludingUser[id];

    const messagesWithoutDupes = uniqBy(messages,"_id");
    

    return(
        
        <div className="flex h-screen">
            <div className="bg-white w-1/3 flex flex-col ">
            <div className="flex-grow">
                <Logo/>
            {Object.keys(onlinePeopleExcludingUser).map(userId=>(
                <Contacts
                key={userId}
                id={userId}
                online={true}
                username={onlinePeopleExcludingUser[userId]}
                onClick={() =>setSelectedUserId(userId)}
                selected={userId===selectedUserId} />
            ))}
             {Object.keys(offlinePeople).map(userId=>(
                <Contacts
                key={userId}
                id={userId}
                online={false}
                username={offlinePeople[userId].username}
                onClick={() =>setSelectedUserId(userId)}
                selected={userId===selectedUserId} />
            ))}
            </div>
            <div className="p-2 text-center flex items-center justify-center">
                <span className="mr-2 text-md text-gray-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                    </svg>
                     {loggedUsername}
                </span>
                <button 
                onClick={logout}
                className="text-md bg-blue-100 py-1 px-2 text-gray-500 border rounded-sm cursor-pointer hover:bg-blue-200">logout
                </button>
            </div>
            </div>
            <div className="flex flex-col bg-blue-50 w-2/3 p-2">
            <div className="flex-grow">
                {!selectedUserId && (
                    <div className="flex h-full flex-grow items-center justify-center">
                        <div className="text-gray-300">&larr; Selected a person to chat with</div>
                    </div>
                )}
             {selectedUserId &&(
                <div className="relative h-full">
                     <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                    {messagesWithoutDupes.map((message,index) => (
                        <div key={index} className={(message.sender===id ? "text-right":"text-left")}>
                             <div 
                        className={"text-left inline-block p-2 my-2 rounded-md text-sm "+(message.sender===id ? "bg-blue-500 text-white" : "bg-white text-gray-500")}>
                            {message.text}  
                            {message.file && (
                                <div >
                                    <a target="_blank" className="flex items-center gap-1 border-b" href={axios.defaults.baseURL + "/uploads/" +message.file}>
                                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                                    <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z" clipRule="evenodd" />
                                    </svg>
                                    {message.file}
                                    </a>
                                </div>
                            )}  
                        </div>
                        </div>  
                    ))}
                   <div ref={lastMessageRef}/>
                </div>
                </div>
               
             )}
            </div>
            {selectedUserId &&(
                  <form className="flex gap-2" onSubmit={sendMessage}>
                <input type="text" 
                value={newMessageText}
                onChange={e=>setNewMessageText(e.target.value)}
                placeholder="Type your message here" 
                className="bg-white flex-grow border rounded-sm p-2" />
                <label  className="bg-blue-200 p-2 rounded-sm text-gray-600 cursor-pointer border border-blue-200 hover:bg-blue-300">
                    <input type="file" className="hidden" onChange={sendFile} />
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z" clipRule="evenodd" />
                    </svg>
                </label>
                <button type="submit" onClick={sendMessage} className="bg-blue-500 p-2 text-white rounded-sm cursor-pointer hover:bg-blue-600"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                   </svg>
                </button>
            </form>
            )}
          
            </div>  
        </div>
    );
}