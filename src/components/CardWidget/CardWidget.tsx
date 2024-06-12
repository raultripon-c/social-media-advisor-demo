import React, { useEffect, useState } from "react";
import info from "../../assets/images/info.svg";
import { Button, Loader } from "@phenom/react-ui-components";
import expandImg from "../../assets/images/dashboard/expand.svg";
import { API } from "../../utils/api";
import _ from "lodash";
import "./CardWidget.scss";
import { getDataFromResponse } from "../../layout/dashBoard/utils";
import { LoaderSmall } from "../../components-ui/inlineLoader/LoaderSmall";

export const CardWidget = (props: any) => {
  const { widgetData, isLoading } = props;

  const [widgetDataObj, setWidgetDataObj] = useState(widgetData);
  const [showMore, setShowMore] = useState(false);
  const [response, setResponse] = useState();

  useEffect(() => {
    mainResponseValidator(widgetData);
  }, []);

  async function mainResponseValidator(widgetObj: any) {
    const { apiconfig } = widgetObj || {};
    if (!apiconfig) {
      setWidgetDataObj(widgetObj);
      return;
    }
    const { url, payload, method, headers } = apiconfig;
    let { unformattedResponse } = apiconfig;
    try {
      if (!unformattedResponse) {
        unformattedResponse = (
          await API[method.toLowerCase()](url, payload, headers)
        ).data.data;
      }
    } catch (err) {
      if (apiconfig.apiFailure) {
        apiconfig.apiFailure();
      }
      setWidgetDataObj({});

      console.error("Error making API call:", err);
      return;
    }
    let response = unformattedResponse;

    if (apiconfig.responseFormatter) {
      response = apiconfig.responseFormatter(response);
    }
    setResponse(response);
    if (apiconfig.onResponse) {
      apiconfig.onResponse(response);
    }
    if ((Array.isArray(response) && !response.length) || !response) {
      setWidgetDataObj({});
      return;
    }

    const tempjsonDataObj = ResponseResolver(widgetObj, response);
    setWidgetDataObj(tempjsonDataObj);
    if (widgetObj.showmoreLimit) {
      setShowMore(tempjsonDataObj.card.length > widgetObj.showmoreLimit - 1);
    }
  }

  return (
    widgetDataObj && (
      <div className={`widget-container ${widgetDataObj?.cardType}`}>
        {widgetDataObj?.cardType !== "list" ? (
          <>
            <div className="widget-header">
              <div className="widget-title ">
                <div className="title">{widgetDataObj.heading}</div>
                {widgetDataObj.tooltip && (
                  <a href="#" title={widgetDataObj.tooltip}>
                    <img src={info} className="info-icon" />
                  </a>
                )}
                {widgetDataObj.count && (
                  <span className="section-count">{widgetDataObj.count}</span>
                )}
              </div>
              {widgetDataObj.link && (
                <div
                  className="widget-redirect"
                  onClick={widgetDataObj.link.onClick}
                >
                  <a
                    className="widget-link"
                    href={widgetDataObj.link.url}
                    onClick={widgetDataObj.link.onclick}
                    target="_blank"
                  >
                    <div className="redirect-text">
                      {widgetDataObj.link.text}
                    </div>
                    <img
                      className="redirect-img"
                      src={widgetDataObj.link.image}
                    />
                  </a>
                </div>
              )}
            </div>
            {widgetDataObj.cardType === "detailed" &&
              ((!widgetDataObj?.apiconfig?.response &&
                widgetDataObj?.apiconfig) ||
              isLoading ? (
                <Loader />
              ) : (
                DetailedView(widgetDataObj, showMore, setShowMore)
              ))}
            {widgetDataObj.cardType === "summary" &&
              (widgetDataObj?.apiconfig &&
              !widgetDataObj?.apiconfig?.response ? (
                <Loader />
              ) : (
                SummaryView(widgetDataObj)
              ))}
          </>
        ) : (
          ListView(widgetDataObj, showMore, setShowMore)
        )}
      </div>
    )
  );
};

