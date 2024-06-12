import React, { useEffect, useRef } from 'react';
import { useDynamicMFLoader } from './useDynamicMFLoader';

const loadRemoteModule = async (scope:any, module:any) => {
  await __webpack_init_sharing__('default');
  const container = window[scope];
  await container.init(__webpack_share_scopes__.default);
  const factory = await container.get(module);
  const Module = factory();
  return Module;
};

const mountAngularComponent = (element:any, angularModule:any) => {
  const { platformBrowserDynamic } = require('@angular/platform-browser-dynamic');
  const { NgModule, Component } = require('@angular/core');

  const AppComponent =  Component({ template: '<app-events></app-events>' })(class {});

  const AppModule = NgModule({
    declarations: [AppComponent],
    imports: [angularModule],
    bootstrap: [AppComponent],
  })(class {});

  platformBrowserDynamic().bootstrapModule(AppModule).then((ref: { instance: { hostView: { detectChanges: () => void; }; }; }) => {
    if (element) {
      ref.instance.hostView.detectChanges();
    }
  });
};

const AngularAppRenderer = ({ url,remoteName, exposedModule }:any) => {
  const ref = useRef(null);
  const { ready, failed } = useDynamicMFLoader({
    url: module && url,
  });
  useEffect(() => {
    if(ready){
    (async () => {
      const module = await loadRemoteModule(remoteName, exposedModule);
      mountAngularComponent(ref.current, module.YourAngularModule);
    })();
  }
  }, [remoteName, exposedModule,ready]);

  return <div ref={ref}></div>;
};

export default AngularAppRenderer;
