import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/Home.css'
import { useContext, useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Avatar from 'react-avatar';
import { userContext } from '../App.jsx'
import axios from 'axios';
import { FaildToast, InfoToast, SuccesToast } from '../utils/toast.js';
import { AiOutlineLike, AiOutlineDislike } from "react-icons/ai";


function Home() {
    const navigate = useNavigate();
    const location = useLocation();

    // comment usestate variables
    const [name, setname] = useState("");
    const [email, setemail] = useState("");
    const [comment, setcomment] = useState("");

    // contact useState variables
    const [Name, setName] = useState("");
    const [Email, setEmail] = useState("");
    const [Number, setNumber] = useState(null);
    const [Contact, setContact] = useState("");

    const [commentLoading, setcommentLoading] = useState(false);
    const [reload, setreload] = useState(false);
    const [commentData, setcommentData] = useState([]);
    const [compareID, setcompareID] = useState('');
    const [userActions, setUserActions] = useState({});



    const { isAuthenticated, userId } = useContext(userContext);



    useEffect(() => {
        if (location.pathname === '/contactUs' || location.state?.scrollToContact) {
            document.getElementById('contact')?.scrollIntoView({ behavior: "smooth" });
        }
    }, [location])


    useEffect(() => {
        // initilazing AOS
        AOS.init({ duration: 400, offset: 80, once: false });

        // Comment Check Liked or Disliked 
        (async () => {

            let uid;
            if (isAuthenticated) {
                uid = userId;
            }
            else {
                uid = JSON.parse(localStorage.getItem("guest_user"))?.user_uid;
            }

            try {
                const res = await axios.get("http://127.0.0.1:3000/user/comment_data", {
                    params: {
                        uid: uid
                    }
                });

                if (res.data.success) {

                    const cmntData = {};
                    res.data.result.forEach(element => {
                        cmntData[element.commentId] = {
                            liked: element.liked,
                            disliked: element.disliked
                        }
                    });

                    setUserActions(cmntData);
                    SuccesToast(res.data.message);
                }
                else {
                    FaildToast(res.data.message);
                }
            } catch (error) {
                FaildToast("Can like/dislike : " + error.message);
            }
        })();

    }, [reload])


    const postComment = async () => {
        console.log("COMMENT POSTED")

        try {

            let uid;
            if (isAuthenticated) {
                uid = userId;
            }
            else {
                uid = JSON.parse(localStorage.getItem("guest_user"))?.user_uid;
            }


            const res = await axios.post("http://127.0.0.1:3000/user/comments", {
                user_id: uid,
                email: email,
                name: name,
                comment: comment,
            })

            if (res.data.success) {
                SuccesToast(res.data.message);
                setname("");
                setemail("");
                setcomment("");
                setreload(!reload);
            }
            else {
                FaildToast(res.data.message)
            }
        } catch (error) {
            FaildToast(error.message);
        }
    }


    useEffect(() => {
        (async () => {

            try {

                let uid;
                if (isAuthenticated) {
                    uid = userId;
                }
                else {
                    uid = JSON.parse(localStorage.getItem("guest_user"))?.user_uid;
                }

                setcompareID(uid);
                setcommentLoading(true);
                const res = await axios.get("http://127.0.0.1:3000/user/fetchComments");

                if (res.data.success) {
                    SuccesToast(res.data.message);
                    setcommentData(res.data.comments);
                }
                else {
                    FaildToast(res.data.message);
                }
            } catch (error) {
                setcommentLoading(false);
                FaildToast(error.message);
            }
        })();
    }, [reload])


    useEffect(() => {
        setcommentLoading(false);
        console.log(commentData);
    }, [commentData])



    const deleteComment = async (id) => {

        try {
            const res = await axios.post("http://127.0.0.1:3000/user/DeleteComment", {
                id: id
            });

            if (res.data.success) {
                SuccesToast(res.data.message);
            }
            else {
                FaildToast(res.data.message);
            }
            setreload(!reload);
        } catch (error) {
            setreload(!reload);
            FaildToast(error.message)
        }

    }

    const increaseLike = async (id) => {
        let uid;
        if (isAuthenticated) {
            uid = userId;
        }
        else {
            uid = JSON.parse(localStorage.getItem("guest_user"))?.user_uid;
        }


        try {
            const res = await axios.post("http://127.0.0.1:3000/user/like", {
                userId: id,
                likeUser: uid,
            })

            if (res.data.success) {
                SuccesToast(res.data.message);
            }
            else if (!res.data.liked) {
                InfoToast(res.data.message);
                SuccesToast("Like removed");
            }
            else {
                FaildToast(res.data.message);
            }
            setreload(!reload);
        } catch (error) {
            FaildToast("failed like action : " + error.message)
        }
    }

    const increaseDislike = async (id) => {
        let uid;
        if (isAuthenticated) {
            uid = userId;
        }
        else {
            uid = JSON.parse(localStorage.getItem("guest_user"))?.user_uid;
        }


        try {
            const res = await axios.post("http://127.0.0.1:3000/user/dislike", {
                userId: id,
                dislikeUser: uid,
            })

            if (res.data.success) {
                SuccesToast(res.data.message);
            }
            else if (!res.data.disliked) {
                InfoToast(res.data.message);
                SuccesToast("Dislike removed");
            }
            else {
                FaildToast(res.data.message);
            }
            setreload(!reload);
        } catch (error) {
            FaildToast("failed dislike action : " + error.message)
        }
    }



    const postContact = async () => {

        try {
            const res = await axios.post("http://127.0.0.1:3000/user/contact_message", {
                name: Name,
                email: Email,
                number: Number,
                issue: Contact
            })

            if (res.data.success) {
                setName("")
                setEmail("")
                setNumber("")
                setContact("")
                SuccesToast(res.data.message)
            }
            else {
                FaildToast(res.data.message)
            }

        } catch (error) {
            FaildToast(error.message)
        }

        console.log("DONE CONTACT")
    }


    return (
        <>
            <div className='home-main-cont'>
                <section className="hero">
                    <div className='hero-sub'>
                        <h1>SYSTEM ⎯ AWAKENING</h1>
                        <p>Train. Level Up. Evolve.</p>
                        <button
                            onClick={() => navigate('/system')}
                            className="cta-button"
                        >ACTIVATE SYSTEM</button>
                    </div>
                </section>


                <section className="how-it-works">
                    <h2>▣ How the System Works</h2>
                    <p className="how-desc">
                        This isn’t just a fitness tracker. It’s your personal leveling system. Each day, you’ll get harder challenges designed to push your limits and grow stronger in the real world.
                    </p>
                    <div className="steps">
                        <div
                            data-aos="fade-right"
                            data-aos-delay="400"
                            className="step-card"
                        >
                            <h3>Step 1 — Accept Challenges</h3>
                            <p>Based on your current level, the system assigns real-world quests: pushups, situps, running, planks, and more.</p>
                        </div>
                        <div
                            className="step-card"
                            data-aos="fade-right"
                            data-aos-delay="200"
                        >
                            <h3>Step 2 — Complete Tasks</h3>
                            <p>Log your progress and earn stars. As you build consistency, your stats and level increase gradually.</p>
                        </div>
                        <div
                            className="step-card"
                            data-aos="fade-right"
                            data-aos-delay="0"
                        >
                            <h3>Step 3 — Level Up</h3>
                            <p>Each level unlocks tougher missions with more reps, more intensity, and more challenges. Just like a real RPG.</p>
                        </div>
                    </div>
                </section>



                <section className="quotes" id="quotes">
                    <h2>▣ Motivational Quotes</h2>
                    <p className="quotes-subtitle">
                        Let these words ignite your will. Each step, each rep, each breath — is a step closer to the version of you the world has never seen.
                    </p>

                    <ul className="quote-list">
                        <li
                            data-aos="fade-up"
                            data-aos-delay='0'
                        >
                            “You don’t need magic to become powerful. Just discipline.”
                        </li>
                        <li
                            data-aos="fade-up"
                            data-aos-delay='100'
                        >
                            “Train like a hunter. Live like a monarch.”
                        </li>
                        <li
                            data-aos="fade-up"
                            data-aos-delay='200'
                        >
                            “Every drop of sweat writes your next chapter.”
                        </li>
                        <li
                            data-aos="fade-up"
                            data-aos-delay='300'
                        >
                            “Fear is a level. Face it and rise.”
                        </li>
                        <li
                            data-aos="fade-up"
                            data-aos-delay='400'
                        >
                            “Level 1 is not weakness. It's origin.”
                        </li>
                    </ul>

                    <div className="quotes-bottom">
                        <p className="quote-closing">
                            The path is long. The pain is real. But the system is watching. And every effort counts.
                        </p>
                        <p className="quote-system-text"> <em style={{ color: 'red' }}>▣ SYSTEM MESSAGE:</em> <em>“Progress logged. Prepare for next mission.”</em></p>
                    </div>
                </section>


                {/* Comment Section */}
                <section className="comment-section" id="comment">
                    <h2>Leave a Comment </h2>
                    <p className="comment-subtitle">
                        Comment if you are fitnessFreak & like this fitnessUI.
                    </p>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            postComment();
                        }}
                        className="comment-form"
                    >
                        <div className='comment-data'>
                            <label> Name  </label>
                            <input
                                className='form-detail'
                                value={name}
                                onChange={(e) => setname(e.target.value)}
                                placeholder='Enter Your Good Name'
                                type="text"
                                required
                            />
                        </div>
                        <div className='comment-data'>
                            <label> Email </label>
                            <input
                                value={email}
                                onChange={(e) => setemail(e.target.value)}
                                className='form-detail'
                                placeholder='Enter your Email'
                                type="email"
                                required
                            />
                        </div>
                        <div className='comment-data'>
                            <label> Comment  </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setcomment(e.target.value)}
                                className='form-detail-textarea'
                                placeholder='Comment Here....'
                                required
                            />
                        </div>
                        <button type='submit' >Post Comment</button>
                    </form>

                    <div className='comment-list'>
                        <h2>💬 Comments</h2>
                        <div className='comments'>

                            {/* Hard Comment */}
                            <div className='comment'>
                                <div className='name-detail'>


                                    <span
                                        className='detail-name'>
                                        <Avatar
                                            size='28'
                                            value='F'
                                            round={true}
                                        />
                                        &nbsp;
                                        fitnessUI
                                    </span>
                                    <span
                                        className='detail-date'>
                                        08/11/2025
                                    </span>
                                </div>
                                <p className='comment-text'>
                                    Thanks for visiting our web app fitnessUI. I hope this site had helped you to maintain your fitness and help in reaching your dream fitness.
                                </p>
                                <div className='actions'>
                                    <button className='btn'>
                                        <span className="normalColor">
                                            <AiOutlineLike size={20} />
                                        </span>
                                        0
                                    </button>
                                    <button className='btn'>
                                        <span className="normalColor">
                                            <AiOutlineDislike size={20} />
                                        </span>
                                        0
                                    </button>
                                </div>
                            </div>

                            {/* User Comments */}
                            {
                                !commentLoading && commentData.map((cmnt, i) => {


                                    const action = userActions[cmnt._id] || { liked: false, disliked: false };

                                    return (
                                        <div key={i} className='comment'>
                                            <div className='name-detail'>
                                                <span
                                                    className='detail-name'>
                                                    <Avatar
                                                        size='28'
                                                        value={cmnt.name[0]}
                                                        round={true}
                                                    />
                                                    &nbsp;
                                                    {cmnt.name}
                                                </span>
                                                <span
                                                    className='detail-date'>
                                                    {new Date(cmnt.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className='comment-text'>
                                                {cmnt.comment}
                                            </p>
                                            <div className='actions'>
                                                <button
                                                    onClick={() => {
                                                        increaseLike(cmnt._id);
                                                    }}
                                                    className='btn'
                                                >
                                                    <span className={action.liked ? "likedBtn" : "normalColor"}>
                                                        <AiOutlineLike size={20} />
                                                    </span>
                                                    {cmnt.like}</button>

                                                <button
                                                    onClick={() => {
                                                        increaseDislike(cmnt._id);
                                                    }}
                                                    className='btn'
                                                >
                                                    <span className={action.disliked ? "dislikedBtn" : "normalColor"}>
                                                        <AiOutlineDislike size={20} />
                                                    </span>
                                                    {cmnt.dislike}
                                                </button>

                                                {
                                                    cmnt.user_id === compareID && <button
                                                        onClick={() => {
                                                            deleteComment(cmnt._id)
                                                        }}
                                                        className='delete-btn'
                                                    >Delete</button>
                                                }
                                            </div>
                                        </div>
                                    )
                                })
                            }

                        </div>
                    </div>

                </section>

                <section className='contact-container' id='contact'>
                    <h2>📞 Contact us </h2>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            postContact();
                        }}
                        className="contact-form"
                    >
                        <div className='contact-data'>
                            <label> Name </label>
                            <input
                                value={Name}
                                onChange={(e) => setName(e.target.value)}
                                className='contact-form-detail'
                                placeholder='Enter your Name'
                                type="text"
                                required
                            />
                        </div>
                        <div className='contact-data'>
                            <label> Email  </label>
                            <input
                                value={Email}
                                onChange={(e) => setEmail(e.target.value)}
                                className='contact-form-detail'
                                placeholder='Enter your Email'
                                type="email"
                                required
                            />
                        </div>
                        <div className='contact-data'>
                            <label> Phone  </label>
                            <input
                                value={Number}
                                onChange={(e) => setNumber(e.target.value)}
                                className='contact-form-detail'
                                placeholder='Phone Number'
                                type="number"
                                required
                            />
                        </div>
                        <div className='contact-data'>
                            <label> Your Message </label>
                            <textarea
                                value={Contact}
                                onChange={(e) => setContact(e.target.value)}
                                className='contact-form-detail-textarea'
                                placeholder='Enter your issue Here....'
                                required
                            />
                        </div>
                        <button type='submit' >Contact</button>
                    </form>

                </section>


            </div>
        </>
    )
}

export default Home
