import React from "react";
import UnauthorizedImg from "../../assets/images/un-authorized.png";
import "./UnAuthorizedPage.scss";
import { useNavigate } from "react-router";
import {useDispatch} from "react-redux";
import { setCustomerTenants, setSelectedTenant } from "../../store/customer/actions";

const UnAuthorizedPage = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch=useDispatch()
  const backNavigation = () => {
    navigate("/");
    dispatch(setSelectedTenant({}));
    dispatch(setCustomerTenants([]));
    sessionStorage.removeItem("selectedApp");
  };

  return (
    <div className="unauthorized-box">
      <div>
        <img src={UnauthorizedImg} alt="un-authorized" />
        <div>
          <p className="No-accounts-created">Access denied or forbidden page.</p>
          <p className="small-text">
            Please contact the administrator if you think this is a mistake.
            <span className="small-text" onClick={backNavigation}>
              Go Back to Home
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnAuthorizedPage;
