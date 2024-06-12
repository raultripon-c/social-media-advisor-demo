import React from "react";
import { Button } from "@phenom/react-ui-components";
import { useDispatch } from "react-redux";
import { setCustomerTenants, setSelectedTenant } from "../../store/customer/actions";
interface Props {
  errorCode?: string;
  errorMessage?: string;
  navigate: any;
}

export const ErrorBoundary: React.FC<Props> = (props: Props) => {

  console.log("errorCode,errorMessage",props?.errorCode,props?.errorMessage)

  const dispatch = useDispatch();
  const backNavigation = () => {
    props.navigate("/");
    dispatch(setSelectedTenant({}));
    dispatch(setCustomerTenants([]));
    sessionStorage.removeItem("selectedApp");
  };
  return (
    <div className="row container">
      <div className="error-container">
        <p className="No-accounts-created"> {props.errorCode}</p>
       
        {/* <a
          className="Frame"
          href="/"
          onClick={() => goBack(props.navigate)}
        >
          Go Back to Home
        </a> */}
        <Button
          buttonType="secondary"
          size="small"
          text="Go Back to Home"
          onClick={backNavigation}
        />
      </div>
    </div>
  );
};

const goBack = async (navigate: any) => {
  //TODO change this navigation based on the base app
  return navigate("/");
};

ErrorBoundary.defaultProps = {
  errorCode: "Oops ! Something went wrong.",
  errorMessage:
    "",
};
