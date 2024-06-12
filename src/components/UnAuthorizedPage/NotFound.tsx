import React, { useEffect, useState } from "react";
import './UnAuthorizedPage.scss';

import UnauthorizedImg from '../../assets/images/un-authorized.png';

const NotFoundPage = (): JSX.Element => {
  const [isPageContentExists,setIsPageContentExists] = useState(false);
  useEffect(() => {
    let PageContent = document.getElementsByClassName("app-content")[0].childElementCount;
    !PageContent && setIsPageContentExists(true);
  }, []);
  return (
    <>

    { isPageContentExists && <div className="unauthorized-box">
      <div className="">
        <img src={UnauthorizedImg} alt="un-authorized image" />
        <div>
          <p className="No-accounts-created"> Page Not Found.</p>
          <p className="small-text">
            Please check the URL or Go back to the <a className="small-text" href="/"> Home page </a>.
          </p>
          
        </div>
      </div>
    </div>
        }
    </>
  );
};

export default NotFoundPage;
