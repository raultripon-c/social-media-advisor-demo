import React from "react";
import campaignerIcon from "../../../assets/svg/Campaigner.svg";
import "./ContentClusterListCard.css";

interface ContentClusterListCardProps {
  title: string;
  contentTypes: string[];
  handleClick?: (cluster: any) => void;
}

const ContentClusterListCard: React.FC<ContentClusterListCardProps> = ({ title, contentTypes, handleClick }) => {
  return (
    <div className="content-cluster-list-card" onClick={handleClick}>
      <div className="content-cluster-list-card-title">
        <span>
          <img src={campaignerIcon} alt="campaign icon"></img>
          {title}
        </span>
      </div>
      <div>
        <h6 className="content-cluster-list-card-content-types-heading">Content Types:</h6>
      </div>
      <div className="content-cluster-list-card-content-types">
        <span>
          {contentTypes.map((contentype: string, index: number) => {
            if (index === contentTypes.length - 1) {
              return contentype;
            } else {
              return contentype + ", ";
            }
          })}
        </span>
      </div>
    </div>
  );
};

export default ContentClusterListCard;