export const ResponseResolver = (widgetObj: any, response: any) => {
  let tempjsonDataObj = _.cloneDeep(widgetObj);
  tempjsonDataObj.apiconfig.response = response;

  if (Array.isArray(response)) {
    if (tempjsonDataObj.count === null) {
      tempjsonDataObj.count = response.length;
    }

    tempjsonDataObj.card = response.map((item) => {
      const vari = tempjsonDataObj.card.tiles.map((tileObj: any) => {
        let temptileobj = _.cloneDeep(tileObj);
        if (temptileobj.type !== "button") {
          temptileobj.titles = temptileobj.titles.map((titleObj: any) => ({
            ...titleObj,
            text: titleObj.formatter
              ? titleObj.formatter(item)
              : getDataFromResponse(item, titleObj.text),
            image: titleObj.image
              ? getDataFromResponse(item, titleObj.image)
              : null,
          }));
          temptileobj.subtitles = temptileobj.subtitles.map(
            (subtitleObj: any) => ({
              ...subtitleObj,
              text: subtitleObj.formatter
                ? subtitleObj.formatter(item)
                : getDataFromResponse(item, subtitleObj.text),
              image: subtitleObj.image
                ? getDataFromResponse(item, subtitleObj.image)
                : null,
            })
          );
        } else {
          if (temptileobj.redirectResolver) {
            temptileobj.redirectUrlInfo = temptileobj.redirectResolver(item);
          }
          temptileobj.btnText = getDataFromResponse(item, temptileobj.btnText);
        }
        return temptileobj;
      });
      let tempCard = _.cloneDeep(tempjsonDataObj.card);
      tempCard.tiles = vari;
      tempCard.icon = tempjsonDataObj.card.icon
        ? getDataFromResponse(item, tempjsonDataObj.card.icon)
        : null;
      tempCard.link = tempjsonDataObj.card.link
        ? getDataFromResponse(item, tempjsonDataObj.card.link)
        : null;
      tempCard.backgroundStyles = tempjsonDataObj.card.backgroundStyles
        ? getDataFromResponse(item, tempjsonDataObj.card.backgroundStyles)
        : null;

      return tempCard;
    });
  }

  return tempjsonDataObj;
};

