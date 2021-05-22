import React, { useState, useEffect } from 'react';
import './App.css';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from './firebase';
import Picks from './Picks';

const uiConfig = {
  signInFlow: 'popup',
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  ],
  callbacks: {
    signInSuccessWithAuthResult: () => false,
  },
};

function App() {

  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => setSignedIn(!!user))
    return () => unregisterAuthObserver();
  });

  if (!signedIn)
    return (
      <div style={{ textAlign: 'center' }}>
        <h1>Esparaz NBA Playoff Bracket 2021 <span role="img" aria-labelledby="basketball">🏀</span></h1>
        <div>Rules:</div>
        <ul className="Rules" >
          <li className="rule1" style={{ height: 24 }}>No cheating</li>
          <li className="rule2" style={{ height: 24 }}>You must pick the Raptors</li>
          <li className="rule3" style={{ height: 24 }}>Winner buys ice cream <span role="img" aria-labelledby="ice cream">🍦</span></li>
          <li className="rule4" style={{ height: 24 }}>Have fun <span role="img" aria-labelledby="party">🎉</span></li>
          <li className="rule5" style={{ height: 24 }}>No crying <span role="img" aria-labelledby="no crying">❌😢</span></li>
        </ul>
        <StyledFirebaseAuth
          uiConfig={uiConfig}
          firebaseAuth={firebase.auth()}
        />
      </div>
    );

  return (
    <Picks />
  )
}

export default App;