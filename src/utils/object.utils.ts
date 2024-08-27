export function getRegionBasedOnDcCode(allDcCodes: any, dcCode: string) {
  if (allDcCodes && typeof(allDcCodes) === "string") {
    allDcCodes = JSON.parse(allDcCodes);
  }
  return dcCode && allDcCodes && allDcCodes[dcCode] ? allDcCodes[dcCode] : "US";
}

export function getRegionWiseAccessApi(regionAcessApiObj: any, dcRegion: string) {
  if (typeof(regionAcessApiObj) === "string") {
    regionAcessApiObj = JSON.parse(regionAcessApiObj);
  }
  return regionAcessApiObj[dcRegion];
}

export function getValueByKey(agencyData:any,atrtributekey:any){
  Object.entries(agencyData).forEach(([key, value]) => { 
    if(key===atrtributekey){
    atrtributekey=value
    }
  });
  return atrtributekey
}
