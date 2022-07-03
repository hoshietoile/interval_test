import styles from '../styles/Home.module.css'
import useSound from 'use-sound';
import sound1 from './../assets/sounds/snd01.mp3';
import sound2 from './../assets/sounds/snd02.mp3';
import sound3 from './../assets/sounds/snd03.mp3';
import { useMemo, useRef, useState } from 'react';

const sleep = (cb, timeout) => {
  return new Promise((resolve) => {
    const id = setTimeout(async () => {
      if (cb && typeof cb === 'function') await cb();
      resolve(id);
    }, timeout);
  })
}

const safeParseInt = (e) => {
  const v = e?.target?.value;
  if (typeof v !== 'string') return 0;
  const parsed = parseInt(v, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export default function Home() {
  const [soundInput, setSoundInput] = useState(1);
  const soundSrc = useMemo(() => {
    switch (soundInput) {
      case 1:
        return sound1;
      case 2:
        return sound2;
      case 3:
        return sound3;
    }
  }, [soundInput]);
  const [playSound] = useSound(soundSrc, { interrupt: false });

  // 状態管理
  const isStarted = useRef(false);
  const isStopped = useRef(false);
  const intervalRef = useRef(0);
  const timerId = useRef(null);
  const innerTimerId = useRef(null);

  const [isSleep, setIsSleep] = useState(false);
  const [currentInterval, setCurrentInterval] = useState(100);
  const [sleepInterval, setSleepInterval] = useState(100);

  // タイマークリア処理
  const clearInt = () => {
    clearTimeout(timerId.current);
    clearTimeout(innerTimerId.current);
  }

  // インターバル処理実行
  const interval = async () => {
    if (!isStarted.current || isStopped.current) return clearInt();
    intervalRef.current += 1;
    timerId.current = await sleep(async () => {
      setIsSleep(true);
      innerTimerId.current = await sleep(() => {
        if (!isStarted.current || isStopped.current) return clearInt();
        playSound();
      }, sleepInterval);
      setIsSleep(false);
    }, currentInterval);
    if (!isStarted.current || isStopped.current) return clearInt();
    interval();
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <span>
          {isSleep ? 'loading...' : 'show'}
        </span>
        <input type="number" value={currentInterval} onChange={(e) => setCurrentInterval(safeParseInt(e))} />
        <input type="number" value={sleepInterval} onChange={(e) => setSleepInterval(safeParseInt(e))} />
        <select value={soundInput} onChange={(e) => setSoundInput(safeParseInt(e))}>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
        </select>
        <button onClick={() => {
          isStarted.current = true;
          isStopped.current = false;
          interval();
        }}>Start</button>
        <button onClick={() => {
          isStarted.current = false;
          isStopped.current = true;
          clearInt();
        }}>Stop</button>
      </main>
    </div>
  )
}
