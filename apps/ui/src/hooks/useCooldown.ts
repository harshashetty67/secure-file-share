import { useEffect, useRef, useState } from "react";

export function useCooldown(seconds: number) {
    const [remaining, setRemaining] = useState(0);
    const timerRef = useRef<number | null>(null);

    useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);

    const start = () => {
        setRemaining(seconds);
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = window.setInterval(() => {
            setRemaining((r) => {
                if (r <= 1) {
                    if (timerRef.current) window.clearInterval(timerRef.current);
                    return 0;
                }
                return r - 1;
            });
        }, 1000);
    };

    return { remaining, start, active: remaining > 0 };
}