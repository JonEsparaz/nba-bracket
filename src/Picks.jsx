import React, { useEffect, useState } from "react";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import firebase from "./firebase";
import "./Picks.css";

const db = firebase.firestore();
const auth = firebase.auth();

export default function Picks() {
  const [round, setRound] = useState(1);
  const [series, setSeries] = useState([]);
  const [picks, setPicks] = useState({});
  const [mode, setMode] = useState("picks");
  const [results, setResults] = useState([]);
  const [allSeries, setAllSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [locked, setLocked] = useState([]);
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(new Date());
    }, 1000 * 60 * 5);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    async function query() {
      setLoading(true);
      try {
        const data = await db.collection("lock").doc("lock").get();
        setLocked(data.data().lockedRounds);
      } catch (e) {
        console.debug(e);
      }
      setLoading(false);
    }
    query();
  }, []);

  useEffect(() => {
    async function query() {
      setLoading(true);
      try {
        const series = [];
        const p = {};
        const data = await db
          .collection("series-2021")
          .where("round", "==", round)
          .get();
        data.forEach((i) => {
          series.push({ ...i.data(), id: i.id });
          p[i.id] = { name: i.data().teams[0].name, games: 4 };
        });
        setPicks(p);
        setSeries(series);
        try {
          const data = await db
            .collection("picks-2021")
            .doc(auth.currentUser.uid)
            .get();
          if (data.data())
            setPicks((prevState) => {
              return { ...prevState, ...data.data().picks };
            });
        } catch (e) {
          console.debug(e);
        }
      } catch (e) {
        console.debug(e);
      }
      setLoading(false);
    }
    query();
  }, [round]);

  useEffect(() => {
    async function query() {
      setLoading(true);
      try {
        const results = [];
        const data = await db.collection("picks-2021").get();
        data.forEach((i) => {
          results.push(i.data());
        });
        setResults(results);
      } catch (e) {
        console.debug(e);
      }

      try {
        const all = [];
        const data = await db.collection("series-2021").get();
        data.forEach((i) => {
          all.push({ ...i.data(), id: i.id });
        });
        setAllSeries(all);
      } catch (e) {
        console.debug(e);
      }
      setLoading(false);
    }
    if (mode === "score") query();
  }, [mode]);

  function handleTeamChange(val, id) {
    const temp = picks[id];
    temp["name"] = val;
    setPicks({ ...picks, [id]: temp });
  }

  function handleGamesChange(val, id) {
    const temp = picks[id];
    temp["games"] = parseInt(val, 10);
    setPicks({ ...picks, [id]: temp });
  }

  function checkIfCorrect(series, pick, games) {
    if (series.games === games && series.winner === pick) {
      return 2;
    }

    if (series.winner === pick) {
      return 1;
    }

    return 0;
  }

  function calculateScore(account) {
    let score = 0;

    allSeries.forEach((series) => {
      const data = account.picks[series.id];

      if (!data) {
        return 0;
      }

      if (data.games === series.games && data.name === series.winner) {
        score += 2;
      } else if (data.name === series.winner) {
        score += 1;
      }
    });
    return score;
  }

  const showSavedIcon = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const submit = async () => {
    try {
      await db
        .collection("picks-2021")
        .doc(auth.currentUser.uid)
        .set(
          {
            picks: picks,
            name: auth.currentUser.displayName,
            updated: new Date(),
          },
          { merge: true }
        );
      showSavedIcon();
    } catch (e) {
      console.debug(e);
    }
  };

  if (loading) {
    return <div>loading</div>;
  }

  switch (mode) {
    case "picks":
      return (
        <div className="Container">
          <h1>
            Esparaz NBA Playoff Bracket 2021{" "}
            <span role="img" aria-labelledby="basketball">
              🏀
            </span>
          </h1>
          <div className="Menu">
            <button
              className={mode === "picks" ? "Selected" : ""}
              onClick={() => setMode("picks")}
            >
              Make Picks
            </button>
            <button
              className={mode === "score" ? "Selected" : ""}
              onClick={() => setMode("score")}
            >
              Check Results
            </button>
            <button onClick={() => auth.signOut()}>
              Log Out
              <ExitToAppIcon style={{ marginLeft: 6 }} />
            </button>
          </div>
          <div className="PicksMenu">
            <button
              className={round === 1 ? "Selected" : ""}
              onClick={() => setRound(1)}
            >
              Round 1
            </button>
            <button
              className={round === 2 ? "Selected" : ""}
              onClick={() => setRound(2)}
            >
              Round 2
            </button>
            <button
              className={round === 3 ? "Selected" : ""}
              onClick={() => setRound(3)}
            >
              Conference Finals
            </button>
            <button
              className={round === 4 ? "Selected" : ""}
              onClick={() => setRound(4)}
            >
              NBA Finals
            </button>
          </div>
          <table>
            <tbody>
              {series
                .sort((a, b) => a.teams[0].seed - b.teams[0].seed)
                .sort((a, b) => a.conference.localeCompare(b.conference))
                .map((data, index) => {
                  return (
                    <tr key={index} style={{ height: 50 }}>
                      <td
                        style={{
                          border: "1px solid black",
                          textAlign: "center",
                        }}
                      >
                        {data.teams[0].seed} {data.teams[0].city}{" "}
                        {data.teams[0].name}
                      </td>
                      <td
                        style={{
                          border: "1px solid black",
                          width: 20,
                          textAlign: "center",
                        }}
                      >
                        vs
                      </td>
                      <td
                        style={{
                          border: "1px solid black",
                          textAlign: "center",
                        }}
                      >
                        {data.teams[1].seed} {data.teams[1].city}{" "}
                        {data.teams[1].name}
                      </td>
                      <td
                        style={{
                          border: "1px solid black",
                          textAlign: "center",
                        }}
                      >
                        <select
                          disabled={data.tipoff.toDate() < dateTime}
                          value={picks[data.id].name}
                          onChange={(e) =>
                            handleTeamChange(e.target.value, data.id)
                          }
                        >
                          <option value={data.teams[0].name}>
                            {data.teams[0].name}
                          </option>
                          <option value={data.teams[1].name}>
                            {data.teams[1].name}
                          </option>
                        </select>
                      </td>
                      <td
                        style={{
                          border: "1px solid black",
                          textAlign: "center",
                        }}
                      >
                        <select
                          disabled={data.tipoff.toDate() < dateTime}
                          value={picks[data.id].games}
                          onChange={(e) =>
                            handleGamesChange(e.target.value, data.id)
                          }
                        >
                          <option value={4}>4</option>
                          <option value={5}>5</option>
                          <option value={6}>6</option>
                          <option value={7}>7</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          {locked.includes(round) ? <div>Submissions are locked</div> : null}
          <button
            disabled={locked.includes(round)}
            className="Save"
            onClick={submit}
          >
            SAVE{saved ? "D" : ""}
            <span role="img" aria-labelledby="checkmark">
              {saved ? "✅" : ""}
            </span>
          </button>
        </div>
      );
    case "score":
      if (results.length === 1 && !results[0].picks) {
        return (
          <div className="Container">
            <h1>
              Esparaz NBA Playoff Bracket 2021{" "}
              <span role="img" aria-labelledby="basketball">
                🏀
              </span>
            </h1>
            <div className="Menu" style={{ marginBottom: "12px" }}>
              <button
                className={mode === "picks" ? "Selected" : ""}
                onClick={() => setMode("picks")}
              >
                Make Picks
              </button>
              <button
                className={mode === "score" ? "Selected" : ""}
                onClick={() => setMode("score")}
              >
                Check Results
              </button>
              <button onClick={() => auth.signOut()}>
                Log Out
                <ExitToAppIcon style={{ marginLeft: 6 }} />
              </button>
            </div>

            <div>no picks yet...</div>
          </div>
        );
      }
      return (
        <div className="Container">
          <h1>
            Esparaz NBA Playoff Bracket 2021{" "}
            <span role="img" aria-labelledby="basketball">
              🏀
            </span>
          </h1>
          <div className="Menu" style={{ marginBottom: "12px" }}>
            <button
              className={mode === "picks" ? "Selected" : ""}
              onClick={() => setMode("picks")}
            >
              Make Picks
            </button>
            <button
              className={mode === "score" ? "Selected" : ""}
              onClick={() => setMode("score")}
            >
              Check Results
            </button>
            <button onClick={() => auth.signOut()}>
              Log Out
              <ExitToAppIcon style={{ marginLeft: 6 }} />
            </button>
          </div>
          <table style={{ marginBottom: "32px" }}>
            <tbody>
              <tr>
                <th style={{ border: "1px solid black" }}>Score</th>
                <th style={{ border: "1px solid black" }}>Name</th>
                {allSeries
                  .sort((a, b) => a.teams[0].seed - b.teams[0].seed)
                  .sort((a, b) => a.conference.localeCompare(b.conference))
                  .sort((a, b) => b.round - a.round)
                  .map((data, index) => {
                    return (
                      <th style={{ border: "1px solid black" }} key={index}>
                        {data.round === 4 ? "🏆" : ""}
                        {data.teams[0].name} vs {data.teams[1].name}
                      </th>
                    );
                  })}
              </tr>
              {results.map((account, index) => {
                return (
                  <tr key={index}>
                    <td style={{ border: "1px solid black" }}>
                      {calculateScore(account)}
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      {account.name}
                    </td>
                    {allSeries
                      .sort((a, b) => a.teams[0].seed - b.teams[0].seed)
                      .sort((a, b) => a.conference.localeCompare(b.conference))
                      .sort((a, b) => b.round - a.round)
                      .map((data, index) => {
                        if (!account.picks[data.id]) {
                          return (
                            <td
                              style={{ border: "1px solid black" }}
                              key={index}
                            />
                          );
                        }

                        const test = checkIfCorrect(
                          data,
                          account.picks[data.id].name,
                          account.picks[data.id].games
                        );
                        return (
                          <td
                            className={
                              !data.winner
                                ? "Unknown"
                                : test === 0
                                ? "Wrong"
                                : test === 1
                                ? "Ok"
                                : "Correct"
                            }
                            style={{ border: "1px solid black" }}
                            key={index}
                          >
                            {account.picks[data.id].name} in{" "}
                            {account.picks[data.id].games}
                          </td>
                        );
                      })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {results.map((account, index) => {
            return (
              <div style={{ textAlign: "left" }} key={index}>
                {account.name} last updated:{" "}
                {account.updated.toDate().toString()}
              </div>
            );
          })}
        </div>
      );
    default:
      return <div>something went wrong</div>;
  }
}
