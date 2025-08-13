import { IoMdMail } from 'react-icons/io'
import '../../styles/Authentication/VerifyResetPassEmail.css'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FaildToast, SuccesToast } from '../../utils/toast.js'
import { useEffect, useState } from 'react'
import { RiLockPasswordFill } from 'react-icons/ri'

function VerifyResetPassEmail() {

  const location = useLocation();
  const navigate = useNavigate();
  const [email, setemail] = useState('');
  const [Sending, setSending] = useState(false);
  const [typeText, setTypeText] = useState("Sending");
  const [isEmailSent, setisEmailSent] = useState(false);
  const [isOTPSent, setisOTPSent] = useState(false);
  // const [isOTPSubmitted, setisOTPSubmitted] = useState(false);
  const [newPassword1, setnewPassword1] = useState("");
  const [newPassword2, setnewPassword2] = useState("");
  const [otp, setotp] = useState(null)


  useEffect(() => {
    const path = location.pathname;

    if (path === "/auth/validateResetOTP" && !isEmailSent) {
      navigate("/auth/verifyResetemail");
    }

    if (path === "/auth/resetPassword" && (!isEmailSent || !isOTPSent)) {
      navigate("/auth/verifyResetemail");
    }

  }, [location.pathname, isEmailSent, isOTPSent]);


  // VERIFY EMAIL SECTION
  useEffect(() => {
    if (!Sending) return;

    let dot = "";

    const interval = setInterval(() => {
      dot = dot.length < 4 ? dot + "." : "";
      setTypeText("Sending" + dot);
    }, 500);

    return () => clearInterval(interval);
  }, [Sending]);


  const verifygmail = async () => {
    console.log(email)

    try {

      setSending(true);
      const res = await axios.post("http://localhost:3000/auth/send_reset_password_otp", { email: email }, { withCredentials: true });
      console.log(res);
      setSending(false);

      if (res.data.success) {
        SuccesToast(res.data.message);
        setisEmailSent(true)
        setTimeout(() => {
          navigate("/auth/validateResetOTP");
        }, 1500);
      }
      else {
        FaildToast(res.data.message);
      }

    } catch (error) {
      FaildToast(error.message);
    }

  }




  // Verify OTP Section
  const verifyOTP = async () => {

    try {
      const res = await axios.post("http://localhost:3000/auth/reset_password_otp_verify", {
        email: email,
        otp: otp
      },
        { withCredentials: true }
      )
      console.log(res)
      if (res.data.success) {
        SuccesToast(res.data.message);
        setisOTPSent(true)
        // setisOTPSubmitted(true)
        setTimeout(() => {
          navigate("/auth/resetPassword")
        }, 1500);
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

      const res = await axios.post("http://localhost:3000/auth/send_reset_password_otp", { email: email }, { withCredentials: true });
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


  const SendNewPasswordBackend = async () => {
    console.log("ENTER NEW PASSWORD FUNCTION")

    if (newPassword1 != newPassword2) {
      FaildToast("Enter same password in both")
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/auth/reset_password", {
        email: email,
        newPassword: newPassword1
      },
        { withCredentials: true }
      );

      if (res.data.success) {
        SuccesToast(res.data.message);
        setTimeout(() => {
          navigate("/");
        }, 1200);
      }
      else {
        FaildToast(res.data.message);
      }
    } catch (error) {
      FaildToast(error.message);
    }
    console.log("NEW PASSWORD FUNCTION ENDED")
  }

  return (
    <>
      {
        !isEmailSent &&
        <div className="verify-main-cont" >
          <h1>Email For OTP</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              verifygmail();
            }}>
            <div className="verify-way">
              <div className="verify-sub-way">
                <label>E-mail</label>
                <div className="verify-email">
                  <IoMdMail className="mail-icon" />
                  <input
                    onChange={(e) => setemail(e.target.value)}
                    value={email}
                    required
                    placeholder="E-mail"
                    className="verify-input"
                    type="email"
                  />
                </div>
              </div>
              <p>Didn't forget ?&nbsp;<b onClick={() => navigate("/auth/login")} >Login</b></p>
              <button type="submit" >{Sending ? typeText : "Send OTP"}</button>
            </div>
          </form>
        </div>

      }

      {/* VERIFY OTP SECTION */}

      {

        isEmailSent && !isOTPSent &&
        < div className="otp-main-cont" >
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
        </div >
      }


      {

        isEmailSent && isOTPSent &&

        < div className="otp-main-cont" >
          <h1>Reset Password</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              SendNewPasswordBackend();
            }}>
            <div className="otp-way">
              <div className="otp-sub-way">
                <label>New Password</label>
                <div className="otp-email">
                  <RiLockPasswordFill color='#00ffe1' className="mail-icon" />
                  <input
                    onChange={(e) => setnewPassword1(e.target.value)}
                    value={newPassword1}
                    required
                    placeholder="New password"
                    className="newpass-input"
                    type="password"
                  />
                </div>
                <label>Re-Enter Password</label>
                <div className="otp-email">
                  <RiLockPasswordFill color='#00ffe1' className="mail-icon" />
                  <input
                    onChange={(e) => setnewPassword2(e.target.value)}
                    value={newPassword2}
                    required
                    placeholder="New password"
                    className="newpass-input"
                    type="password"
                  />
                </div>
              </div>
              <button type="submit" >Submit</button>
            </div>
          </form>
        </div >
      }


    </>
  )
}

export default VerifyResetPassEmail
