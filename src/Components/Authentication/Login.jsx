import "../../styles/Authentication/Login.css"
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaFacebook, FaKey } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { FaildToast, SuccesToast } from "../../utils/toast.js";
import { userContext } from "../../App.jsx";
import { useContext } from "react";

function Login({ isActive }) {

    const { setisAuthenticated, setuserName, setuserId, setemail } = useContext(userContext);

    const navigate = useNavigate()
    const goToSignup = () => {
        navigate("/auth/login")
    }

    const [email, setmail] = useState("");
    const [password, setpassword] = useState("");


    const LoginUser = async () => {

        const Logindetail = {
            Email: email,
            Password: password
        }

        axios.defaults.withCredentials = true;

        try {
            console.log("Sending request...");
            const res = await axios.post("https://fitnessui-backend.onrender.com/auth/login", Logindetail);
            console.log("recieved req");

            if (res.data.success) {
                console.log("Success")
                SuccesToast(res.data.message);


                const userdata = await axios.get("https://fitnessui-backend.onrender.com/auth/api/user_detail", {
                    withCredentials: true,
                });

                setisAuthenticated(true);
                setuserName(userdata.data.userdata.name)
                setuserId(userdata.data.userdata.id)
                setemail(userdata.data.userdata.email);




                // Clearing Guest_user Data From DB
                const Guest_uid = JSON.parse(localStorage.getItem("guest_user"));
                if (Guest_uid) {
                    const isDeleted = await axios.post("https://fitnessui-backend.onrender.com/delete/guest_data", Guest_uid);
                    if (isDeleted.data.success) {
                        SuccesToast(isDeleted.data.message);
                        localStorage.removeItem("guest_user");
                    }
                    else {
                        FaildToast(isDeleted.data.message)
                    }
                }


                localStorage.clear();

                setTimeout(() => {
                    navigate("/");
                }, 1000);
            }
            else {
                console.log("Failed")
                FaildToast(res.data.message);
            }

        } catch (error) {
            console.log("Not Sucessfully Send login Detail...." + error);
            FaildToast(error.message);
        }
    }


    return (
        <>
            {
                <div className="login-slide-button-box" style={{ display: isActive ? "none" : "flex" }}>
                    <p>Already have Account</p>
                    <button onClick={goToSignup} >Go To Login</button>
                </div>
            }
            <div className="login-main-cont" style={{ display: isActive ? "flex" : "none" }}>
                <h1>LOGIN</h1>
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        LoginUser()
                    }}>
                    <div className="login-way">
                        <div className="login-sub-way">
                            <label>E-mail</label>
                            <div className="login-email">
                                <IoMdMail className="mail-icon" />
                                <input
                                    onChange={(e) => setmail(e.target.value)}
                                    value={email}
                                    required
                                    placeholder="E-mail"
                                    className="login-input"
                                    type="email"
                                />
                            </div>
                            <label>Password</label>
                            <div className="login-pass">
                                <FaKey className="pass-icon" />
                                <input
                                    onChange={(e) => setpassword(e.target.value)}
                                    value={password}
                                    required
                                    placeholder="Password"
                                    className="login-input"
                                    type="password"
                                />
                            </div>
                            <p onClick={() => navigate("/auth/verifyResetemail")}>forget password ?</p>
                        </div>
                        <button type="submit" >Login</button>
                    </div>
                    <div className="other-way">
                        <FcGoogle className="login-icon" />
                        <FaGithub className="login-icon" />
                        <FaFacebook className="login-icon" />
                    </div>
                </form>
                {/* <ToastContainer /> */}
            </div>
        </>
    )
}

export default Login
