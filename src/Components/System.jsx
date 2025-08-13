import { useContext, useEffect, useState } from 'react';
import '../styles/System.css'
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom';
import { userContext } from '../App.jsx';
import axios from 'axios';
import { FaildToast } from '../utils/toast.js';
import exercises_level from '../Exercise_Data/exercises_level.json'

function System() {

    const { userName, isAuthenticated, email } = useContext(userContext)

    const [value, valChange] = useState(new Date());
    const completedDays = []; // year-month-day (month -0 indexed) eg-> new Date(2025, 3, 5)
    const missedDays = [];
    const navigate = useNavigate();
    const [level, setlevel] = useState(1);
    const [width, setwidth] = useState(0);
    const [showIntroPrompt, setShowIntroPrompt] = useState(false)

    // Stats States
    const [Strength, setStrength] = useState(0);
    const [Endurance, setEndurance] = useState(0);
    const [Agility, setAgility] = useState(0);
    const [Disciplane, setDisciplane] = useState(0);
    const [Focus, setFocus] = useState(0);

    // Training History
    const [pushups, setpushups] = useState(0);
    const [pullups, setpullups] = useState(0);
    const [running, setrunning] = useState(0);
    const [crunches, setcrunches] = useState(0);
    const [situps, setsitups] = useState(0);





    useEffect(() => {
        setShowIntroPrompt(true);
    }, []);

    useEffect(() => {

        if (isAuthenticated) {
            (async () => {
                try {
                    const res = await axios.post("http://127.0.0.1:3000/user/system_detail", {
                        email: email,
                    });

                    console.log(res.data);

                    if (res.data.success) {
                        const newlevel = res.data.level + 1;
                        setlevel(newlevel);


                        let from = res.data.level;
                        let to = res.data.level + 1;

                        if (to > from) {
                            let current = from;
                            const interval = setInterval(() => {
                                if (current >= to) {
                                    clearInterval(interval);
                                } else {
                                    current += 1;
                                    setwidth(current);
                                }
                            }, 500);

                            return () => clearInterval(interval);
                        } else {
                            setwidth(to);
                        }
                    }
                    else {
                        FaildToast(res.data.message);
                    }

                } catch (error) {
                    console.log("Error in Getting Level " + error);
                }
            })();
        }
        else {
            if (localStorage.getItem("guest_user")) {
                const val = JSON.parse(localStorage.getItem("guest_user"));
                const prevlvl = val.level;
                const newLevel = localStorage.getItem("newlevel");
                console.log(newLevel)
                setlevel(newLevel ? newLevel : prevlvl);

                let from = prevlvl;
                let to = newLevel ? newLevel : prevlvl;

                if (to > from) {
                    let current = from;
                    const interval = setInterval(() => {
                        if (current >= to) {
                            clearInterval(interval);
                        } else {
                            current += 1;
                            setwidth(current);
                        }
                    }, 500);

                    return () => clearInterval(interval);
                } else {
                    setwidth(to);
                }
            }
        }
    }, []);


    useEffect(() => {

        if (level != 0) {
            // filling System Data
            for (const item of exercises_level) {
                if (item.level < level) {
                    // Stats
                    setEndurance((prev) => prev + item.exercises.Situps + item.exercises.Crunches);
                    setStrength((prev) => prev + item.exercises.Pullups + item.exercises.Pushups);
                    setAgility((prev) => prev + parseFloat(item.exercises.Running.split(" ")[0]));
                    setFocus(0) // Dalne hai
                    setDisciplane(0) // Dalne hai


                    // All Task History
                    setcrunches((prev) => prev + item.exercises.Crunches);
                    setpushups((prev) => prev + item.exercises.Pushups);
                    setpullups((prev) => prev + item.exercises.Pullups);
                    setsitups((prev) => prev + item.exercises.Situps);
                    setrunning((prev) => prev + parseFloat(item.exercises.Running.split(" ")[0]));
                }
                else {
                    break;
                }
            }
        }

    }, [level])


    return (
        <div className='system-main-cont'>

            {/* <div className='lvlupPromt'>
                Congratulation's Level Up 🎉
            </div> */}

            <div className='cards'>


                {showIntroPrompt && (
                    <div className="onboarding-prompt">
                        <p>{`🚀 Welcome ${userName ? userName : "User"}, Complete your daily missions to gain XP and level up.`}</p>
                        <button onClick={() => setShowIntroPrompt(false)}>Got it!</button>
                        <button onClick={() => {
                            setShowIntroPrompt(false);
                            navigate("/missions")
                        }}>Missions</button>
                    </div>
                )}


                <div className='level' id='lvl'>
                    <h1>LEVEL</h1>
                    <h2>{level}</h2>
                    <div className='xp-bar-container'>
                        <div
                            className='XP-Line'
                            style={{ width: `${width}%` }}
                        > </div>
                    </div>
                </div>
                <div className='sub-cards'>
                    <div className='card' id='core-stats'>

                        <h1>▣ Stats</h1>

                        <div className='stats'>
                            <div className='cStat'>
                                <h3>💪 Strength:</h3>
                                <p>{Strength}</p>
                            </div>
                            <div className='cStat'>
                                <h3>🛡️ Endurance:</h3>
                                <p>{Endurance}</p>
                            </div>
                            <div className='cStat'>
                                <h3>🧠 Discipline:</h3>
                                <p>{Disciplane}</p>
                            </div>
                            <div className='cStat'>
                                <h3>⚡ Agility:</h3>
                                <p>{Agility}</p>
                            </div>
                            <div className='cStat'>
                                <h3>🎯 Focus:</h3>
                                <p>{Focus}</p>
                            </div>
                        </div>
                    </div>
                    <div className='card' id='streak'>
                        <h1>▣ Streak</h1>
                        <Calendar
                            onChange={valChange}
                            value={value}
                            tileContent={({ date, view }) => {
                                if (view === 'month') {
                                    const isDone = completedDays.some(d =>
                                        d.getDate() === date.getDate() &&
                                        d.getMonth() === date.getMonth() &&
                                        d.getFullYear() === date.getFullYear()
                                    );

                                    const isMissed = missedDays.some(d =>
                                        d.getDate() === date.getDate() &&
                                        d.getMonth() === date.getMonth() &&
                                        d.getFullYear() === date.getFullYear()
                                    );

                                    return (
                                        <div className="dot-wrapper">
                                            {isDone && <div className="dot success"></div>}
                                            {isMissed && <div className="dot fail"></div>}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />




                    </div>
                    <div className='card' id='alltime-history'>
                        <h1>▣ Training History</h1>
                        <ul className="history-list">
                            <li>🟩 Total Pushups: {pushups}</li>
                            <li>🟦 Total Situps: {situps}</li>
                            <li>🟧 Total Runs: {running} km</li>
                            <li>🟧 Total Pullups: {pullups} </li>
                            <li>🟨 Total Crunches: {crunches}</li>
                        </ul>
                    </div>
                    <div className='card' id='next-mission'>
                        <h1>▣ Next Mission</h1>
                        <ul>
                            <p> 🔒 Locked </p>
                            <li>🔓 +20 Pushups</li>
                            <li>🔓 +10 Pullups</li>
                            <li>🔓 +1km Run</li>
                            <li>🔓 +20 Crunches</li>
                            <li>💥 XP Bonus: +100</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className='all-logs'>
                <h1>Previous Logs</h1>
                <ol className='logs'>
                    <li>✅ 20 Pushups completed on 5 July</li>
                    <li>✅ 20 Pullups completed on 5 July</li>
                    <li>✅ 15 Situps completed on 4 July</li>
                    <li>❌ Skipped run on 3 July</li>
                    <li>✅ 1km running completed on 2 July</li>
                    <li>✅ 1km running completed on 2 July</li>
                </ol>
            </div>
        </div>
    )
}

export default System


