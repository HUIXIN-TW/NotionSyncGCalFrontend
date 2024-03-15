"use client";

import Button from "@components/button/Button";
import { useRouter } from "next/navigation";

const Home = () => {
  const router = useRouter();
  return (
    <div className="home">
      <div className="welcome">
        <h1>Welcome to WhatToEat!</h1>
        <Button
          text="Let's Get Started"
          type="button"
          className="black_btn"
          onClick={() => {
            router.push("/authflow");
          }}
        ></Button>
      </div>
    </div>
  );
};

export default Home;
