import { useContext, useEffect, useState } from 'react';
import '../styles/System.css'
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { PrefetchPageLinks, useNavigate } from 'react-router-dom';
import { userContext } from '../App.jsx';
import axios, { all } from 'axios';
import { FaildToast } from '../utils/toast.js';
import exercises_level from '../Exercise_Data/exercises_level.json'
import dayjs from 'dayjs';

function System() {

    const { userName, isAuthenticated, email, userId } = useContext(userContext)

    const [value, valChange] = useState(new Date());
    const [completedDays, setcompletedDays] = useState([]); // year-month-day (month -0 indexed) eg-> new Date(2025, 3, 5)
    const [missedDays, setmissedDays] = useState([]);
    const [logs, setlogs] = useState([]);

    const navigate = useNavigate();
    const [level, setlevel] = useState(1);
    const [width, setwidth] = useState(0);
    const [showIntroPrompt, setShowIntroPrompt] = useState(false)

    // Stats States
    const [Strength, setStrength] = useState(0);
    const [Endurance, setEndurance] = useState(0);
    const [Agility, setAgility] = useState(0);
    const [Disciplane, setDisciplane] = useState("0%");
    const [Streak, setStreak] = useState(0);

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
        (async () => {

            let Guest = true
            let uid;
            if (isAuthenticated) {
                uid = email;
                Guest = false;
            }
            else {
                uid = JSON.parse(localStorage.getItem("guest_user"))?.user_uid;
            }


            try {
                const res = await axios.post("https://fitnessui-backend.onrender.com/user/Taskdays", {
                    id: uid,
                    guest: Guest
                });

                if (res.data.success) {
                    // console.log(res.data.message)
                    let dates = res.data.datesArray.map((d) => new Date(d))
                    setcompletedDays(dates)


                    // this is For missed days.... 
                    let missed = [];
                    if (dates.length > 0) {
                        const firstDay = dates[0];
                        const today = new Date();

                        for (
                            let d = new Date(firstDay);
                            d <= today;
                            d.setDate(d.getDate() + 1)
                        ) {
                            const isCompleted = dates.some(c =>
                                c.getDate() === d.getDate() &&
                                c.getMonth() === d.getMonth() &&
                                c.getFullYear() === d.getFullYear()
                            );

                            if (!isCompleted) {
                                missed.push(new Date(d));
                            }
                        }
                    }
                    setmissedDays(missed);

                }
                else {
                    console.log(res.data.message)
                }

            } catch (error) {
                console.log("Error in Getting Level " + error);
            }
        })();
    }, [])


    useEffect(() => {

        const allLogs = [];

        missedDays.forEach((day) => {
            allLogs.push({
                date: new Date(day),
                text: `❌ Missed Task on ${dayjs(day).format("DD-MMM-YYYY")}`
            })
        })

        completedDays.forEach((day) => {
            allLogs.push({
                date: new Date(day),
                text: `✅ Completed Task on ${dayjs(day).format("DD-MMM-YYYY")}`
            })
        })

        allLogs.sort((a, b) => a.date - b.date);

        setlogs(allLogs.map(log => log.text));

    }, [missedDays, completedDays])



    useEffect(() => {

        if (isAuthenticated) {
            (async () => {
                try {
                    const res = await axios.post("https://fitnessui-backend.onrender.com/user/system_detail", {
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

    useEffect(() => {
        if (completedDays && completedDays.length > 0) {


            // --- Disciplane calculation ---
            const sorted = [...completedDays].sort((a, b) => a - b);

            let discipline = 0;
            let expectedDay = sorted[0]; // start from first completed day

            for (let i = 0; i < sorted.length; i++) {
                const currentDay = sorted[i];

                // Calculate gap in days from expected day
                const diff = (currentDay - expectedDay) / (1000 * 60 * 60 * 24);

                if (diff === 0) {
                    discipline++;
                } else if (diff > 0) {
                    // missed days
                    discipline -= diff; //  discipline-- for missed days
                    if (discipline < 0) discipline = 0;
                    discipline++; // count today's completed task
                }

                // next expected day should be the day after currentDay
                expectedDay = new Date(currentDay);
                expectedDay.setDate(expectedDay.getDate() + 1);
            }
            setDisciplane(parseInt(discipline) + "%");




            // --- Streak calculation ---
            let currentStreak = 0;
            let maxStreak = 1;

            for (let i = 1; i < sorted.length; i++) {
                const prev = sorted[i - 1];
                const curr = sorted[i];

                const diff = (curr - prev) / (1000 * 60 * 60 * 24);

                if (diff === 1) {
                    // consecutive day streak
                    currentStreak++;
                    maxStreak = Math.max(maxStreak, currentStreak);
                } else if (diff > 1) {
                    //  streak break
                    currentStreak = 0;
                }
            }

            let suffix;
            if (maxStreak > 1) {
                suffix = "days"
            }
            else {
                suffix = "day"
            }
            setStreak(maxStreak + " " + suffix);

        }
    }, [completedDays, Streak]);



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
                                <h3>🎯 Streak :</h3>
                                <p>{Streak}</p>
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

                                    // const isMissed = missedDays.some(d =>
                                    //     d.getDate() === date.getDate() &&
                                    //     d.getMonth() === date.getMonth() &&
                                    //     d.getFullYear() === date.getFullYear()
                                    // );

                                    return (
                                        <div className="dot-wrapper">
                                            {isDone && <div className="dot success"></div>}
                                            {/* {isMissed && <div className="dot fail"></div>} */}
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
                <ol className={logs.length > 0 ? 'logs' : 'logs tempLog'}>
                    {
                        logs.length > 0 ?
                            logs.map((log) => {
                                return (
                                    <li>{log}</li>
                                )
                            })
                            :
                            <li>No logs yet</li>
                    }
                </ol>
            </div>
        </div>
    )
}

export default System


