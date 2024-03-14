"use client";

import Button from "@components/Button";
import { useRouter } from "next/navigation";

const Home = () => {
  const router = useRouter();
  return (
    <div className="home">
      <h1>Welcome to the Modern Login Page!</h1>
      <Button
        text="Let's Get Started"
        type="button"
        className="black_btn"
        onClick={() => {
          router.push("/authflow");
        }}
      ></Button>
    </div>
  );
};

export default Home;
