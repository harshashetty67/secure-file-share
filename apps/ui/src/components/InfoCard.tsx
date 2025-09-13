import "../styles/InfoCard.css";
import React from "react";

type Props = { title: string; desc: string; delay?: number };


export default function InfoCard({ title, desc, delay = 0 }: Props) {
    const style: React.CSSProperties = { animationDelay: `${delay}ms` };
    return (
        <div className="infoCard" style={style}>
            <h3>{title}</h3>
            <p>{desc}</p>
        </div>
    );
}