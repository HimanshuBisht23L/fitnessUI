import { useState } from 'react';
import '../../styles/Authentication/VerifyEmail.css'
import { RiLockPasswordFill } from "react-icons/ri";
import axios from 'axios'
import { FaildToast, SuccesToast } from '../../utils/toast.js'
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useContext } from 'react';
import { userContext } from '../../App.jsx';

function VerifyEmail() {

    const navigate = useNavigate();
    const [otp, setotp] = useState(null)
    const { isVerified, isAuthenticated, setisVerified } = useContext(userContext)

    useEffect(() => {
        if (isVerified && isAuthenticated) {
            navigate("/");
        }
    }, [])

    const verifyOTP = async () => {

        try {
            const res = await axios.post("http://localhost:3000/auth/verify_account", { otp: otp }, { withCredentials: true })
            console.log(res)
            if (res.data.success) {
                SuccesToast(res.data.message);
                setisVerified(true);
                navigate("/")
            }
            else {
                FaildToast(res.data.message);
            }

        } catch (error) {
            FaildToast(error.message);
        }

        console.log("OTP VERIFIED")
    }


    const sendOTPagain = async () => {
        try {

            const res = await axios.post("http://localhost:3000/auth/send_verify_otp", {}, { withCredentials: true });
            console.log(res);

            if (res.data.success) {
                SuccesToast(res.data.message);
            }
            else {
                FaildToast(res.data.message);
            }
        } catch (error) {
            FaildToast(error.message);
        }

    }

    return (
        <div className="otp-main-cont" >
            <h1>validate OTP</h1>
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    verifyOTP();
                }}>
                <div className="otp-way">
                    <div className="otp-sub-way">
                        <label>OTP</label>
                        <div className="otp-email">
                            <RiLockPasswordFill color='#00ffe1' className="mail-icon" />
                            <input
                                onChange={(e) => setotp(e.target.value)}
                                value={otp}
                                required
                                placeholder="OTP"
                                className="otp-input"
                                type="number"
                            />
                        </div>
                    </div>
                    <p onClick={sendOTPagain} className='resendOTP'>Resend OTP ?</p>
                    <button type="submit" >Submit</button>
                </div>
            </form>
        </div>
    )
}

export default VerifyEmail
