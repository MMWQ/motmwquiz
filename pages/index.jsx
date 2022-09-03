import Link from "next/link";
import styles from "../styles/Home.module.scss"

export default function Home() {
    return (
        <div className={styles.page}>
            <h1 style={{textAlign: "center"}}>Directory:</h1>
        <div>
            <Link href="/flashcard"><button className={styles.flashcard}>Flashcard</button></Link>
            <Link href="/quiz"><button className={styles.quiz}>Quiz</button></Link>
            </div>
        </div>
    );
}

/**
 * Link 1 - /flashcard
 * Link 2 - /quiz
 */