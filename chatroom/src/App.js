import "./App.css"
import React ,{useEffect, useState, useRef} from "react"
import { Icon } from 'semantic-ui-react'
import {ModalContent,Modal} from 'semantic-ui-react'
import { FormField, Button, Form } from 'semantic-ui-react'
import axios from "axios"
import io from "socket.io-client";
import ScrollToBottom from "react-scroll-to-bottom";

const socket = io.connect("http://localhost:7500");

const App=()=>{
  const [open, setOpen] = useState(false)
  const [name,setName]= useState();
  const [yourid,setYourid]=useState();
  const [otherid,setOtherid]=useState();
  const [userList, setUserList] = useState([]);
  const [selectUser,setSelectuser]=useState(null);
  const [selectAdmin,setSelectAdmin]=useState(false);
  const [showChat,setShowchat]=useState(false);
  const [currentMessage,setCurrentMessage]=useState("");
  const [messageList,setMessageList]=useState([]);
  const [room,setRoom]=useState();
  const [messageToAdmin,setMessageToAdmin]=useState("");
  const messageRef = useRef(null);
  

  const saveMessage = async () => {
    try {
      const messageData = {
        message: currentMessage,
        name: name,
        time: Date.now(),
      };
      await axios.post('http://localhost:7500/saveMessage', messageData);
      console.log('Message saved successfully');
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messageList]);

  const scrollToBottom = () => {
    if (messageRef.current) {
      messageRef.current.scrollTop = messageRef.current.scrollHeight;
    }
  };
  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        yourid: yourid,
        author: name,
        message: currentMessage,
        time: new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };
      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
      saveMessage(messageData);
    }
  };
  const sendToAdmin = async () => {
    if (messageToAdmin !== "") {
      const messageData = {
        yourid: yourid,
        author: "Admin",
        message: messageToAdmin,
        time: new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };
      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setMessageToAdmin("");
      saveMessage(messageData);
    }
  };

  useEffect(()=>{
    socket.on("receive_message",(data)=>{
      setMessageList((list)=>[...list,data]);
    });
  },[socket]);

  useEffect(()=>{
    fetch('http://localhost:7500/usershow')
    .then(response=>response.json())
    .then(userList=>{
      setUserList(userList);
    })
    .catch(error=>{
      console.log(error);
    })
    console.log(userList);
  },[]);

  const AddUser = async () => {
    if(name !=="" && room !==""){
      socket.emit("join_room",room);
      setShowchat(true);
    }
    try {
      const response = await axios.post('http://localhost:7500/adduser', {name: name,yourid: yourid,otherid: otherid});
      setUserList([...userList, response.data]);
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };
  const DeleteUser=()=>{
    axios.delete(`http://localhost:7500/removeUser/${name}`)
  }
  const updateDetail=()=>{
    axios.put(`http://localhost:7500/editUser/${name}`,{"name":name,"yourid":yourid,"otherid":otherid})
  }

  const userclick=(user)=>{
    setSelectuser(user);
    setSelectAdmin(false);
    setShowchat(true);
  }
  const Admin=()=>{
    setSelectAdmin(true);
    setSelectuser(null);
    setShowchat(true);
  }
  return(
    <div className="App">
        <div className="dashboard">
          <div className="lists">
              <header>
                <p className="para2" onClick={Admin}>Admin</p>
                <Icon name="list" className="icon"   onClick={() => setOpen(true)}/>
              </header>
              <div className="usershow">
              {userList.map(user => (
              <div key={user.id} className={`showUser ${selectUser===user ? "selected" : ""}`}
              onClick={()=>userclick(user)}
              >
                <p className="para1">{user.name}</p>
                <hr/>
              </div>
            ))}
              </div>
              <Modal
      closeIcon
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      style={{width:"500px",height:"300px"}}
    >
      <ModalContent>
                  <Form>
                    <FormField>
                      <label>User</label>
                      <input placeholder='User Name' onChange={(e)=>setName(e.target.value)} />
                    </FormField>
                    <FormField>
                      <label>Admin ID</label>
                      <input placeholder='Number' onChange={(e)=>setYourid(e.target.value)}/>
                    </FormField>
                    <FormField>
                      <label>User ID</label>
                      <input placeholder='Number' onChange={(e)=>setOtherid(e.target.value)}/>
                    </FormField> 
                    <div style={{display:'flex'}}>
                    <Button onClick={AddUser}>Add User <Icon name="add user"/></Button>
                    <Button onClick={DeleteUser}>Delete <Icon name="trash alternate"/></Button>
                    <Button onClick={updateDetail}>Edit <Icon name="pencil"/></Button>
                    </div>
              </Form>
      </ModalContent>
    </Modal>
          </div>
          {showChat && (selectUser || selectAdmin) && (
          <div className="chatArea">
            <nav className="navbar">
             <p className="para3">{selectUser ? selectUser.name : "Admin"}</p>
            </nav>
            <div className="message" ref={messageRef}>
              <ScrollToBottom className="sms-container">
                {messageList.map((MessageContent)=>{
                  const isUserMessage = MessageContent.author === name;
                  const messageClass =isUserMessage ? 'message-user':'message-admin';
                  return(
                     <div key={MessageContent.id}
                     className={`sms ${messageClass}`} 
    
                     >
                        <div>
                          <div className="sms-content">
                              <p>{MessageContent.message}</p>
                          </div>
                          <div className="sms-meta">
                            <p id="time">{MessageContent.time}</p>
                            <p id="author">{MessageContent.author}</p>
                          </div>
                        </div>
                     </div> 
                  );
                })}
              </ScrollToBottom>
            </div>
            <div className="footer">
            {selectAdmin && !selectUser ? (
                <input
                  type="text"
                  placeholder="Type something here"
                  className="inputbox"
                  value={messageToAdmin}
                  onClick={saveMessage}
                  onChange={(e) => { setMessageToAdmin(e.target.value); }}
                  onKeyPress={(e) => { e.key === "Enter" && sendToAdmin(); }}
                />
              ) : (
                <input
                  type="text"
                  placeholder="Type something here"
                  className="inputbox"
                  value={currentMessage}
                  onClick={saveMessage}
                  onChange={(e) => { setCurrentMessage(e.target.value); }}
                  onKeyPress={(e) => { e.key === "Enter" && sendMessage(); }}
                />
              )}

              {selectAdmin && !selectUser ? (
                <button onClick={sendToAdmin}><Icon name="send" />A</button>
              ) : (
                <button onClick={sendMessage}><Icon name="send" />U</button>
              )}
            </div>
          </div>
          )}
        </div>
    </div>
  )
}

export default App;
