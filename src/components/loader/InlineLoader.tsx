import { Loader } from "@phenom/react-ui-components";
import React from "react";
import "./Loader.scss";

interface Props {
  loadingMessage?: string;
}

const Loading = ({ loadingMessage = "Loading..." }: Props): JSX.Element => {
  return (
    <div className="inline-loading">
      <Loader title={loadingMessage}/>
    </div>
  );
};

export default Loading;
