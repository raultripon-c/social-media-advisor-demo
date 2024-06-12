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

export const converMaptoArrayObjects = (scopes: any[]) => {
  return scopes?.map((scope: any) => {
      let arrayobjectList: any =[];
      let attributes = scope.attributes;

      for (let key in attributes) {            
          if(attributes[key]?.length>0)
          { attributes[key]?.forEach((val: any) => {
              let obj:any={};
            obj.name=key;
            obj.value=val;              
              arrayobjectList.push(obj)
          })
      }
      }
          scope.attributes=arrayobjectList;
          return scope;
  })
}

export function getKeyByValue(agencyData:any, atrtributevalue:any){
  Object.entries(agencyData).forEach(([key, value]) => { 
    if(value===atrtributevalue){
    atrtributevalue=key
    }
  });
  return atrtributevalue
}