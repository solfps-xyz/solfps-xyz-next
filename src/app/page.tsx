import RaylibGame from "@/components/RaylibGame";
import AuthGuard from "@/components/AuthGuard";
import UserProfile from "@/components/UserProfile";
import BridgeTest from "@/components/BridgeTest";
import { SolanaGameBridgeTest } from "@/components/SolanaGameBridgeTest";
import styles from "./page.module.css";

export default function Home() {
  return (
    <AuthGuard>
      <div className={styles.page}>
        <UserProfile />
        <BridgeTest />
        <SolanaGameBridgeTest />
        <main className={styles.main}>
          <RaylibGame gamePath="/game" width={800} height={450} />
        </main>
      </div>
    </AuthGuard>
  );
}
