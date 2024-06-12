import React from "react";
import { Loader } from "@phenom/react-ui-components";
import "./Loader.scss";

type Props = {
  show: boolean;
  message?: string;
};

export const InitialLoader = ({
  show,
  message = "Please wait...",
}: Props): JSX.Element => {

  return (
    <div className={show ? "loader" : "d-none"}>
        <Loader title={message} />
    </div>
  );
};
