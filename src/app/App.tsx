import { useEffect, useState } from "react";
import "./App.css";
import "./globals.css";
import { Progress } from "@/components/ui/progress";

const bidWs = new WebSocket(`ws://localhost:3000/bid`);
const registerWs = new WebSocket(`ws://localhost:3000/register`);
const localStoredUserId = localStorage.getItem("userId");
const userId = localStoredUserId ? +localStoredUserId : Math.random();
localStorage.setItem("userId", userId.toString());

registerWs.onopen = function () {
  registerWs.send(
    JSON.stringify({
      userId: userId,
    })
  );
};

const bid = () => {
  bidWs.send(
    JSON.stringify({
      bid: 7,
    })
  );
};

function App() {
  const [playerBidValue, setPlayerBidValue] = useState(0);
  const [bidProgress, setBidProgress] = useState(0);
  const [bidTimeout, setBidTimeout] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endBid, setEndBid] = useState(false);
  const [winnerTeam, setWinnerTeam] = useState(null);

  useEffect(() => {
    registerWs.onmessage = (message) => {
      const data = JSON.parse(message.data);
      setPlayerBidValue(data.playerBidValue);
    };
    bidWs.onmessage = (message) => {
      const data = JSON.parse(message.data);
      console.log(data);
      if (!data.end && !data.winnerTeam) {
        setBidTimeout(data.timeout * 1000);
        setPlayerBidValue(data.playerBidValue);
        setBidProgress(0);
        setStartTime(Date.now());
      } else {
        setEndBid(true);
        setWinnerTeam(data.winnerTeam);
      }
    };
  }, []);

  useEffect(() => {
    if (!startTime || !bidTimeout) return;

    const intervalTime = 50;
    const timer = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min((elapsedTime / bidTimeout) * 100, 100);
      setBidProgress(progress);

      if (progress >= 100) {
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [bidTimeout, startTime]);

  return (
    <>
      {!endBid ? (
        <div>
          <Progress value={bidProgress} className="w-[100%] mt-4" />
          <button onClick={bid}>bid</button>
          <div>{playerBidValue}</div>
        </div>
      ) : (
        <p>{winnerTeam} wins</p>
      )}
    </>
  );
}

export default App;
