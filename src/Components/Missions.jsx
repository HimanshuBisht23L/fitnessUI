import { useContext, useEffect, useRef, useState } from 'react'
import '../styles/Missions.css'
import axios from 'axios';
import levels from '../Exercise_Data/exercises_level.json'
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { IoCloseSharp } from "react-icons/io5";
import { userContext } from '../App.jsx';
import { FaildToast, SuccesToast } from '../utils/toast.js';


function Missions() {

    const navigate = useNavigate();
    const PushisDone = useRef(null);
    const PullisDone = useRef(null);
    const RunisDone = useRef(null);
    const CrunchisDone = useRef(null);
    const SitUpsisDone = useRef(null);
    const [PushClicked, setPushClicked] = useState(false);
    const [PullClicked, setPullClicked] = useState(false);
    const [CrunchesClicked, setCrunchesClicked] = useState(false);
    const [SitUpsClicked, setSitUpsClicked] = useState(false);
    const [RunClicked, setRunClicked] = useState(false);
    const [completeTodayTask, setcompleteTodayTask] = useState(false);
    const [temp_data, settemp_data] = useState({});
    const [needLogin, setneedLogin] = useState(false);



    const { isAuthenticated, email } = useContext(userContext)


    useEffect(() => {
        console.log("Temp data: ", temp_data);
    }, [temp_data]);


    useEffect(() => {

        const fetch_Data = async () => {

            const today = dayjs().format("YYYY-MM-DD");

            // for logged User
            if (isAuthenticated && email) {
                try {
                    const res = await axios.post("http://127.0.0.1:3000/user/system_detail", {
                        email: email,
                    });

                    if (res.data.success) {

                        const lastCompletedDate = res.data.lastdate ? dayjs(res.data.lastdate).format("YYYY-MM-DD") : null;
                        const level = res.data.level;

                        if (lastCompletedDate && lastCompletedDate === today) {
                            setcompleteTodayTask(true)
                        }
                        else {
                            setcompleteTodayTask(false)
                        }

                        const logUserData = {
                            level: level + 1,
                            missions: {
                                pushups: "",
                                pullups: "",
                                crunches: "",
                                situps: "",
                                running: ""
                            }
                        };

                        localStorage.setItem(email, JSON.stringify(logUserData));
                        lastCompletedDate && localStorage.setItem("lastDate", lastCompletedDate);

                    } else {
                        console.log(res.data.message);
                    }

                } catch (error) {
                    console.log("Error : " + error.message);
                }
            }
            else {
                // If new day, increase level and clear localStorage flags remain same for Guest User
                const lastDate = localStorage.getItem("lastDate");
                if (lastDate && today !== lastDate) {

                    const user = JSON.parse(localStorage.getItem("guest_user")) || {};
                    if (user.level !== undefined) {
                        user.level = user.level || 1,
                            user.missions = {
                                pushups: "",
                                pullups: "",
                                crunches: "",
                                situps: "",
                                running: "",
                            };
                        localStorage.setItem("guest_user", JSON.stringify(user));
                    }

                    // clear LS
                    localStorage.removeItem("todayTask");
                    localStorage.removeItem("daily_progress");
                    localStorage.setItem("lastDate", today);
                }
            }


            if (localStorage.getItem("todayTask")) {
                setcompleteTodayTask(true);
            }


            if (isAuthenticated && email) {
                const loggedUser = JSON.parse(localStorage.getItem(`${email}`));
                if (loggedUser) {
                    settemp_data(loggedUser);
                }
            }
            else {
                const guest_user = JSON.parse(localStorage.getItem("guest_user"));
                if (guest_user) {
                    settemp_data(guest_user)
                }
            }
        }

        fetch_Data();
    }, [isAuthenticated, email]);




    useEffect(() => {

        if (!temp_data?.missions) return;

        const today = dayjs().format("YYYY-MM-DD");
        const progress = JSON.parse(localStorage.getItem("daily_progress")) || {};
        const todayProgress = progress[today];

        if (todayProgress) {
            if (todayProgress.pushups) {
                PushisDone.current.checked = true;
                setPushClicked(true);
            }
            if (todayProgress.pullups) {
                PullisDone.current.checked = true;
                setPullClicked(true);
            }
            if (todayProgress.running) {
                RunisDone.current.checked = true;
                setRunClicked(true);
            }
            if (todayProgress.crunches) {
                CrunchisDone.current.checked = true;
                setCrunchesClicked(true);
            }
            if (todayProgress.situps) {
                SitUpsisDone.current.checked = true;
                setSitUpsClicked(true);
            }
        }
    }, [temp_data]);



    // Show Login Page on Above Levels
    useEffect(() => {
        const CheckLevel = Number(localStorage.getItem("newlevel")) || 1;
        // setchecklevel(CheckLevel);

        if (!isAuthenticated && CheckLevel >= 6) {
            setneedLogin(true);
        } else {
            setneedLogin(false);
        }
    }, [isAuthenticated]);



    const markPushupsDone = () => {
        if (!PushClicked) {
            PushisDone.current.checked = true;
            setPushClicked(true);
            temp_data.missions["pushups"] = "Done"
            if (isAuthenticated && email) {
                localStorage.setItem(`${email}`, JSON.stringify(temp_data));
            }
            else {
                localStorage.setItem("guest_user", JSON.stringify(temp_data));
            }


            const today = dayjs().format("YYYY-MM-DD");
            const progress = JSON.parse(localStorage.getItem("daily_progress")) || {};
            if (!progress[today]) progress[today] = {};
            progress[today]["pushups"] = true;
            localStorage.setItem("daily_progress", JSON.stringify(progress));

            checkAllMissionsDone();
        }
    }

    const markPullupsDone = () => {
        if (!PullClicked) {
            PullisDone.current.checked = true;
            setPullClicked(true);
            temp_data.missions["pullups"] = "Done"
            if (isAuthenticated && email) {
                localStorage.setItem(`${email}`, JSON.stringify(temp_data));
            }
            else {
                localStorage.setItem("guest_user", JSON.stringify(temp_data));
            }



            const today = dayjs().format("YYYY-MM-DD");
            const progress = JSON.parse(localStorage.getItem("daily_progress")) || {};
            if (!progress[today]) progress[today] = {};
            progress[today]["pullups"] = true;
            localStorage.setItem("daily_progress", JSON.stringify(progress));

            checkAllMissionsDone();
        }
    }
    const markRunDone = () => {
        if (!RunClicked) {
            RunisDone.current.checked = true;
            setRunClicked(true);
            temp_data.missions["running"] = "Done"
            if (isAuthenticated && email) {
                localStorage.setItem(`${email}`, JSON.stringify(temp_data));
            }
            else {
                localStorage.setItem("guest_user", JSON.stringify(temp_data));
            }

            const today = dayjs().format("YYYY-MM-DD");
            const progress = JSON.parse(localStorage.getItem("daily_progress")) || {};
            if (!progress[today]) progress[today] = {};
            progress[today]["running"] = true;
            localStorage.setItem("daily_progress", JSON.stringify(progress));


            checkAllMissionsDone();
        }
    }
    const markCrunchDone = () => {
        if (!CrunchesClicked) {
            CrunchisDone.current.checked = true;
            setCrunchesClicked(true);
            temp_data.missions["crunches"] = "Done"
            if (isAuthenticated && email) {
                localStorage.setItem(`${email}`, JSON.stringify(temp_data));
            }
            else {
                localStorage.setItem("guest_user", JSON.stringify(temp_data));
            }

            const today = dayjs().format("YYYY-MM-DD");
            const progress = JSON.parse(localStorage.getItem("daily_progress")) || {};
            if (!progress[today]) progress[today] = {};
            progress[today]["crunches"] = true;
            localStorage.setItem("daily_progress", JSON.stringify(progress));

            checkAllMissionsDone();
        }
    }

    const markSitupsDone = () => {
        if (!SitUpsClicked) {
            SitUpsisDone.current.checked = true;
            setSitUpsClicked(true);
            temp_data.missions["situps"] = "Done"
            if (isAuthenticated && email) {
                localStorage.setItem(`${email}`, JSON.stringify(temp_data));
            }
            else {
                localStorage.setItem("guest_user", JSON.stringify(temp_data));
            }


            const today = dayjs().format("YYYY-MM-DD");
            const progress = JSON.parse(localStorage.getItem("daily_progress")) || {};
            if (!progress[today]) progress[today] = {};
            progress[today]["situps"] = true;
            localStorage.setItem("daily_progress", JSON.stringify(progress));

            checkAllMissionsDone();
        }
    }


    const sendLoggedUserDataBackend = async (user_data) => {
        try {
            const res = await axios.post("http://127.0.0.1:3000/user/missions", {
                user_data: user_data,
                email: email
            }, { withCredentials: true });

            console.log(res.data);

            if (res.data.success) {
                localStorage.setItem("todayTask", true);
                const today = dayjs().format("YYYY-MM-DD");
                localStorage.setItem("lastDate", today);
                setcompleteTodayTask(true);
                SuccesToast(res.data.message);
                navigate("/system");
            }
            else {
                FaildToast(res.data.message);
            }

        } catch (error) {
            FaildToast(error.message + "ERROR");
        }
    }

    function checkAllMissionsDone() {
        const allDone = temp_data?.missions && Object.values(temp_data.missions).every(val => val === "Done")

        if (allDone) {

            const newLvl = temp_data.level + 1;
            if (isAuthenticated) {
                sendLoggedUserDataBackend(temp_data);
            }
            else {
                localStorage.setItem("guest_user", JSON.stringify(temp_data));
                SendToBackEnd(temp_data, newLvl);
            }
        }

    }



    const SendToBackEnd = async (user_data, newlvl) => {
        try {
            const res = await axios.post("http://127.0.0.1:3000/missions", user_data);
            console.log(res);

            setcompleteTodayTask(true);

            const today = dayjs().format("YYYY-MM-DD");
            localStorage.setItem("todayTask", true);
            localStorage.setItem("lastDate", today);
            localStorage.setItem("newlevel", newlvl);

            SuccesToast(`Level ${user_data.level} Completed`)
            navigate("/system");

        } catch (error) {
            console.log("Error Occured : " + error);
        }
    }




    return (

        <>
            {
                needLogin && <div className='login-popup'>
                    <div className='sub-login-popup'>

                        <div className='popup-heading'>
                            <h2>Login Required</h2>
                            <IoCloseSharp className='close-login-popup' onClick={() => navigate("/missions")} />
                        </div>

                        <p>You need to&nbsp;<b> login/register </b>&nbsp;for more task's.</p>

                        <div className='login-popup-button'>
                            <button onClick={() => navigate("/auth/login")}>Login</button>
                            <button onClick={() => navigate("/auth/signup")}>Register</button>
                        </div>

                    </div>
                </div>
            }

            <div className='mission-main-cont'>

                {
                    completeTodayTask && <div className='mission-complete-promt'>
                        <p> Completed Today's Task 💥</p>
                        <button onClick={() => {
                            navigate("/system")
                        }}
                        >Go To System</button>
                    </div>
                }

                <h1>Today's Mission</h1>
                <div className='mission-cont'>
                    <table>
                        <thead>
                            <tr>
                                <th>Task's</th>
                                <th>Range</th>
                                <th>Completed</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>

                            {
                                temp_data?.level && levels
                                    .filter(task => task.level === temp_data.level)
                                    .map(level => {
                                        return (
                                            <>
                                                <tr>
                                                    <td>Push Ups</td>
                                                    <td>{level.exercises.Pushups}</td>
                                                    <td><input ref={PushisDone} type="checkbox" disabled className='Pushups_Check' style={{ width: "30px", height: "30px" }} /></td>
                                                    <td> <button onClick={markPushupsDone} className='complete-btn'>Completed</button> </td>
                                                </tr>
                                                <tr>
                                                    <td>Pull Ups</td>
                                                    <td>{level.exercises.Pullups}</td>
                                                    <td><input ref={PullisDone} type="checkbox" disabled className='Pullups_Check' style={{ width: "30px", height: "30px" }} /></td>
                                                    <td> <button onClick={markPullupsDone} className='complete-btn'>Completed</button> </td>
                                                </tr>
                                                <tr>
                                                    <td>Running</td>
                                                    <td>{level.exercises.Running}</td>
                                                    <td><input ref={RunisDone} type="checkbox" disabled className='Running_Check' style={{ width: "30px", height: "30px" }} /></td>
                                                    <td> <button onClick={markRunDone} className='complete-btn'>Completed</button> </td>
                                                </tr>
                                                <tr>
                                                    <td>Crunches</td>
                                                    <td>{level.exercises.Crunches}</td>
                                                    <td><input ref={CrunchisDone} type="checkbox" disabled className='Crunches_Check' style={{ width: "30px", height: "30px" }} /></td>
                                                    <td> <button onClick={markCrunchDone} className='complete-btn'>Completed</button> </td>
                                                </tr>
                                                <tr>
                                                    <td>Sit Ups</td>
                                                    <td>{level.exercises.Situps}</td>
                                                    <td><input ref={SitUpsisDone} type="checkbox" disabled className='Situps_Check' style={{ width: "30px", height: "30px" }} /></td>
                                                    <td> <button onClick={markSitupsDone} className='complete-btn'>Completed</button> </td>
                                                </tr>
                                            </>
                                        )
                                    })
                            }

                        </tbody>
                    </table>
                </div>
            </div>

        </>
    )
}

export default Missions

