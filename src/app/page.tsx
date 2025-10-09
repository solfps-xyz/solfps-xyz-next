import UnityGame from "@/components/UnityGame";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <UnityGame 
          buildPath="/unity/Build"
          width="100%"
          height="100vh"
        />
      </main>
    </div>
  );
}
