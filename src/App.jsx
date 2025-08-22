import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./Components/Home.jsx"
import Navbar from "./Components/Navbar.jsx"
import Footer from "./Components/Footer.jsx"
import './styles/App.css'
import System from "./Components/System.jsx"
import Missions from "./Components/Missions.jsx"
import AuthContainer from "./Components/Authentication/AuthContainer.jsx"
import { ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
import { createContext } from "react"
import { useEffect } from "react"
import { useState } from "react"
import axios from "axios"
import { v4 as uuidv4 } from 'uuid';
import VerifyResetPassEmail from './Components/Authentication/VerifyResetPassEmail.jsx'
import VerifyResetPassOTP from "./Components/Authentication/VerifyResetPassOTP.jsx"



// Creating Context
const userContext = createContext();

function App() {

  function HomePage() {
    return (
      <>
        <div className="homepage-div">
          <Navbar />
          <Home />
          <Footer />
        </div>
      </>
    )
  }

  function SystemPage() {
    return (
      <>
        <div className="homepage-div">
          <Navbar />
          <System />
          <Footer />
        </div>
      </>
    )
  }

  function MissionsPage() {
    return (
      <>
        <div className="Missionpage-div">
          <Navbar />
          <Missions />
          <Footer />
        </div>
      </>
    )
  }

  function AuthContainerPage() {
    return (
      <>
        <div className="Loginpage-div">
          <AuthContainer />
        </div>
      </>
    )
  }

  function VerifyResetPassPage() {
    return (
      <div className='verify-container'>
        <VerifyResetPassEmail />
      </div>

    )
  }

  function VerifyEmailPage() {
    return (
      <div className='verify-email-page'>
        <VerifyResetPassOTP />
      </div>

    )
  }


  const [userName, setuserName] = useState(null);
  const [email, setemail] = useState(null);
  const [userId, setuserId] = useState(null);
  const [isAuthenticated, setisAuthenticated] = useState(false);
  const [isVerified, setisVerified] = useState(false);


  const [isAppLoaded, setIsAppLoaded] = useState(false);
  const [inProcess, setinProcess] = useState(false);

  useEffect(() => {

    const CheckUserAuth = async () => {

      setinProcess(true)
      const userAuth = await axios.post("https://fitnessui-backend.onrender.com/auth/isAuthenticated", {}, { withCredentials: true });
      await new Promise((resolve) => {
        setTimeout(() => {
          return resolve("RESOLVED");
        }, 1000);
      });



      if (userAuth.data.success) {
        setisAuthenticated(true);

        const userdata = await axios.get("https://fitnessui-backend.onrender.com/auth/api/user_detail", { withCredentials: true });
        setuserName(userdata.data.userdata.name)
        setuserId(userdata.data.userdata.id)
        setisVerified(userdata.data.userdata.isVerified)
        setemail(userdata.data.userdata.email)
      }
      setinProcess(false);
      setIsAppLoaded(true);
    }

    CheckUserAuth();

  }, [])



  // Home se laya hu ise
  useEffect(() => {

    if (!isAppLoaded) return;

    const fetchUserData = async () => {
      const uid = localStorage.getItem("user_uid");
      if (uid) {
        try {
          const res = await axios.get(`https://fitnessui-backend.onrender.com/missions/${uid}`);
          const user = await res.data;
          localStorage.setItem("guest_user", JSON.stringify(user));
        } catch (err) {
          console.error("Error fetching user:", err);
        }
      }
    };


    if (isAuthenticated && email) {
      return;
    }
    else {
      console.log("HELLO")
      if (!localStorage.getItem("guest_user")) {
        if (!localStorage.getItem("user_uid")) {
          const uid = uuidv4();
          localStorage.setItem("guest_user", JSON.stringify({
            user_uid: uid,
            level: 1,
            missions: {
              pushups: "",
              pullups: "",
              running: "",
              crunches: "",
              situps: ""
            }
          }));
        } else {
          fetchUserData();
        }
      }
    }

  }, [isAuthenticated, email, isAppLoaded]);



  useEffect(() => {
    if (inProcess) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [inProcess])

  return (
    <>
      <userContext.Provider value={{ userName, setuserName, userId, setuserId, isAuthenticated, setisAuthenticated, isVerified, setisVerified, email, setemail }}>
        <BrowserRouter>
          <ToastContainer />
          {
            inProcess && <div className='loading'>
              <div className='circle'> </div>
              <p>Loading...</p>
            </div>
          }
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/contactUs" element={<HomePage />} />
            <Route path="/system" element={<SystemPage />} />
            <Route path="/missions" element={<MissionsPage />} />
            <Route path="/auth/login" element={<AuthContainerPage />} />
            <Route path="/auth/signup" element={<AuthContainerPage />} />
            <Route path="/auth/verifyResetemail" element={<VerifyResetPassPage />} />
            <Route path="/auth/validateResetOTP" element={<VerifyResetPassPage />} />
            <Route path="/auth/resetPassword" element={<VerifyResetPassPage />} />
            <Route path="/auth/verify_email" element={<VerifyEmailPage />} />
          </Routes>
        </BrowserRouter >
      </userContext.Provider>
    </>
  )
}

export default App
export { userContext }
