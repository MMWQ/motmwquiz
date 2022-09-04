import Link from "next/link";
import styles from "../styles/Flashcard.module.scss";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import axios from "axios";
import pg from "../lib/db";

export default function Flashcard({ un_member_state, observer_state, us_territory }) {
    let { data: session } = useSession();

    const loadSettings = () => {
        axios.get("/api/me");
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