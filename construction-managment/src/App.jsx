import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";

export default function App() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [designation, setDesignation] = useState("Employee");

  // Firebase se users load karne ke liye
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (usersList.length > 0) {
          setUsers(usersList);
        } else {
          // Sirf Akbar Ali ko default user rakh diya gaya hai
          const defaultUsers = [
            { id: "2", fullName: "Akbar Ali", password: "123", designation: "CEO", email: "akbar@gmail.com", phone: "03111111111" }
          ];
          for (let def of defaultUsers) {
            await setDoc(doc(db, "users", def.id), def);
          }
          setUsers(defaultUsers);
        }
      } catch (error) {
        console.error("Error fetching users from Firebase: ", error);
      }
    };

    fetchUsers();
  }, []);

  // Naya account register karne ya login karne ka handler
  const handleAuth = async (e) => {
    e.preventDefault();
    if (isLogin) {
      // Login check
      const found = users.find(u => u.fullName.toLowerCase() === fullName.toLowerCase() && u.password === password);
      if (found) {
        setCurrentUser(found);
        alert("Login successful!");
      } else {
        alert("Invalid credentials!");
      }
    } else {
      // Signup (Naya account banana)
      if (!fullName || !password || !phone) {
        alert("Please fill all required fields!");
        return;
      }
      const newUserId = Date.now().toString();
      const newUser = { id: newUserId, fullName, password, email, phone, designation };
      
      try {
        await setDoc(doc(db, "users", newUserId), newUser);
        setUsers([...users, newUser]);
        setCurrentUser(newUser);
        alert("Account created successfully on Cloud!");
      } catch (error) {
        console.error("Error saving user to Firebase: ", error);
        alert("Error creating account.");
      }
    }
  };

  if (currentUser) {
    return (
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h1>Welcome, {currentUser.fullName} ({currentUser.designation})</h1>
        <p>Email: {currentUser.email}</p>
        <p>Phone: {currentUser.phone}</p>
        <button 
          onClick={() => setCurrentUser(null)}
          style={{ padding: "10px 20px", background: "red", color: "white", border: "none", cursor: "pointer" }}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "Arial, sans-serif", background: "#f4f4f9" }}>
      <form onSubmit={handleAuth} style={{ background: "white", padding: "30px", borderRadius: "8px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", width: "300px" }}>
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>
        
        <div style={{ marginBottom: "15px" }}>
          <label>Full Name:</label>
          <input 
            type="text" 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
            required 
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        {!isLogin && (
          <>
            <div style={{ marginBottom: "15px" }}>
              <label>Email:</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label>Phone:</label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                required 
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label>Designation:</label>
              <input 
                type="text" 
                value={designation} 
                onChange={(e) => setDesignation(e.target.value)} 
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </div>
          </>
        )}

        <div style={{ marginBottom: "15px" }}>
          <label>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <button 
          type="submit" 
          style={{ width: "100%", padding: "10px", background: "#007BFF", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
        >
          {isLogin ? "Login" : "Sign Up"}
        </button>

        <p 
          onClick={() => setIsLogin(!isLogin)} 
          style={{ textAlign: "center", marginTop: "15px", color: "#007BFF", cursor: "pointer", fontSize: "14px" }}
        >
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
        </p>
      </form>
    </div>
  );
}