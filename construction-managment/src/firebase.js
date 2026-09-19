import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC_X6_bZotPr-fdoo6VGudZorFeVKeVsig",
  authDomain: "akbar-ali-co.firebaseapp.com",
  projectId: "akbar-ali-co",
  storageBucket: "akbar-ali-co.appspot.com",
  messagingSenderId: "431323674226",
  appId: "1:431323674226:web:e950759340011bfa05b4eb",
  measurementId: "G-8TG5MWBVSS"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);