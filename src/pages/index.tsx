import { FormEvent, useContext, useState } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import styles from "../styles/Home.module.css";
import { withSSRGuest } from "@/utils/withSSRGuest";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signIn } = useContext(AuthContext);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const data = {
      email,
      password,
    };

    await signIn(data);
  }

  return (
    <main className={styles.main}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Entrar
        </button>
      </form>
    </main>
  );
}

export const getServerSideProps = withSSRGuest(
  async (ctx) => {
    return {
      props: {},
    };
  }
);
