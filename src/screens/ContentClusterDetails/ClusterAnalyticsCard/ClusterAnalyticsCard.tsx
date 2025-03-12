import React, { useState } from "react";
import "./ClusterAnalyticsCard.css";

interface ClusterAnalyticsCardProps {
  title: string;
  count: number;
}

// This component is responsible for just showing details of the cluster
// No API Call is supposed to be made here
const ClusterAnalyticsCard: React.FC<ClusterAnalyticsCardProps> = ({ title, count = 0 }) => {
  return (
    <div className="cluster-analytics-card">
      <div className="cluster-analytics-card-title">{title}</div>
      <div className="cluster-analytics-card-count">{count}</div>
    </div>
  );
};

export default ClusterAnalyticsCard;
