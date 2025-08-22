import '../styles/Footer.css'
import { useNavigate } from 'react-router-dom';


function Footer() {

    const navigate = useNavigate();

    return (
        <footer class="footer">
            <div class="footer-container">
                <div class="footer-left">
                    <p>© 2025 Himanshu | Built for real-life Fitness 💪</p>
                </div>
                <div class="footer-right">
                    <img
                        onClick={() => navigate("/")}
                        className='logo'
                        src="/images/Fitnesslogo1.png"
                        alt="Image"
                    />
                </div>
            </div>
        </footer>

    )
}

export default Footer