export const ListView = (
  widgetObj: any,
  showMore: boolean,
  setShowMore: any
) => {
  return (
    <div className="list-card-container">
      <div className="list-card-header">
        <div className="section-title">{widgetObj.heading}</div>
        {widgetObj.icon && (
          <img
            src={widgetObj.icon}
            className="card-header-icon"
            onClick={widgetObj.onclick}
          />
        )}
      </div>
      {widgetObj?.apiconfig && !widgetObj?.apiconfig?.response ? (
        <div className="loader-comp">
          <Loader />
        </div>
      ) : (
        widgetObj?.card?.map((jsonObj: any, index: number) => {
          if (
            widgetObj.showmoreLimit &&
            index > widgetObj.showmoreLimit &&
            showMore
          ) {
            return;
          }
          return widgetObj.showmoreLimit &&
            index > widgetObj.showmoreLimit - 1 &&
            showMore ? (
            <div
              onClick={() => {
                setShowMore(!showMore);
              }}
              className="show-more-content list"
            >
              Show all
              <img src={expandImg} className="open-img" />
            </div>
          ) : (
            <>
              <div className={`card list ${index > 0 ? " border-top" : ""}`}>
                {jsonObj.tiles.map((tile: any) => {
                  return (
                    <div
                      className={`card-content-container ${
                        jsonObj.onclick && "redirect"
                      }`}
                      onClick={
                        jsonObj.onclick
                          ? () => jsonObj.onclick(jsonObj.link)
                          : undefined
                      }
                    >
                      {jsonObj.icon && (
                        <div
                          className="list-image-container"
                          style={jsonObj.backgroundStyles}
                        >
                          <img
                            src={jsonObj.icon}
                            alt="Overlay Image"
                            className="list-image"
                          />
                        </div>
                      )}
                      <div className={`card-content`}>
                        {tile.titles.map((segment: any) => {
                          return <div className="title">{segment.text}</div>;
                        })}
                        {tile.subtitles.map((segment: any) => {
                          return (
                            <div className="subtitle">
                              {segment.image && (
                                <img
                                  src={segment.image}
                                  className="subtitle-icon"
                                />
                              )}
                              <span>{segment.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              {!showMore &&
                widgetObj.card.length - 1 === index &&
                widgetObj.showmoreLimit &&
                index > widgetObj.showmoreLimit - 1 && (
                  <div
                    onClick={() => {
                      setShowMore(!showMore);
                    }}
                    className="show-less-content list"
                  >
                    Show less
                    <img src={expandImg} className="close-img" />
                  </div>
                )}
            </>
          );
        })
      )}
      {widgetObj.extraInfo && (
        <div
          onClick={() => {
            widgetObj.extraInfo.onclick();
          }}
          className="extra-info-redirect"
        >
          {widgetObj.extraInfo.text}
        </div>
      )}
    </div>
  );
};

export const DetailedView = (
  widgetObj: any,
  showMore: boolean,
  setShowMore: any
) => {
  return widgetObj?.card?.map((jsonObj: any, index: number) => {
    if (
      widgetObj.showmoreLimit &&
      index > widgetObj.showmoreLimit &&
      showMore
    ) {
      return;
    }
    return widgetObj.showmoreLimit &&
      index > widgetObj.showmoreLimit - 1 &&
      showMore ? (
      <div
        onClick={() => {
          setShowMore(!showMore);
        }}
        className="show-more-content"
      >
        Show all
        <img src={expandImg} className="open-img" />
    </div>
    ) : (
      <>
        <div
          className={`card detailed ${jsonObj.onclick ? "clickable" : ""}`}
          onClick={
            jsonObj.onclick
              ? () => {
                  jsonObj.onclick(jsonObj);
                }
              : () => {}
          }
        >
          {jsonObj.tiles.map((item: any, tileIndex: number) => {
            return (
              <>
                {item.type === "button" ? (
                  <Button
                    text={item.btnText}
                    buttonType="secondary"
                    onClick={() => {
                      if (item.redirectUrl) {
                        window.open(item.redirectUrl, "_blank");
                      } else {
                        item.onclick(item.redirectUrlInfo);
                      }
                    }}
                  ></Button>
                ) : (
                  <div
                    className={`${tileIndex === 0 ? "main " : ""}tile-content`}
                  >
                    {jsonObj.icon && tileIndex === 0 && (
                      <div
                        className="list-image-container"
                        style={jsonObj.backgroundStyles}
                      >
                        <img
                          src={jsonObj.icon}
                          alt="Overlay Image"
                          className="card-icon"
                        />
                      </div>
                    )}
                    <div className="width-100">
                      <div className="title-section">
                        {item?.titles?.map((titleItem: any, index: number) => {
                          return (
                            <div
                              className={`${
                                tileIndex === 0 ? "main " : ""
                              }card-other-title ${
                                index > 0 ? "border-left" : ""
                              } `}
                            >
                              {titleItem.image && (
                                <img
                                  src={titleItem.image}
                                  className="title-image"
                                />
                              )}
                              {titleItem.text && (
                                <span className="text-overflow-style">
                                  {titleItem.text}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="sub-section">
                        {item?.subtitles?.map(
                          (titleItem: any, index: number) => {
                            return (
                              <div
                                className={`${
                                  tileIndex === 0 ? "main " : ""
                                }card-other-subtitle ${
                                  index > 0 ? "border-left" : ""
                                } `}
                              >
                                {titleItem.image && (
                                  <img
                                    src={titleItem.image}
                                    className="subtitle-image"
                                  />
                                )}
                                {titleItem.text && (
                                  <span>{titleItem.text}</span>
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            );
          })}
        </div>
        {widgetObj.showmoreLimit &&
          !showMore &&
          widgetObj.card.length - 1 === index &&
          index > widgetObj.showmoreLimit - 1 && (
            <div
              onClick={() => {
                setShowMore(!showMore);
              }}
              className="show-less-content"
            >
              Show less
              <img src={expandImg} className="close-img" />
            </div>
          )}
      </>
    );
  });
};

export const SummaryView = (widgetObj: any) => {
  return (
    <div className="summary-card-container">
      {widgetObj?.card?.map((jsonObj: any) => {
        return (
          <div className={`card summary`}>
            <div className="summary-card-header">
              <div className="title">{jsonObj.heading}</div>
              {jsonObj.tooltip && (
                <img src={info} className="info-icon" title={jsonObj.tooltip} />
              )}
            </div>
            <div className="data">
              {jsonObj.data !== null ? jsonObj.data : <LoaderSmall />}
            </div>
          </div>
        );
      })}
    </div>
  );
};
