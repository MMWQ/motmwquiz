import Link from "next/link";
import styles from "../styles/Flashcard.module.scss";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import axios from "axios";
import pg from "../lib/db";
import { useEffect, useState } from "react";
import Select from 'react-select';
import Toggle from "react-toggle";

export default function Flashcard({ un_member_state, observer_state, us_territory }) {
    let { data: session } = useSession();

    let [settings, setSettings] = useState(undefined);
    let [flashcards, setFlashcards] = useState([]);
    let [fcIndex, setFcIndex] = useState(0);
    let [overlay, setOverlay] = useState(false);

    useEffect(() => loadSettings(), []);

    const shuffle = () => setFlashcards(shuffleArr([...flashcards]));

    const shuffleArr = (array) => {
        let currentIndex = array.length, randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    const setCards = (settings) => {
        let { ums, os, ut } = settings;
        let tmp = [];

        tmp = tmp.concat(un_member_state.filter((v, i) => ums.charAt(i) === '1').map(v => ({ ...v, type: "ums" })));
        tmp = tmp.concat(observer_state.filter((v, i) => os.charAt(i) === '1').map(v => ({ ...v, type: "os" })));
        tmp = tmp.concat(us_territory.filter((v, i) => ut.charAt(i) === '1').map(v => ({ ...v, type: "ut" })));

        setFlashcards(tmp.map(v => ({ ...v, flipped: false })));
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
        setCards({ ums, os, ut });
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

    function changeFace(table, { value }) {
        settings[table] = value;

        if (session) axios.post("/api/setting", { table, value });
        localStorage.setItem("settings", JSON.stringify(settings));
    }

    function changeToggle(table, index) {
        let tmp = settings[table] + "";
        tmp = tmp.match(/.{1}/g).map((v, i) => i === index ? v === "0" ? "1" : "0" : v).join("");
        settings[table] = tmp;

        if (session) axios.post("/api/setting", { table, value: tmp });
        localStorage.setItem("settings", JSON.stringify(settings));
    }

    function toggleUms() {
        let y = settings.ums.match(/.{1}/g).reduce((a, b) => a + (b === "1" ? 1 : 0), 0);
        let n = 193 - y;

        console.log(y);
        if (y <= n) settings.ums = (new Array(193).fill("1")).join("");
        else settings.ums = (new Array(193).fill("0")).join("");

        if (session) axios.post("/api/setting", { table: "ums", value: settings.ums });
        localStorage.setItem("settings", JSON.stringify(settings));

        setOverlay(false);
    }

    function toggleOs() {
        let y = settings.os.match(/.{1}/g).reduce((a, b) => a + (b === "1" ? 1 : 0), 0);
        let n = 2 - y;

        if (y <= n) settings.os = (new Array(2).fill("1")).join("");
        else settings.os = (new Array(2).fill("0")).join("");

        if (session) axios.post("/api/setting", { table: "os", value: settings.os });
        localStorage.setItem("settings", JSON.stringify(settings));

        setOverlay(false);
    }

    function toggleUt() {
        let y = settings.ut.match(/.{1}/g).reduce((a, b) => a + (b === "1" ? 1 : 0), 0);
        let n = 5 - y;

        if (y <= n) settings.ut = (new Array(5).fill("1")).join("");
        else settings.ut = (new Array(5).fill("0")).join("");

        if (session) axios.post("/api/setting", { table: "ut", value: settings.ut });
        localStorage.setItem("settings", JSON.stringify(settings));

        setOverlay(false);
    }

    return (
        <>
            {overlay && settings ? (
                <div className={styles.settings} onClick={() => setOverlay(false)}>
                    <div className={styles.wrapper} onClick={(e) => e.stopPropagation()}>
                        <h3>UN Member States</h3>

                        <div className={styles.select}>
                            <div className={styles.selectw}>
                                <p>Front:</p>
                                <Select onChange={(v) => changeFace("ums_front", v)} styles={{ container: (p) => ({ ...p, width: "150px" }) }} defaultValue={({ value: settings?.ums_front, label: settings.ums_front }) ?? "map"} options={[
                                    { value: 'state', label: 'state' },
                                    { value: 'capital', label: 'capital' },
                                    { value: 'region', label: 'region' },
                                    { value: 'independence_year', label: 'independence_year' },
                                    { value: 'independence_from', label: 'independence_from' },
                                    { value: 'map', label: 'map' },
                                ]} />
                            </div>

                            <div className={styles.selectw}>
                                <p>Back:</p>
                                <Select onChange={(v) => changeFace("ums_back", v)} styles={{ container: (p) => ({ ...p, width: "150px" }) }} defaultValue={({ value: settings?.ums_back, label: settings.ums_back }) ?? "capital"} options={[
                                    { value: 'state', label: 'state' },
                                    { value: 'capital', label: 'capital' },
                                    { value: 'region', label: 'region' },
                                    { value: 'independence_year', label: 'independence_year' },
                                    { value: 'independence_from', label: 'independence_from' },
                                    { value: 'map', label: 'map' },
                                ]} />
                            </div>
                        </div>

                        <div className={styles.all}>
                            <button onClick={toggleUms}>Toggle All</button>
                        </div>

                        <div className={styles.lis}>
                            {settings.ums.match(/.{1}/g).map((s, i) => (
                                <div className={styles.tgb}>
                                    <p title={un_member_state[i].state}>{un_member_state[i].state}</p>
                                    <Toggle onChange={() => changeToggle("ums", i)} defaultChecked={s === "1"} />
                                </div>
                            ))}
                        </div>

                        <h3 style={{ marginTop: "30px" }}>Observer States</h3>

                        <div className={styles.select}>
                            <div className={styles.selectw}>
                                <p>Front:</p>
                                <Select onChange={(v) => changeFace("os_front", v)} styles={{ container: (p) => ({ ...p, width: "150px" }) }} defaultValue={({ value: settings?.os_front, label: settings.os_front }) ?? "state"} options={[
                                    { value: 'state', label: 'state' },
                                    { value: 'capital', label: 'capital' },
                                    { value: 'region', label: 'region' },
                                    { value: 'independence_year', label: 'independence_year' },
                                    { value: 'status', label: 'status' },
                                ]} />
                            </div>

                            <div className={styles.selectw}>
                                <p>Back:</p>
                                <Select onChange={(v) => changeFace("os_back", v)} styles={{ container: (p) => ({ ...p, width: "150px" }) }} defaultValue={({ value: settings?.os_back, label: settings.os_back }) ?? "capital"} options={[
                                    { value: 'state', label: 'state' },
                                    { value: 'capital', label: 'capital' },
                                    { value: 'region', label: 'region' },
                                    { value: 'independence_year', label: 'independence_year' },
                                    { value: 'status', label: 'status' },
                                ]} />
                            </div>
                        </div>

                        <div className={styles.all}>
                            <button onClick={toggleOs}>Toggle All</button>
                        </div>

                        <div className={styles.lis}>
                            {settings.os.match(/.{1}/g).map((s, i) => (
                                <div className={styles.tgb}>
                                    <p title={observer_state[i].state}>{observer_state[i].state}</p>
                                    <Toggle onChange={() => changeToggle("os", i)} defaultChecked={s === "1"} />
                                </div>
                            ))}
                        </div>

                        <h3 style={{ marginTop: "30px" }}>US Territories</h3>

                        <div className={styles.select}>
                            <div className={styles.selectw}>
                                <p>Front:</p>
                                <Select onChange={(v) => changeFace("ut_front", v)} styles={{ container: (p) => ({ ...p, width: "150px" }) }} defaultValue={({ value: settings?.ut_front, label: settings.ut_front }) ?? "territory"} options={[
                                    { value: 'territory', label: 'territory' },
                                    { value: 'region', label: 'region' },
                                    { value: 'status', label: 'status' },
                                ]} />
                            </div>

                            <div className={styles.selectw}>
                                <p>Back:</p>
                                <Select onChange={(v) => changeFace("ut_back", v)} styles={{ container: (p) => ({ ...p, width: "150px" }) }} defaultValue={({ value: settings?.ut_back, label: settings.ut_back }) ?? "region"} options={[
                                    { value: 'territory', label: 'territory' },
                                    { value: 'region', label: 'region' },
                                    { value: 'status', label: 'status' },
                                ]} />
                            </div>
                        </div>

                        <div className={styles.all}>
                            <button onClick={toggleUt}>Toggle All</button>
                        </div>

                        <div className={styles.lis}>
                            {settings.ut.match(/.{1}/g).map((s, i) => (
                                <div className={styles.tgb}>
                                    <p title={us_territory[i].territory}>{us_territory[i].territory}</p>
                                    <Toggle onChange={() => changeToggle("ut", i)} defaultChecked={s === "1"} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : undefined}

            <div className={styles.page}>
                <div className={styles.nav}>
                    <Link href="/leaderboard"><button title="Leaderboard"><Image src="/bar-chart-line-fill.svg" width={40} height={40} /></button></Link>

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

                                <p style={{ color: flashcards[fcIndex].flipped ? "white" : "black" }}>{flashcards[fcIndex].flipped ? settings[flashcards[fcIndex].type + "_back"] : settings[flashcards[fcIndex].type + "_front"]} of {flashcards[fcIndex].type === "ums" ? "un member states" : flashcards[fcIndex].type === "os" ? "observer states" : "us territory"}</p>
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

                    <Link href="/quiz"><button style={{ marginLeft: "10px" }} title="Quiz" onClick={() => shuffle(settings)}><Image src="/check2-square.svg" width={40} height={40} /></button></Link>
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