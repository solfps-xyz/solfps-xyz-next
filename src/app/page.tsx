import RaylibGame from "@/components/RaylibGame";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <RaylibGame 
          gamePath="/game"
          width={800}
          height={450}
        />
      </main>
    </div>
  );
}
