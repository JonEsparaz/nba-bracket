import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBdMOvSozKiqJX1wFv5y3liLo0DUMzU9g8",
  authDomain: "esparaz-nba-bracket.firebaseapp.com",
  databaseURL: "https://esparaz-nba-bracket.firebaseio.com",
  projectId: "esparaz-nba-bracket",
  storageBucket: "esparaz-nba-bracket.appspot.com",
  messagingSenderId: "767068867677",
  appId: "1:767068867677:web:304fdd82019d79c40b51b4",
};

firebase.initializeApp(firebaseConfig);
export default firebase;
