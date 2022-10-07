import { useEffect, useState } from 'react';
import styles from '../styles/Quiz.module.scss';
import { useSession, signIn } from "next-auth/react";
import Slider from 'rc-slider';
import axios from 'axios';

export default function Quiz() {
    let { data: session } = useSession();

    let [page, setPage] = useState(-1);
    let [gameSettings, setGameSettings] = useState({});
    let [scale, setScale] = useState(10);
    let [maxQ, setMaxQ] = useState(0);
    let [qid, setQid] = useState(undefined);
    let [result, setResult] = useState(undefined);
    let [progress, setProgress] = useState(0);

    useEffect(() => {
        let settings = JSON.parse(localStorage.getItem("settings"));
        setMaxQ(settings.ums.match(/.{1}/g).reduce((a, b) => a + (b === "1" ? 1 : 0), 0) +
            settings.os.match(/.{1}/g).reduce((a, b) => a + (b === "1" ? 1 : 0), 0) +
            settings.ut.match(/.{1}/g).reduce((a, b) => a + (b === "1" ? 1 : 0), 0));

        let q = localStorage.getItem("qid");

        if (q) {
            setQid(q);
            retrieveGame(q);
            setPage(4);
        }
        else setPage(0);
    }, []);

    const appendGame = (a) => setGameSettings({ ...gameSettings, ...a });

    const joinSpeedrun = () => {
        appendGame({ mode: "speedrun" });
        setPage(1);
    }

    const joinTimed = () => {
        appendGame({ mode: "timed" });
        setPage(1);
    }

    const joinPractice = () => {
        appendGame({ competitive: false });

        setPage(gameSettings.mode === "speedrun" ? 3 : 2);
    }

    const joinCompetitive = () => {
        if (!session) return signIn("google");

        appendGame({ competitive: true });
        startGame();
    }

    const startPractice = () => {
        appendGame({ quota: scale });
        startGame();
    }

    const startGame = async () => {
        let { data: qid } = await axios.post("/api/quiz", gameSettings);

        localStorage.setItem("qid", qid);
        setQid(qid);
        retrieveGame(qid);
    }

    const retrieveGame = async (qid) => {
        let q = await axios.get("/api/quiz", { qid });

        if (q.data.status) {
            // on going
            setGameSettings(q.data.settings);
            setProgress(q.data?.progress);
            setPage(4);
        }
        else {
            // game over
            setQid(undefined);
            localStorage.removeItem("qid");
            setResult(q.data.result);
            setPage(5);
        }
    }

    return (
        <div className={styles.page}>
            {page === 0 ? (
                <div className={styles.choice}>
                    <button onClick={joinSpeedrun}>Speedrun</button>
                    <button onClick={joinTimed}>Timed</button>
                </div>
            ) : page === 1 ? (
                <div className={styles.choice}>
                    <button onClick={joinPractice}>Practice</button>
                    <button onClick={joinCompetitive}>Competitive</button>
                </div>
            ) : page === 2 ? (
                <div className={styles.timebar}>
                    <h1 style={{ marginBottom: "20px" }}>{scale} minute(s)</h1>

                    <Slider
                        value={scale}
                        style={{ width: "40%" }}
                        min={1}
                        max={maxQ}
                        onChange={(v) => setScale(v)}
                    />

                    <div style={{ marginTop: "80px" }} className={styles.divisor} />

                    <button style={{ marginTop: "40px" }} onClick={startPractice}>Start</button>
                    <p style={{ marginTop: "10px" }}>You will only see the questions selected for the flashcards</p>
                </div>
            ) : page === 3 ? (
                <div className={styles.timebar}>
                    <h1 style={{ marginBottom: "20px" }}>{scale} question(s)</h1>

                    <Slider
                        value={scale}
                        style={{ width: "40%" }}
                        min={1}
                        max={maxQ}
                        onChange={(v) => setScale(v)}
                    />

                    <div style={{ marginTop: "80px" }} className={styles.divisor} />

                    <button style={{ marginTop: "40px" }} onClick={startPractice}>Start</button>
                    <p style={{ marginTop: "10px" }}>You will only see the questions selected for the flashcards</p>
                </div>
            ) : undefined}
        </div>
    );
}