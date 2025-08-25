import { Link, useNavigate } from 'react-router-dom'
import '../styles/Navbar.css'
import { useContext } from 'react'
import { userContext } from '../App.jsx'
import Avatar from 'react-avatar';
import { useState } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import { FaildToast, SuccesToast } from '../utils/toast.js';
import { RxHamburgerMenu } from "react-icons/rx";
import { IoMdClose } from "react-icons/io";



function Navbar() {

    const { userName, setuserName, userId, setuserId, isAuthenticated, setisAuthenticated, isVerified } = useContext(userContext);
    const [showLogout, setshowLogout] = useState(false);
    const [loading, setloading] = useState(false);
    const [show, setshow] = useState(false);
    const navLink = useRef(null);
    const closeLogout = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {

        const handleClose = (e) => {
            if (closeLogout.current && !closeLogout.current.contains(e.target)) {
                setshowLogout(false)
            }
        }

        const handleCloseMoblieHam = (e) => {
            if (navLink.current && !navLink.current.contains(e.target)) {
                setshow(false);
            }
        }

        document.addEventListener("mousedown", handleClose)
        document.addEventListener("mousedown", handleCloseMoblieHam)

        return () => {
            document.removeEventListener("mousedown", handleClose)
            document.removeEventListener("mousedown", handleCloseMoblieHam)
        }
    }, [])



    useEffect(() => {
        if (loading) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [loading])

    useEffect(() => {
        if (show) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [show])

    const showLogoutButton = () => {
        setshowLogout(true)
    }


    const logoutUser = async () => {

        try {
            const res = await axios.post("https://fitnessui-backend.onrender.com/auth/logout", {}, { withCredentials: true })
            if (res.data.success) {
                SuccesToast(res.data.message);

                setisAuthenticated(false);
                setuserName(null);
                setuserId(null);

                localStorage.clear();

                setTimeout(() => {
                    navigate("/")
                }, 500)
            }
            else {
                FaildToast(res.data.message)
            }

        } catch (error) {
            FaildToast(error.message)
        }

    }


    const sendVerifyOTP = async () => {

        if (isVerified) {
            navigate("/")
        }

        try {
            setloading(true);
            const res = await axios.post("https://fitnessui-backend.onrender.com/auth/send_verify_otp", {}, { withCredentials: true })

            if (res.data.success) {
                console.log("OTP SENDED")
                SuccesToast(res.data.message);
                setloading(false);
                navigate("/auth/verify_email")
            }
            else {
                setloading(false);
                FaildToast(res.data.message);
            }
        } catch (error) {
            FaildToast(error.message)
            console.log("OTP NOT SENDED")
        }
    }


    const scrooltoContact = () => {
        navigate("/", {
            state: {
                scrollToContact: true
            }
        })
    }

    return (
        <>

            {
                loading &&

                <div className='loading'>
                    <div className='circle'> </div>
                    <p>Sending otp...</p>
                </div>
            }

            <nav className="navbar">
                <div> <img
                    onClick={() => navigate("/")}
                    className='logo'
                    src="/images/Fitnesslogo1.png"
                    alt="Image"
                /> </div>

                <RxHamburgerMenu onClick={() => setshow(!show)} className='hamburger' />
                <ul ref={navLink} className={`nav-links ${show ? "open" : ""}`}>
                    <li className={`close-ham ${show ? "visible" : ""}`}>
                        <img
                            onClick={() => navigate("/")}
                            className='logoIcon'
                            src="/images/Fitnesslogo1.png"
                            alt="Image"
                        />
                        <IoMdClose onClick={() => setshow(!show)} className='close-ham-icon' />
                    </li>


                    {
                        isAuthenticated && show &&
                        <>
                            <li className='mobile-li' >Hey, &nbsp;
                                <span> {userName?.split(" ")[0]} </span></li>
                            {
                                !isVerified && isAuthenticated && !loading && <li onClick={sendVerifyOTP} className='logoutUser mobileVerifyBtn'>verify email</li>
                            }
                            <li className='logoutUser user-profile mobile-li'>profile</li>
                        </>
                    }

                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/system">System</Link></li>
                    <li><Link to="/missions">Missions</Link></li>
                    <li><Link
                        onClick={scrooltoContact}
                        to="/contactUs"
                    >Contact Us</Link></li>

                    {
                        show ?
                            <>
                                {

                                    isAuthenticated ?
                                        <>
                                            <li onClick={logoutUser} className='logoutUser logout-btn mobile-li'>Logout</li>
                                        </>
                                        :
                                        <li><Link to="/auth/login">Login</Link></li>
                                }
                            </>
                            :
                            <>
                                {

                                    isAuthenticated ?
                                        <>
                                            <div
                                                className='avatar-class'
                                                ref={closeLogout}
                                            >
                                                <Avatar
                                                    name={userName}
                                                    size='28'
                                                    className='user-avatar'
                                                    onClick={showLogoutButton}
                                                    round={true}
                                                />

                                                {
                                                    showLogout &&
                                                    <ul className="logout-control">
                                                        <li>Hey, &nbsp;
                                                            <span> {userName?.split(" ")[0]} </span></li>
                                                        {
                                                            !isVerified && isAuthenticated && !loading && <li onClick={sendVerifyOTP} className='logoutUser'>verify email</li>
                                                        }
                                                        <li className='logoutUser user-profile'>profile</li>
                                                        <li onClick={logoutUser} className='logoutUser logout-btn'>Logout</li>
                                                    </ul>
                                                }

                                            </div>
                                        </>
                                        :
                                        <li><Link to="/auth/login">Login</Link></li>
                                }
                            </>
                    }


                </ul>
            </nav>
        </>
    )
}

export default Navbar
