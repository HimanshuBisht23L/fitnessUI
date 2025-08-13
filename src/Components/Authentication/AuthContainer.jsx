import Login from "./Login.jsx"
import SignUp from "./SignUp.jsx"
import '../../styles/Authentication/AuthContainer.css'
import { useLocation, useNavigate } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";

function AuthContainer() {

    const navigate = useNavigate()
    const location = useLocation();
    const isLoginPage = location.pathname === "/auth/login";

    return (
        <div className='authCont-main-cont'>
            <div
                className="authCont-sub-cont"
                style={{ background: isLoginPage ? "linear-gradient(to right, #ffffff27 50%, #ffffff11 50%)" : "linear-gradient(to left, #ffffff27 50%, #ffffff11 50%)" }}
            >
                <div onClick={()=> navigate("/")} className="auth-back-btn">
                    <IoArrowBackOutline size={20} />
                </div>
                <Login isActive={isLoginPage} />
                <SignUp isActive={!isLoginPage} />
            </div>
        </div>
    );
}

export default AuthContainer
