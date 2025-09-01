import type { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

const FeatureCard = ({ icon, title, children }: FeatureCardProps) => (
  <div className="feature-card">
    <div className="feature-icon-container">{icon}</div>
    <h3 className="feature-title">{title}</h3>
    <p className="feature-description">{children}</p>
  </div>
);

export default FeatureCard;