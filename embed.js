var txEmbed = (function(){
    const appCfg = {
        basePath : 'https://caas-qa1.phenompro.com'
    }
    const moduleCfg = {
        assets: {
            component: 'components/txe/txe-component/txe-component',
            tier: 'tier2',
        },
        content: {
            component: 'components/txe/txe-component/txe-component',
            tier: 'tier2',
        },
        blogs:  {
            component : 'components/txe/txe-component/txe-component',
            tier: 'tier3',
        },
        banners:  {
            component : 'components/txe/txe-component/txe-component',
            tier: 'tier3',
        },
    }
    const platformCfg = {
        tier2 : {
            styles: ['text!app.css', 'text!assets/caas-scss/main.css'],
            feature: 'resources',
            vendor: {
                id: 'txe-cms-vendor',
                src: "https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/vendor-bundle.js"
                //src: "https://localhost:9000/scripts/vendor-bundle.js",
            },
            app: {
                id: 'txe-cms-app',
                src: "https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/txe-app-bundle.js"
                //src: "https://localhost:9000/scripts/app-bundle.js"
            }
        },
        tier3 : {
            styles: ['text!app.css','text!assets/sass/main.css'],
            feature: 'components/common',
            vendor: {
                id: 'txe-cms-vendor',
                src: "https://localhost:9000/scripts/vendor-bundle.js"
                //src: "https://localhost:9000/scripts/vendor-bundle.js",
            },
            app: {
                id: 'txe-cms-app',
                src: "https://localhost:9000/scripts/app-bundle.js"
                //src: "https://localhost:9000/scripts/app-bundle.js"
            }
        }
    }
    function loadScript(scriptId, src, cb){
        const existsScriptElem = document.querySelector(`#${scriptId}`)
        if(existsScriptElem){
            existsScriptElem.remove();
        } 

        const scrElem = document.createElement('script');
        scrElem.src = src
        scrElem.id = scriptId
        //scrElem.setAttribute('data-main',"aurelia-bootstrapper");
        scrElem.onload = function(){
            cb()
        }
        document.querySelector('head').appendChild(scrElem);
    
    }

    function loadStyles(platformModuleCfg, tier){
        const txeCmsStyleId = 'txe-cms-style'
        const existsStyleElem = document.querySelector(`#${txeCmsStyleId}-main`)
        if(existsStyleElem){
            existsStyleElem.remove();
        }
        if(!existsStyleElem){
            require(platformModuleCfg.styles, function(css, maincss){
                const styleElem1 = document.createElement('style')
                styleElem1.id = `${txeCmsStyleId}-main`
                styleElem1.innerText = maincss
                document.querySelector('head').appendChild(styleElem1)
                const styleElem = document.createElement('style')
                styleElem.id = `${txeCmsStyleId}-app`
                styleElem.innerText = css
                document.querySelector('head').appendChild(styleElem);
            
           })
        }
    }

    function embedModules(moduleToLoad, containerSelector, txeContext){
        if(!window.___prmise___){
            window.___prmise___ = window.Promise
        }

        window.___req___ = undefined
        window.require = undefined
        window.define = undefined
        window.___define___ = undefined
        window.requirejs = undefined
        window.CKEDITOR = undefined
        
        // if(window.___define___){
        //     window.dfn = window.___define___
        // }
        // window.___define___ = window.define = undefined
        
        window.__txeCms = window.__txeCms || {}
        if(!window.__txeCms[moduleToLoad]){
            window.__txeCms[moduleToLoad] = true
            const tier = moduleCfg[moduleToLoad].tier;
            const moduleSpecificPlatformConfig = platformCfg[tier];
            
            loadScript(moduleSpecificPlatformConfig.vendor.id, moduleSpecificPlatformConfig.vendor.src, function(){    
                loadScript(moduleSpecificPlatformConfig.app.id, moduleSpecificPlatformConfig.app.src, function(){
                    if(!window.___req___){
                        window.___define___ = window.define
                        window.define = function (name, deps, callback) {
                            console.log(name, deps, callback)
                            window.___define___(name, deps, callback)
                        }

                        window.___req___ = window.require
                        window.require = function(arr, cb){
                            console.log(arr, cb)
                            if(cb){
                                window.___req___(arr, cb)
                            }
                        }
                        
                    }
                    if(window.require1){
                        window.require = window.require1
                    }
                    
                    require(['aurelia-framework',
                    'aurelia-loader-default',
                    'aurelia-pal-browser',
                    'aurelia-templating',
                    'aurelia-task-queue',
                    'aurelia-logging', 'aurelia-templating-binding', 'aurelia-polyfills'], function (AF, ALD, PAL,  AT, ATQ) {
                        if(tier === 'tier2') {
                            window.CKEDITOR_BASEPATH = appCfg.basePath
                            if(CKEDITOR && CKEDITOR.getUrl){
                                let oldFn = CKEDITOR.getUrl
                                CKEDITOR.getUrl = function(a){
                                    console.log('overridden GET URL!!!', a)
                                    if(a.indexOf('://') == -1){
                                        a = appCfg.basePath + '/' + a
                                    } else {
                                        let baseUrlData = new URL(appCfg.basePath)
                                        let urlData = new URL(a)
                                        if(urlData.pathname.indexOf('/plugins/') != -1 && urlData.host != baseUrlData.host){
                                            a = appCfg.basePath + urlData.pathname + '?' + urlData.search
                                        }
                                    }
                                    return oldFn(a)
                                }
                            }
                        }

                        PAL.initialize()
                        taskQueue = new ATQ.TaskQueue()
                        var loader = new ALD.DefaultLoader();
                        var aurelia = new AF.Aurelia(loader);
                        aurelia.loader.loadModule('aurelia-framework')
                        window.localAurelia = aurelia;
                        aurelia.use
                            .standardConfiguration()
                            .feature(moduleSpecificPlatformConfig.feature)
                            .plugin('aurelia-validation')
                            .plugin("aurelia-animator-css")
                        aurelia.use.plugin('aurelia-dialog', function(config) {
                            config.useDefaults();
                            config.settings.centerHorizontalOnly = true;
                            config.settings.lock = true;
                            config.settings.startingZIndex = 1031;
                        });
                        // if(window.require){
                        //     window.require1 = window.require
                        //     window.require = undefined
                        // }
                        var aStart = aurelia.start();
                        aStart.then(function () {
                            //return aurelia.setRoot('components/content-management/content-management', document.querySelector('#cms-au'));
                            const auHosted = aurelia.setRoot(moduleCfg[moduleToLoad].component, document.querySelector(containerSelector));
                            auHosted.then(() => {
                                if(aurelia.root && aurelia.root.viewModel.setTxeContext){
                                    if(window.orgInfo){
                                        txeContext.orgInfo = window.orgInfo
                                    }
                                    txeContext.expiry = window?.keycloakInstance?.tokenParsed?.exp
                                    txeContext.module = moduleToLoad
                                    aurelia.root.viewModel.setTxeContext(txeContext)
                                }
                                delete window.__txeCms[moduleToLoad]
                                if(window.___prmise___){
                                    window.Promise = window.___prmise___
                                }
                            })
                            return auHosted
                        })
                    })
                    loadStyles(moduleSpecificPlatformConfig, tier);
                })
            })
        }
    }
    return {
        embedModules: embedModules
    }
}())