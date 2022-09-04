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
    let [name, setName] = useState(undefined);

    useEffect(() => loadSettings(), []);

    const loadSettings = () => {
        if (session) axios.get("/api/me").then(resp => decodeSettings(resp.data));
        else if (localStorage.getItem("settings")) decodeSettings(JSON.parse(localStorage.getItem("settings")));
        else decodeSettings({ ums_front: 'map', ums_back: 'state', os_front: 'state', os_back: 'capital', ut_front: 'territory', ut_back: 'region', ums: (new Array(193).fill("1")).join(""), os: (new Array(2).fill("1")).join(""), ut: (new Array(5).fill("1")).join("") });
    }

    const decodeSettings = (s) => {
        if (s.name) setName(s.name);

        let { ums_front, ums_back, os_front, os_back, ut_front, ut_back, ums, os, ut } = s;

        setSettings({ ums_front, ums_back, os_front, os_back, ut_front, ut_back, ums, os, ut });
        localStorage.setItem("settings", JSON.stringify({ ums_front, ums_back, os_front, os_back, ut_front, ut_back, ums, os, ut }))
    }

    return (
        <div className={styles.page}>
            <div className={styles.nav}>
                {session
                    ? <button title="Log Out" onClick={() => signOut()}><Image src="/person-circle.svg" width={40} height={40}></Image></button>
                    : <button title="Log In" onClick={() => signIn("google")}><Image src="/google.svg" width={40} height={40}></Image></button>
                }

                <button title="Settings"><Image src="/gear-fill.svg" width={40} height={40}></Image></button>
            </div>

            <div className={styles.flashcard}>
                <button onClick={loadSettings}>hello world</button>
            </div>

            <div>

            </div>
        </div>
    );
}

export async function getStaticProps() {
    return { props: { un_member_state: [], observer_state: [], us_territory: [] }, revalidate: 3600 }
    let un_member_state = (await pg.query("SELECT * FROM un_member_state")).rows;
    let observer_state = (await pg.query("SELECT * FROM observer_state")).rows;
    let us_territory = (await pg.query("SELECT * FROM us_territory")).rows;

    return { props: { un_member_state, observer_state, us_territory }, revalidate: 3600 }
}