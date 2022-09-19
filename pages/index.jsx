import Link from "next/link";
import styles from "../styles/Flashcard.module.scss";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import axios from "axios";
import pg from "../lib/db";
import { useEffect, useState } from "react";

export default function Flashcard({ un_member_state, observer_state, us_territory }) {
    let { data: session } = useSession();

    let [settings, setSettings] = useState(undefined);
    let [flashcards, setFlashcards] = useState([]);
    let [fcIndex, setFcIndex] = useState(0);
    let [overlay, setOverlay] = useState(false);

    useEffect(() => loadSettings(), []);

    const shuffleArr = (array) => {
        let currentIndex = array.length, randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    const shuffle = (settings) => {
        let { ums, os, ut } = settings;
        let tmp = [];

        tmp = tmp.concat(un_member_state.filter((v, i) => ums.charAt(i) === '1').map(v => ({ ...v, type: "ums" })));
        tmp = tmp.concat(observer_state.filter((v, i) => os.charAt(i) === '1').map(v => ({ ...v, type: "os" })));
        tmp = tmp.concat(us_territory.filter((v, i) => ut.charAt(i) === '1').map(v => ({ ...v, type: "ut" })));

        setFlashcards(shuffleArr(tmp.map(v => ({ ...v, flipped: false }))));
    }

    const loadSettings = () => {
        if (session) axios.get("/api/me").then(resp => decodeSettings(resp.data));
        else if (localStorage.getItem("settings")) decodeSettings(JSON.parse(localStorage.getItem("settings")));
        else decodeSettings({ ums_front: 'state', ums_back: 'capital', os_front: 'state', os_back: 'capital', ut_front: 'region', ut_back: 'territory', ums: (new Array(193).fill("1")).join(""), os: (new Array(2).fill("1")).join(""), ut: (new Array(5).fill("1")).join("") });
    }

    const decodeSettings = (s) => {
        let { ums_front, ums_back, os_front, os_back, ut_front, ut_back, ums, os, ut } = s;

        setSettings({ ums_front, ums_back, os_front, os_back, ut_front, ut_back, ums, os, ut });
        localStorage.setItem("settings", JSON.stringify({ ums_front, ums_back, os_front, os_back, ut_front, ut_back, ums, os, ut }));
        shuffle({ ums, os, ut });
    }

    const flipCard = () => {
        let tmp = [...flashcards];
        tmp[fcIndex].flipped = !tmp[fcIndex].flipped;
        setFlashcards(tmp);
    }

    function FC() {
        let k = flashcards[fcIndex].flipped
            ? settings[flashcards[fcIndex].type + "_back"]
            : settings[flashcards[fcIndex].type + "_front"];

        if (k === "map") return <Image src={flashcards[fcIndex].map} width={400} height={400} />
        else return <h1 style={{ color: flashcards[fcIndex].flipped ? "white" : "black" }}>{flashcards[fcIndex][k]}</h1>
    }

    return (
        <>
            <div className={styles.settings} style={{ display: overlay ? "block" : "none" }} onClick={() => setOverlay(false)}>
                <div className={styles.wrapper}>

                </div>
            </div>

            <div className={styles.page}>
                <div className={styles.nav}>
                <button title="ScoreBoard" onClick={() => setOverlay(true)}><Image src="/scoreboard.svg" width={40} height={40}/></button>

                    {session
                        ? <button title="Log Out" onClick={() => signOut()}><Image src="/person-circle.svg" width={40} height={40} /></button>
                        : <button title="Log In" onClick={() => signIn("google")}><Image src="/google.svg" width={40} height={40} /></button>
                    }

                    <button title="Settings" onClick={() => setOverlay(true)}><Image src="/gear-fill.svg" width={40} height={40} /></button>
                </div>

                <main className={styles.main}>
                    <div className={styles.marg}>
                        {fcIndex > 0 ? <button onClick={() => setFcIndex(fcIndex - 1)}>
                            <Image src="/caret-left.svg" width={80} height={80} />
                        </button> : undefined}
                    </div>

                    <div className={styles.flashcard} onClick={flipCard}>
                        {flashcards.length > 0 ?
                            <>
                                <FC />

                                <p style={{ color: flashcards[fcIndex].flipped ? "white" : "black" }}>{flashcards[fcIndex].flipped ? settings[flashcards[fcIndex].type + "_front"] : settings[flashcards[fcIndex].type + "_back"]} of {flashcards[fcIndex].type === "ums" ? "un member states" : flashcards[fcIndex].type === "os" ? "observer states" : "us territory"}</p>
                            </>
                            : undefined}
                    </div>

                    <div className={styles.marg}>
                        {fcIndex < flashcards.length - 1 ? <button onClick={() => setFcIndex(fcIndex + 1)}>
                            <Image src="/caret-right.svg" width={80} height={80} />
                        </button> : undefined}
                    </div>
                </main>

                <div className={styles.menu}>
                    <button title="Shuffle" onClick={() => shuffle(settings)}><Image src="/shuffle.svg" width={40} height={40} /></button>
                </div>
            </div>
        </>
    );
}

export async function getStaticProps() {
    let un_member_state = (await pg.query("SELECT * FROM un_member_state")).rows;
    let observer_state = (await pg.query("SELECT * FROM observer_state")).rows;
    let us_territory = (await pg.query("SELECT * FROM us_territory")).rows;

    return { props: { un_member_state, observer_state, us_territory }, revalidate: 3600 }
}