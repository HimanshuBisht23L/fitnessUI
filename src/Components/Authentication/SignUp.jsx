import { IoMdMail } from 'react-icons/io'
import '../../styles/Authentication/Signup.css'
import { FaKey } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom';
import { IoPersonSharp } from "react-icons/io5";
import { useState } from 'react';
import axios from 'axios';
import { FaildToast, SuccesToast } from '../../utils/toast.js'


function SignUp({ isActive }) {

    const navigate = useNavigate()
    const goToLogin = () => {
        navigate("/auth/signup")
    }

    const [FullName, setFullName] = useState("");
    const [Email, setEmail] = useState("");
    const [Password, setPassword] = useState("");


    const SendToBackEnd = async () => {

        if (FullName.length < 4 || FullName.length > 25 || !Email.includes("@gmail.com")) {
            console.log("Validation failed");
            FaildToast("Please Enter Valid Detail's");
            return
        }

        if (Password.length < 8) {
            FaildToast("Password Length should more than 8");
            return
        }

        const Detail = {
            FullName: FullName,
            Email: Email,
            Password: Password,
        }


        axios.defaults.withCredentials = true;

        try {
            const res = await axios.post("https://fitnessui-backend.onrender.com/auth/signup", Detail);
            console.log(res);

            if (res.data.success) {
                SuccesToast(res.data.message)

                const guestuserdata = JSON.parse(localStorage.getItem("guest_user")) || {};
                const newlevel = localStorage.getItem("newlevel");

                // Ensure guest data exists in DB
                if (guestuserdata && newlevel >= 1) {
                    try {
                        const fullGuestData = await axios.get(`https://fitnessui-backend.onrender.com/user/guest_data/${guestuserdata.user_uid}`);
                        await axios.post("https://fitnessui-backend.onrender.com/user/merge_data", {
                            guestuserdata: fullGuestData.data.userdata,
                            useremail: Email
                        });


                        if (res.data.success) {
                            SuccesToast(res.data.message);
                        }
                        else {
                            FaildToast(res.data.message)
                        }

                    } catch (err) {
                        console.error("Error during guest data merge:", err);
                        FaildToast("Error syncing guest progress");
                    }
                }



                setTimeout(() => {
                    navigate("/auth/login");
                }, 1000);
            }
            else {
                FaildToast(res.data.message);
            }

        } catch (error) {
            console.log("Not Sucessfully Send SignUp Detail...." + error);
            FaildToast(error);
        }

    }

    return (
        <>
            {
                <div className="signup-slide-button-box" style={{ display: isActive ? "none" : "flex" }}>
                    <p>New User ?</p>
                    <p>Create new Account</p>
                    <button onClick={goToLogin} >Go To Sign Up</button>
                </div>
            }

            <div className="signup-main-cont" style={{ display: isActive ? "flex" : "none" }}>
                <h1>Sign Up</h1>
                <form
                    method='POST'
                    onSubmit={(e) => {
                        e.preventDefault()
                        SendToBackEnd()
                    }}
                >
                    <div className="signup-way">
                        <div className="signup-sub-way">
                            <label>Full Name</label>
                            <div className="signup-name">
                                <IoPersonSharp className="mail-icon" />
                                <input
                                    onChange={(e) => setFullName(e.target.value)}
                                    value={FullName}
                                    required
                                    placeholder="Enter Full Name"
                                    className="signup-input"
                                    type="text"
                                />
                            </div>
                            <label>E-mail</label>
                            <div className="signup-email">
                                <IoMdMail className="mail-icon" />
                                <input
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={Email}
                                    required
                                    placeholder="E-mail"
                                    className="signup-input"
                                    type="email"
                                />
                            </div>
                            <label>Password</label>
                            <div className="signup-pass">
                                <FaKey className="pass-icon" />
                                <input
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={Password}
                                    required
                                    placeholder="Password"
                                    className="signup-input"
                                    type="password"
                                />
                            </div>
                        </div>
                        <button
                            type='submit'
                        >Sign Up</button>
                    </div>
                </form>
                {/* <ToastContainer /> */}
            </div>
        </>
    )
}

export default SignUp
