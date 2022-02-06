import React, { useEffect, useRef, useState } from 'react';
import './App.css';
//import firebase from 'firebase/app';
//import 'firebase/firestore';
//import 'firebase/auth';

// v9 compat packages are API compatible with v8 code
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Import hooks
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';


// Call firebase initialize app to identify the project
firebase.initializeApp({
  apiKey: "AIzaSyCKkI1zVBlMdFrF7ZOtbHbqICSoVRuyRnA",
    authDomain: "guttachatapp.firebaseapp.com",
    projectId: "guttachatapp",
    storageBucket: "guttachatapp.appspot.com",
    messagingSenderId: "312889231179",
    appId: "1:312889231179:web:a59f35b1b7e60c5fb04ace"
});

//
const auth = firebase.auth();
const firestore = firebase.firestore();




function App() {

  // Check if user is logged in or not
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Gutta Chat app</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn/>}
      </section>

    </div>
  );
}

// Sign in button that appears when user not logged in
function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <button onClick={signInWithGoogle}>Sign in with Google, my guy!</button>
  )
}

// Sign out button
function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

// Function for chatroom
function ChatRoom() {

  const dummy = useRef()

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  // Listen to data with a hook
  const [messages] = useCollectionData(query, {idField: 'id'});

  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');

    dummy.current.scrollIntoView({ behavior: 'smooth' }); // Scrolling smooth to the bottom of the messages

  }

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

        <div ref={dummy}></div>

      </main>

      <form onSubmit={sendMessage}>
        
        <input value={formValue}onChange={(e) => setFormValue(e.target.value)}/>
        
        <button type='submit'>Send message</button>

      </form>

    </>
  )


}

// Funciton for chat messages
function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  </>)
}



export default App;
