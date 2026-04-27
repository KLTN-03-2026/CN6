import { invariant } from "framer-motion";
import { useEffect, useState } from "react";

interface loadProps {
  noiDung: String;
}

export default function Load({ noiDung }: loadProps) {
  const [Animation, setAnimtion] = useState(0);

  useEffect(() => {
    let intervalId: any;
    let timeoutID: any;
    intervalId = setInterval(() => {
      setAnimtion(1);
      timeoutID = setTimeout(() => {
        setAnimtion(0);
      }, 1000);
    }, 2000);
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (timeoutID) {
        clearTimeout(timeoutID);
      }
    };
  }, []);
  return (
    <section className="w-screen flex flex-col gap-6 justify-center items-center z-[1] h-full bg-white absolute top-0 left-[-10px] ">
      <div className={`w-[300px] h-[300px] `}>
        <img
          className={`w-full transition-all duration-500  ${Animation === 0 ? `rotate-[3deg]` : `rotate-[-3deg]`}`}
          src="/load.png"
          alt=""
        />
      </div>
      <p
        className={` font-bold text-[25px] transition-all duration-1000  ${Animation === 0 ? `opacity-[1]` : `opacity-[0.5]`}`}
      >
        {noiDung}
      </p>
    </section>
  );
}
