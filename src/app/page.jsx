"use client";

import { useRouter } from "next/navigation";

const Home = () => {
  const router = useRouter();
  return (
    <section>
      <h1>Welcome to the Modern Login Page!</h1>
      <span>Login Option</span>
      <button onClick={() => router.push("/login")}>Login</button>
    </section>
  );
};

export default Home;
