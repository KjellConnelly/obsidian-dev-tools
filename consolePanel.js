/* globals window, document, requestAnimationFrame, localStorage, navigator, CustomEvent, HTMLElement, Text, JSONEditor, Prism */

/*!
	console-panel
    A console panel within webpage to help in the following use-cases:
        * Get notification on console messages
        * Console logging on mobile and tablet devices
        * Console logging on Microsoft Edge / Internet Explorer (without opening native Developer Tools)
	https://github.com/webextensions/console-panel
	by Priyank Parashar (https://webextensions.org/)
	MIT License
*/

/*
    Limitations / notable behavior:
    - console.clear() is always intercepted whenever consolePanel.enable() is called
    - In Microsoft Edge (EdgeHTML) and Internet Explorer, the console functions are
      not intercepted if the browser's native Developer Tools are in activated state
      (window.onerror can still be intercepted). Also, for these browsers, if the
      native Developer Tools have been opened once, then the intercepted calls to
      the console logging function calls are absorbed (rather than intercepted)
    - During a page load, if consolePanel.enable(config) has already been called
      once, then calling consolePanel.enable(config_new) with a different config
      may not work well for all the cases
*/

(function ($) {
    if (window.consolePanel) {
        return;
    }

    /* eslint-disable */
    // https://raw.githubusercontent.com/WebReflection/circular-json/v0.5.9/build/circular-json.js
    /*! (C) WebReflection Mit Style License */
    var CircularJSON=function(JSON,RegExp){var specialChar="~",safeSpecialChar="\\x"+("0"+specialChar.charCodeAt(0).toString(16)).slice(-2),escapedSafeSpecialChar="\\"+safeSpecialChar,specialCharRG=new RegExp(safeSpecialChar,"g"),safeSpecialCharRG=new RegExp(escapedSafeSpecialChar,"g"),safeStartWithSpecialCharRG=new RegExp("(?:^|([^\\\\]))"+escapedSafeSpecialChar),indexOf=[].indexOf||function(v){for(var i=this.length;i--&&this[i]!==v;);return i},$String=String;function generateReplacer(value,replacer,resolve){var doNotIgnore=false,inspect=!!replacer,path=[],all=[value],seen=[value],mapp=[resolve?specialChar:"[Circular]"],last=value,lvl=1,i,fn;if(inspect){fn=typeof replacer==="object"?function(key,value){return key!==""&&replacer.indexOf(key)<0?void 0:value}:replacer}return function(key,value){if(inspect)value=fn.call(this,key,value);if(doNotIgnore){if(last!==this){i=lvl-indexOf.call(all,this)-1;lvl-=i;all.splice(lvl,all.length);path.splice(lvl-1,path.length);last=this}if(typeof value==="object"&&value){if(indexOf.call(all,value)<0){all.push(last=value)}lvl=all.length;i=indexOf.call(seen,value);if(i<0){i=seen.push(value)-1;if(resolve){path.push((""+key).replace(specialCharRG,safeSpecialChar));mapp[i]=specialChar+path.join(specialChar)}else{mapp[i]=mapp[0]}}else{value=mapp[i]}}else{if(typeof value==="string"&&resolve){value=value.replace(safeSpecialChar,escapedSafeSpecialChar).replace(specialChar,safeSpecialChar)}}}else{doNotIgnore=true}return value}}function retrieveFromPath(current,keys){for(var i=0,length=keys.length;i<length;current=current[keys[i++].replace(safeSpecialCharRG,specialChar)]);return current}function generateReviver(reviver){return function(key,value){var isString=typeof value==="string";if(isString&&value.charAt(0)===specialChar){return new $String(value.slice(1))}if(key==="")value=regenerate(value,value,{});if(isString)value=value.replace(safeStartWithSpecialCharRG,"$1"+specialChar).replace(escapedSafeSpecialChar,safeSpecialChar);return reviver?reviver.call(this,key,value):value}}function regenerateArray(root,current,retrieve){for(var i=0,length=current.length;i<length;i++){current[i]=regenerate(root,current[i],retrieve)}return current}function regenerateObject(root,current,retrieve){for(var key in current){if(current.hasOwnProperty(key)){current[key]=regenerate(root,current[key],retrieve)}}return current}function regenerate(root,current,retrieve){return current instanceof Array?regenerateArray(root,current,retrieve):current instanceof $String?current.length?retrieve.hasOwnProperty(current)?retrieve[current]:retrieve[current]=retrieveFromPath(root,current.split(specialChar)):root:current instanceof Object?regenerateObject(root,current,retrieve):current}var CircularJSON={stringify:function stringify(value,replacer,space,doNotResolve){return CircularJSON.parser.stringify(value,generateReplacer(value,replacer,!doNotResolve),space)},parse:function parse(text,reviver){return CircularJSON.parser.parse(text,generateReviver(reviver))},parser:JSON};return CircularJSON}(JSON,RegExp);
    /* eslint-enable */

    // https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#Polyfill
    (function () {
        if (typeof window.CustomEvent === "function") return false;

        function CustomEvent ( event, params ) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            var evt = document.createEvent( 'CustomEvent' );
            evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
            return evt;
        }

        CustomEvent.prototype = window.Event.prototype;

        window.CustomEvent = CustomEvent;
    })();

    var alertNote = (function () {
        var w = window,
            d = document,
            dE = d.documentElement,
            div = d.createElement('div'),
            t;
        div.id = 'topCenterAlertNote';

        // Hide functionality
        var h = function (div) {
            div.style.display = 'none';
        };

        var clearTimeout = function () {
            w.clearTimeout(t);
        };

        var alertNote = function (msg, hideDelay, options) {
            options = options || {};
            var verticalAlignment = options.verticalAlignment || 'top',
                horizontalAlignment = options.horizontalAlignment || 'center',
                textAlignment = options.textAlignment || horizontalAlignment,
                backgroundColor = options.backgroundColor || '#f9edbe',
                borderColor = options.borderColor || '#eb7',
                opacity = options.opacity || '1',
                unobtrusive = options.unobtrusive || false;
            // TODO:
            // - Apply !important for various inline styles (otherwise, it might get over-ridden by some previously present !important CSS styles)
            // - "OK" button functionality

            /* eslint-disable indent */
            div.innerHTML = [
                '<div ' +
                    'style="' +
                        'pointer-events:none;' +    // To avoid it from stealing hover (the pointer-events will be enabled for a child element)
                        'position:fixed;width:100%;z-index:2147483600;' +
                        (verticalAlignment === 'bottom' ? 'bottom:0;' : 'top:0;') +
                        (function () {
                            if (horizontalAlignment === 'left') {
                                return 'left:0;';
                            } else if (horizontalAlignment === 'right') {
                                return 'right:0;';
                            } else {
                                /* Even for center aligning, we need to set left or right as 0, without that
                                    it would try to center align whithout considering the width taken by vertical scrollbar */
                                return 'left:0;';
                            }
                        }()) +
                        'text-align:' + horizontalAlignment + ';' +     // TODO: Check if we need this
                        'opacity:' + opacity + ';' +
                        '"' +
                    '>',
                    '<div ' +
                        'style="' +
                            'display:flex;width:auto;margin:0;padding:0;border:0;' +
                            (function () {
                                if (horizontalAlignment === 'left') {
                                    return 'justify-content:flex-start;';
                                } else if (horizontalAlignment === 'right') {
                                    return 'justify-content:flex-end;';
                                } else {
                                    return 'justify-content:center;';
                                }
                            }()) +
                                    // margin:0 is useful for some sites (eg: https://developer.chrome.com/home)
                            '"' +
                        '>',
                        '<div ' +
                            'style="' +
                                'pointer-events:initial;' +    // To gain back the pointer-events which were disabled in one of the parent elements
                                'border:1px solid ' + borderColor + ';' +
                                'background-color:' + backgroundColor + ';' +   // background-color:#feb;
                                                                                // TODO: Check if we need "text-align: left". Maybe it helps to set the default style.
                                'padding:2px 10px;max-width:980px;overflow:hidden;text-align:left;font-family:Arial,sans-serif;font-weight:bold;font-size:12px' +
                            '"' +
                        '>',
                            '<div class="alert-note-text" style="color:#000;text-align:' + textAlignment + ';word-wrap:break-word;">',
                                msg,
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>'
            ].join('');
            /* eslint-enable indent */

            if (unobtrusive) {
                try {
                    var firstChild = div.firstChild.firstChild.firstChild;
                    firstChild.addEventListener('mouseenter', function () {
                        // Note:
                        //      If we wish to directly apply the opacity changes to the parent "div",
                        //      which is currently a direct child of <html> tag, then, on some sites (eg:
                        //      gmail.com) somehow, as soon as we reduce its opacity to a value less than
                        //      1 (eg: 0.99), it gets hidden immediately. The fact that it is appended to
                        //      <html> tag and not to <body> is somehow causing this behavior. Since we
                        //      are using that parent div's inner child, the opacity transition works fine.
                        firstChild.style.transition = 'opacity 0.3s ease-out';
                        firstChild.style.opacity = '0';
                        firstChild.style.pointerEvents = 'none';
                    }, false);
                } catch (e) {
                    // do nothing
                }
            }

            div.style.display = '';     // Required when the same div element is being reused

            dE.appendChild(div);
            clearTimeout();
            t = w.setTimeout(function () { h(div); }, hideDelay || 5000);
        };

        alertNote.hide = function () {
            h(div);
            clearTimeout();
        };

        return alertNote;
    }());

    var constants = {
        DISABLE_FOR_THIS_INSTANCE: 'Disable for this instance'
    };

    var moduleGlobal = {};
    // Customized version of devtools-detect:
    //     https://github.com/sindresorhus/devtools-detect/blob/gh-pages/index.js
    /*!
        devtools-detect
        Detect if DevTools is open
        https://github.com/sindresorhus/devtools-detect
        by Sindre Sorhus
        MIT License
    */
    (function (scope) {
        'use strict';
        scope = scope || {};
        var devtools = {
            open: false,
            orientation: null
        };
        var threshold = 160;

        var emitEvent = function (state, orientation) {
            // https://github.com/sindresorhus/devtools-detect/issues/9
            // https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#Polyfill
            window.dispatchEvent(new CustomEvent('console-panel-devtoolschange', {
                detail: {
                    open: state,
                    orientation: orientation
                }
            }));
        };

        // TODO:
        //     Currently, getDevToolsStatus() and updateDevToolsStatus() have duplicated functionality / code.
        //     Refactor them to reuse properly.

        var getDevToolsStatus = function () {
            var devtoolsStatus = {};
            var widthThreshold = window.outerWidth - window.innerWidth > threshold;
            var heightThreshold = window.outerHeight - window.innerHeight > threshold;
            var orientation = widthThreshold ? 'vertical' : 'horizontal';

            if (
                !(heightThreshold && widthThreshold) &&
                (
                    (
                        window.Firebug &&
                        window.Firebug.chrome &&
                        window.Firebug.chrome.isInitialized
                    ) ||
                    widthThreshold ||
                    heightThreshold
                )
            ) {
                devtoolsStatus.open = true;
                devtoolsStatus.orientation = orientation;
            } else {
                devtoolsStatus.open = false;
                devtoolsStatus.orientation = null;
            }

            return devtoolsStatus;
        };
        scope.getDevToolsStatus = getDevToolsStatus;

        var updateDevToolsStatus = function () {
            var widthThreshold = window.outerWidth - window.innerWidth > threshold;
            var heightThreshold = window.outerHeight - window.innerHeight > threshold;
            var orientation = widthThreshold ? 'vertical' : 'horizontal';

            if (
                !(heightThreshold && widthThreshold) &&
                (
                    (
                        window.Firebug &&
                        window.Firebug.chrome &&
                        window.Firebug.chrome.isInitialized
                    ) ||
                    widthThreshold ||
                    heightThreshold
                )
            ) {
                if (!devtools.open || devtools.orientation !== orientation) {
                    emitEvent(true, orientation);
                }

                devtools.open = true;
                devtools.orientation = orientation;
            } else {
                if (devtools.open) {
                    emitEvent(false, null);
                }

                devtools.open = false;
                devtools.orientation = null;
            }

            return devtools;
        };
        scope.updateDevToolsStatus = updateDevToolsStatus;

        window.addEventListener('resize', function (e) {
            if (e.target !== window) {
                return;
            }
            updateDevToolsStatus();
        });
    })(moduleGlobal);

    var ready = function (cb) {
        if (document.readyState !== 'loading') {
            cb();
        } else {
            document.addEventListener('DOMContentLoaded', cb);
        }
    };

    var getFullKey = function (key) {
        return 'userPreference-' + key;
    };

    var defaultUserPreference = {};
    defaultUserPreference[getFullKey('consolePanelHeight')] = '250';

    var getLocalStorage = function (key) {
        try {
            return localStorage[key];
        } catch (e) {
            return undefined;
        }
    };
    var setLocalStorage = function (key, value) {
        try {
            localStorage[key] = value;
            return true;
        } catch (e) {
            return false;
        }
    };

    var userPreference = function (preference, value) {
        var fullKey = getFullKey(preference);
        if (typeof value !== 'undefined') {
            return setLocalStorage(fullKey, value);
        } else {
            var retValue = getLocalStorage(fullKey);
            if (typeof retValue === 'undefined') {
                return defaultUserPreference[fullKey];
            }
            return retValue;
        }
    };

    var nl2br = function (str) { // eslint-disable-line no-unused-vars
        return ('' + str)
            .replace(/\r\n/g, '<br>')
            .replace(/\n/g, '<br>')
            .replace(/\r/g, '<br>');
    };
    var sanitizeHTML = function (html) {
        return ('' + html)
            .replace(/&/g,"&amp;")
            .replace(/</g,"&lt;")
            .replace(/>/g,"&gt;")
            .replace(/"/g,"&quot;")
            .replace(/'/g,"&#x27;")
            .replace(/\//g,"&#x2F;");
    };
    var sanitizedInnerHTML = function (el, html) {
        el.innerHTML = sanitizeHTML(html);
    };
    var ellipsis = function (str, length) {
        if (!length || length <= 3) {
            return str;
        } else {
            if (str.length > length) {
                return str.substr(0, length - 3) + '...';
            } else {
                return str;
            }
        }
    };

    var getResourceUrlFromPath = function (path) {
        path = path || '';
        path = path.replace(/:[0-9]+$/, '');    // Sometimes, we may get line number and character number both
        path = path.replace(/:[0-9]+$/, '');    // Sometimes, we may get only line number
        return path;
    };
    var getResourceLineCharacterFromPath = function (path) {
        path = path || '';
        path = path.split('/').pop();
        return path;
    };

    var getCurrentExecutionDetails = function (options) {
        var skipLevels = options.skipLevels || 1;
        var executionDetails = {
            stack: null,
            resourceLineCharacter: null,
            resourceUrlLineCharacter: null,
            resourceUrl: null
        };

        var errStr = '';

        if (Object.keys(options).indexOf('stack') >= 0) {
            if (options.stack) {
                errStr = options.stack;
            } else {
                errStr = '';
            }
        } else {
            try {
                // IMPORTANT:
                //     If you have enabled "Pause on caught exceptions" feature in your browser's DevTools
                //     and your debugging session is getting interrupted by this error, please check the
                //     stack trace of current execution. You may find appropriate instructions to avoid
                //     that problem.
                throw new Error('');
            } catch (e) {
                errStr = e.stack || '';
            }
        }

        var arrStack;
        var isGecko = (
            navigator.userAgent.toLowerCase().indexOf('gecko') !== -1 &&
            navigator.userAgent.toLowerCase().indexOf('like gecko') === -1
        );
        if (isGecko) {
            arrStack = errStr.split(/\n[\s]*/).map(function (str) {
                var split = str.split('@');
                return split[split.length-1];
            });
            arrStack.splice(0, skipLevels - 1);
        } else {
            arrStack = errStr.split(/\n[\s]+at[\s]/);
            arrStack.splice(0, skipLevels);
        }

        var stackToReport = errStr.split(/\n/);
        if (stackToReport[0] === 'Error') {
            stackToReport.splice(1, skipLevels - 1);
        } else {
            stackToReport.splice(0, skipLevels - 1);
        }
        stackToReport = stackToReport.join('\n');

        var relevantString = arrStack[0];

        if (relevantString && relevantString.indexOf('(') >= 0) {
            relevantString = relevantString.substr(relevantString.indexOf('(') + 1);
            relevantString = relevantString.substr(0, relevantString.indexOf(')'));
        }

        executionDetails = {
            stack: stackToReport,
            resourceLineCharacter: getResourceLineCharacterFromPath(relevantString),
            resourceUrlLineCharacter: relevantString,
            resourceUrl: getResourceUrlFromPath(relevantString)
        };

        return executionDetails;
    };

    // https://bytes.babbel.com/en/articles/2014-09-09-javascript-function-call-interception.html
    // Note that the code from that blog post has been corrected below
    var after = function (object, method, fn, context) {
        context = context || object;
        var originalMethod = object[method];
        object[method] = function () {
            // originalMethod may be null (eg: If we wish to intercept window.onerror, and window.onerror might be null)
            if (typeof originalMethod === 'function') {
                // IMPORTANT:
                //     If you are seeing the following line for log entries in the native console and wish to get rid of it,
                //     please use the following command to disable consolePanel:
                //         consolePanel.disable()
                originalMethod.apply(context, arguments);
            }
            // IMPORTANT:
            //     If you are encountering the following line in stack trace for "Pause on caught exceptions" feature in your
            //     browser's DevTools and your debugging session is getting interrupted by it, please run the following command to
            //     disable logging line numbers in consolePanel
            //         consolePanel.disableReportLogLines()
            fn.apply(context, arguments);
        };
        return originalMethod;
    };

    // Note: For documentation of before() function, please refer to the documentation of the after() function
    var before = function (object, method, fn, context) { // eslint-disable-line no-unused-vars
        context = context || object;
        var originalMethod = object[method];
        object[method] = function () {
            if (typeof originalMethod === 'function') {
                fn.apply(context, arguments);
            }
            originalMethod.apply(context, arguments);
        };
        return originalMethod;
    };

    var varConsole;
    // If "console" has a special implementation (applicable for Microsoft Edge (EdgeHTML) and Internet Explorer)
    if ((Object.getPrototypeOf(console)).log) {
        varConsole = (Object.getPrototypeOf(console));
    } else {
        varConsole = console;
    }
    // Definition of ConsolePanel class
    var ConsolePanel = (function () {
        var ConsolePanel = function () {
            this.originals = {};
            this.arrLogs = [];
            this.config = {
                reportLogLines: true
            };
            this.domReady = false;
            this.enabled = false;
        };

        ConsolePanel.prototype.setButtonPosition = function (position) {
            this.devToolsIconContainer.className = 'dev-tools-icon-container dev-tools-icon-container-' + position;
        };
        ConsolePanel.prototype.showDevToolsIconContainer = function () {
            if (!this.isConsolePanelVisible()) {
                this.devToolsIconContainer.style.display = 'block';
            }
        };
        ConsolePanel.prototype.hideDevToolsIconContainer = function () {
            this.devToolsIconContainer.style.display = 'none';
        };
        ConsolePanel.prototype.isDevToolsIconContainerVisible = function () {
            return this.devToolsIconContainer.style.display === 'block';
        };
        ConsolePanel.prototype.isConsolePanelVisible = function () {
            return this.devTools.style.display === 'block';
        };
        ConsolePanel.prototype.hideConsolePanel = function () {
            this.devTools.style.display = 'none';
        };
        ConsolePanel.prototype.showConsolePanel = function () {
            this.devTools.style.display = 'block';
            this.flushLogsToUIAsync();
        };

        ConsolePanel.prototype.hideBecauseDevToolsIsOpen = function () {
            var that = this;
            alertNote('Disabled console-panel', null, {verticalAlignment: 'bottom', horizontalAlignment: 'right'});
            that.disable();
            that.hideDevToolsIconContainer();
            that.hideConsolePanel();
        };
        ConsolePanel.prototype.showBecauseDevToolsIsClosed = function () {
            var that = this;
            that.enable(that.config);
            if (that.isDevToolsIconContainerVisible()) {
                alertNote.hide();
            } else {
                alertNote('Enabled console-panel', null, {verticalAlignment: 'bottom', horizontalAlignment: 'right'});
            }
        };

        ConsolePanel.prototype.hasStrongNotification = function () {
            var strongNotificationFor = this.config.strongNotificationFor;
            var skipStrongNotificationIfNoStackTrace = this.config.skipStrongNotificationIfNoStackTrace;

            var showStrongNotification = false;

            var arrLogs = this.arrLogs;

            for (var i = 0; i < arrLogs.length; i++) {
                var log = arrLogs[i],
                    logMode = log.logMode;
                if (Date.now() <= (arrLogs[i].time.getTime() + 1500)) {
                    if (skipStrongNotificationIfNoStackTrace && !log.initiator.stack) {
                        // do nothing
                    } else if (
                        (logMode === 'window.onerror' && strongNotificationFor.indexOf('window.onerror') >= 0) ||
                        (logMode === 'error'          && strongNotificationFor.indexOf('console.error' ) >= 0) ||
                        (logMode === 'warn'           && strongNotificationFor.indexOf('console.warn'  ) >= 0) ||
                        (logMode === 'info'           && strongNotificationFor.indexOf('console.info'  ) >= 0) ||
                        (logMode === 'log'            && strongNotificationFor.indexOf('console.log'   ) >= 0)
                    ) {
                        showStrongNotification = true;
                        break;
                    }
                }
            }

            return showStrongNotification;
        };

        ConsolePanel.prototype.getRecommendedClassNameForDevToolsIcon = function () {
            var recommendedClassName = 'found-something';

            var foundError = false,
                foundWarn  = false,
                foundInfo  = false,
                foundLog   = false;

            var arrLogs = this.arrLogs;

            for (var i = 0; i < arrLogs.length; i++) {
                var logMode = arrLogs[i].logMode;
                if      (logMode === 'error' || logMode === 'window.onerror') { foundError = true; }
                else if (logMode === 'warn') { foundWarn = true; }
                else if (logMode === 'info') { foundInfo = true; }
                else if (logMode === 'log' ) { foundLog  = true; }
            }

            if      (foundError) { recommendedClassName = 'found-error'; }
            else if (foundWarn ) { recommendedClassName = 'found-warn';  }
            else if (foundInfo ) { recommendedClassName = 'found-info';  }
            else if (foundLog  ) { recommendedClassName = 'found-log';   }

            return recommendedClassName;
        };

        ConsolePanel.prototype.areThereUnreadRelevantMessages = function (relevantMessages) {
            var arrLogs = this.arrLogs;

            if (arrLogs.length) {
                if (relevantMessages === 'all') {
                    return true;
                } else if (Array.isArray(relevantMessages)) {
                    for (var i = 0; i < arrLogs.length; i++) {
                        var normalizedLogMode = arrLogs[i].logMode;
                        if (normalizedLogMode !== 'window.onerror') {
                            normalizedLogMode = 'console.' + normalizedLogMode;
                        }

                        if (relevantMessages.indexOf(normalizedLogMode) >= 0) {
                            return true;
                        }
                    }
                }
            }
            return false;
        };

        ConsolePanel.prototype.flushCountToIcon = function () {
            var devToolsIconStrongNotification = this.devToolsIconStrongNotification,
                devToolsIcon = this.devToolsIcon;
            if (this.config.showOnlyForTheseRelevantMessages) {
                var relevantMessages = this.config.showOnlyForTheseRelevantMessages;
                if (this.areThereUnreadRelevantMessages(relevantMessages)) {
                    this.showDevToolsIconContainer();
                }
            }
            var arrLogs = this.arrLogs;
            if (arrLogs.length) {
                devToolsIcon.innerHTML = arrLogs.length;
                devToolsIcon.title = arrLogs.length + ' unread message' + (arrLogs.length === 1 ? '' : 's');
                var recommendedClassName = this.getRecommendedClassNameForDevToolsIcon();
                var showStrongNotification = this.hasStrongNotification();
                devToolsIcon.className = 'dev-tools-icon ' + recommendedClassName;
                devToolsIconStrongNotification.className = (function () {
                    if (showStrongNotification) {
                        return 'strong-notification';
                    } else {
                        return '';
                    }
                }());

                if (showStrongNotification) {
                    var dataLastStrongNotification = Date.now();
                    devToolsIconStrongNotification.setAttribute('data-last-strong-notification', dataLastStrongNotification);
                    var animationDuration = 1500;
                    setTimeout(function () {
                        if (dataLastStrongNotification === parseInt(devToolsIconStrongNotification.getAttribute('data-last-strong-notification'), 10)) {
                            devToolsIconStrongNotification.removeAttribute('data-last-strong-notification');
                            devToolsIconStrongNotification.classList.remove('strong-notification');
                        }
                    }, animationDuration);
                }
            } else {
                devToolsIcon.innerHTML = '';
                devToolsIcon.removeAttribute('title');
                devToolsIcon.className = 'dev-tools-icon no-unread-messages';
                devToolsIconStrongNotification.classList.remove('strong-notification');
            }
        };

        ConsolePanel.prototype.flushLogsToUIAsync = function () {
            var that = this;
            // Using 2 requestAnimationFrame() to avoid performance issues
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    that.flushLogsToUI();
                });
            });
        };

        ConsolePanel.prototype.flushLogsToUI = function () {
            this.flushCountToIcon();

            if (!this.isConsolePanelVisible()) {
                return;
            }

            var shouldScrollToBottom = false;
            var logger = this.logger;
            if (logger.scrollHeight === logger.scrollTop + logger.offsetHeight) {
                shouldScrollToBottom = true;
            }

            var arrLogs = this.arrLogs;
            while (arrLogs.length) {
                var item = arrLogs.shift();

                var logMode   = item.logMode,
                    logEntry  = item.logEntry,
                    initiator = item.initiator,
                    time      = item.time;

                var consoleMessageWrapper = document.createElement('div');
                this.loggerBody.appendChild(consoleMessageWrapper);
                consoleMessageWrapper.title = 'Logged at ' + time.toTimeString().substring(0, 8);
                consoleMessageWrapper.className = 'dev-tools-console-message-wrapper ' + (function () {
                    if      (logMode === 'log'           ) { return 'log-mode-log';            }    // Note: This CSS class is not being used yet
                    else if (logMode === 'info'          ) { return 'log-mode-info';           }
                    else if (logMode === 'warn'          ) { return 'log-mode-warn';           }
                    else if (logMode === 'error'         ) { return 'log-mode-error';          }
                    else if (logMode === 'window.onerror') { return 'log-mode-window-onerror'; }
                    else if (logMode === 'clear'         ) { return 'log-mode-clear';          }    // Note: This CSS class is not being used yet
                    else if (logMode === 'unhandled'     ) { return 'log-mode-unhandled';      }
                    else                                   { return 'log-mode-unknown';        }
                }());

                var divLogExecution = document.createElement('div');
                consoleMessageWrapper.appendChild(divLogExecution);
                divLogExecution.className = 'dev-tools-console-message-code-line';
                divLogExecution.innerHTML = (function (initiator) {
                    if (initiator.resourceLineCharacter) {
                        var str = '<a target="_blank" style="color:#545454; font-family:monospace;"' +
                            ' href="' + sanitizeHTML(initiator.resourceUrl) + '"' +
                            ' title="' + sanitizeHTML(initiator.resourceUrlLineCharacter) + '">' +
                            sanitizeHTML(initiator.resourceLineCharacter) +
                        '</a>';
                        return str;
                    } else {
                        return '';
                    }
                }(initiator));

                var consoleMessage = document.createElement('div');
                consoleMessageWrapper.appendChild(consoleMessage);
                consoleMessage.className = 'dev-tools-console-message';

                var span;
                if (logEntry.length === 0) {
                    span = document.createElement('span');
                    consoleMessage.appendChild(span);
                    span.innerHTML = ' ';
                } else {
                    for (var i = 0; i < logEntry.length; i++) {
                        if (i > 0) {
                            var spacer = document.createElement('span');
                            consoleMessage.appendChild(spacer);
                            spacer.innerHTML = ' ';
                        }

                        span = document.createElement('span');
                        consoleMessage.appendChild(span);

                        var updateDom = function (options) {
                            var className = options.className || 'log-value-unknown';
                            var valueToLog = options.valueToLog;

                            var container = span;
                            container.className = className;
                            if (className === 'log-value-unknown' || className === 'log-value-object' || className === 'log-value-array') {
                                if (typeof JSONEditor === 'undefined') {
                                    container.classList.add('jsoneditor-not-available');
                                    if (Array.isArray(valueToLog)) {
                                        sanitizedInnerHTML(container, String('[' + valueToLog.length + ']'));
                                    } else if (typeof valueToLog === 'object') {
                                        sanitizedInnerHTML(container, String('{' + Object.keys(valueToLog).length + '}'));
                                    } else {
                                        sanitizedInnerHTML(container, String(typeof valueToLog) + ' (' + String(valueToLog) + ')');
                                    }
                                } else {
                                    var jsonEditorOptions = {
                                        mode: 'view',
                                        navigationBar: false,
                                        search: false,
                                        sortObjectKeys: true
                                    };
                                    var editor = new JSONEditor(container, jsonEditorOptions);
                                    editor.set(valueToLog);
                                    editor.collapseAll();
                                }
                            } else if (className === 'log-value-dom') {
                                var firstLineOfValueToLog = valueToLog.split('\n')[0];

                                var hasMultilineHTML = false;
                                if (firstLineOfValueToLog !== valueToLog) {
                                    hasMultilineHTML = true;
                                }

                                var renderFullCode = function () {
                                    var spanFullCode = document.createElement('span');
                                    container.appendChild(spanFullCode);
                                    spanFullCode.className = 'all-lines-of-code';
                                    spanFullCode.innerHTML = '<pre><code class="language-markup">' +
                                        sanitizeHTML(valueToLog) +
                                    '</code></pre>';

                                    if (typeof Prism !== 'undefined') {
                                        Prism.highlightAllUnder(spanFullCode);
                                    }

                                    return spanFullCode;
                                };

                                if (hasMultilineHTML) {
                                    var spanExpandCollapse = document.createElement('span');
                                    container.appendChild(spanExpandCollapse);
                                    spanExpandCollapse.className = 'console-panel-expand-collapse console-panel-collapsed';

                                    var spanFullCode;
                                    var spanFirstLine = document.createElement('span');
                                    container.appendChild(spanFirstLine);
                                    spanFirstLine.className = 'only-first-line-of-code';
                                    spanFirstLine.innerHTML = '<pre><code class="language-markup">' +
                                        sanitizeHTML(firstLineOfValueToLog) +
                                    '</code></pre>';

                                    if (typeof Prism !== 'undefined') {
                                        Prism.highlightAllUnder(spanFirstLine);
                                    }

                                    spanExpandCollapse.addEventListener('click', function (evt) { // eslint-disable-line no-unused-vars
                                        var currentlyInCollapsedState = spanExpandCollapse.classList.contains('console-panel-collapsed');

                                        if (currentlyInCollapsedState) {
                                            spanFirstLine.style.display = 'none';
                                            if (spanFullCode) {
                                                spanFullCode.style.display = '';
                                            } else {
                                                spanFullCode = renderFullCode();
                                            }
                                        } else {
                                            spanFirstLine.style.display = '';
                                            spanFullCode.style.display = 'none';
                                        }

                                        spanExpandCollapse.classList.toggle('console-panel-collapsed');
                                        spanExpandCollapse.classList.toggle('console-panel-expanded');
                                    });
                                } else {
                                    renderFullCode();
                                }
                            } else {
                                container.innerHTML = String(valueToLog);           // To ensure that we are setting a string as innerHTML
                            }
                        };

                        updateDom(logEntry[i]);
                    }
                }

                // Show call stack along with console.warn and console.error messages
                if (['error', 'warn'].indexOf(logMode) >= 0) {
                    if (initiator.stack) {
                        var div = document.createElement('div');
                        consoleMessage.appendChild(div);
                        div.className = 'log-call-stack';

                        var initiatorStack = initiator.stack.split('\n');
                        initiatorStack.shift();
                        initiatorStack = initiatorStack.join('\n');
                        div.innerHTML = sanitizeHTML(initiatorStack);
                    }
                }
            }

            if (shouldScrollToBottom && consoleMessageWrapper) {
                consoleMessageWrapper.scrollIntoView(false);
            }

            this.flushCountToIcon();
        };

        ConsolePanel.prototype.logArrayEntry = function (options) {
            var type = options.type || 'unknown',
                initiator = options.initiator || {},
                value = options.value;

            var className = 'log-value-unknown',
                valueToLog = 'not-handled';

            if (type === 'boolean') {
                className = 'log-value-boolean';
                valueToLog = value;
            } else if (type === 'number') {
                className = 'log-value-number';
                valueToLog = value;
            } else if (type === 'string') {
                className = 'log-value-string';
                valueToLog = sanitizeHTML(ellipsis(value.toString(), 5003));
            } else if (type === 'document.all') {
                className = 'log-value-document-all';       // TODO: Not handled in CSS yet
                valueToLog = value;
            } else if (type === 'undefined') {
                className = 'log-value-undefined';
                valueToLog = value;
            } else if (type === 'null') {
                className = 'log-value-null';
                valueToLog = value;
            } else if (type === 'function') {
                className = 'log-value-function';
                valueToLog = value;
            } else if (type === 'console.clear') {
                className = 'log-value-console-clear';
                valueToLog = value;
            } else if (type === 'dom') {
                className = 'log-value-dom';
                valueToLog = value.outerHTML;
            } else if (type === 'dom-text') {
                className = 'log-value-dom-text';
                valueToLog = value.textContent;
            } else if (type === 'window.onerror') {
                className = 'log-value-window-onerror';
                var errorMessageToLog = (function () {
                    // https://blog.sentry.io/2016/01/04/client-javascript-reporting-window-onerror
                    var strError = 'An error occurred';
                    var error = value.error;
                    try {
                        strError = error[4].stack;
                    } catch (e) {
                        try {
                            strError = value.error[0] + '\n' +
                                value.error[1] + ':' + value.error[2] +
                                (
                                    typeof value.error[3] === 'undefined' ?
                                        '' :
                                        ':' + value.error[3]
                                );
                        } catch (e) {
                            // do nothing
                        }
                    }
                    return strError;
                }());
                valueToLog = sanitizeHTML(errorMessageToLog);
            } else if (type === 'array') {
                className = 'log-value-array';
                valueToLog = JSON.parse(CircularJSON.stringify(value, null, '', "[Circular]"));
            } else if (type === 'object') {
                className = 'log-value-object';
                valueToLog = JSON.parse(CircularJSON.stringify(value, null, '', "[Circular]"));
            } else {
                className = 'log-value-unknown';            // TODO: Not handled in CSS yet.
                valueToLog = JSON.parse(CircularJSON.stringify(value, null, '', "[Circular]"));
            }

            return {
                className: className,
                initiator: initiator,
                valueToLog: valueToLog
            };
        };

        ConsolePanel.prototype.markLogEntry = function (logMode, args) {
            var entryToPush = [];
            for (var i = 0; i < args.length; i++) {
                var msg = args[i];

                // TODO:
                //     Handle various native objects
                // References:
                //     http://xahlee.info/js/js_Object.prototype.toString.html
                //     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString
                //     https://gist.github.com/pbakondy/f442e91995e9d206c056
                // Use:
                //     var objectType = Object.prototype.toString.call(msg);

                var logEntryType = 'unknown';

                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof#Description
                if      (typeof msg === 'boolean')              { logEntryType = 'boolean';         }
                else if (typeof msg === 'function')             { logEntryType = 'function';        }
                else if (typeof msg === 'number')               { logEntryType = 'number';          }
                else if (typeof msg === 'string')               { logEntryType = 'string';          }
                else if (typeof msg === 'symbol')               { logEntryType = 'unknown';         } // TODO: Currently using logEntryType as 'unknown' for 'symbol'
                else if (typeof msg === 'object') {
                    if      (msg === null)                      { logEntryType = 'null';            }
                    else if (msg instanceof HTMLElement)        { logEntryType = 'dom';             } // Note: This may not work well for nodes across iframes. See: https://stackoverflow.com/questions/13894644/having-trouble-with-dom-nodes-and-instanceof/13895357#13895357
                    else if (msg instanceof Text)               { logEntryType = 'dom-text';        } // Note: This may not work well for nodes across iframes. See: https://stackoverflow.com/questions/13894644/having-trouble-with-dom-nodes-and-instanceof/13895357#13895357
                    else {
                        if (logMode === 'window.onerror')       { logEntryType = 'window.onerror';  }
                        else if (Array.isArray(msg))            { logEntryType = 'array';           }
                        else                                    { logEntryType = 'object';          }
                    }
                    // TODO:
                    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
                    // Handle various objects, like:
                    //     * "Array" object
                    //     * "Date" object
                    //     * Error objects
                    //           * Error, EvalError, InternalError, RangeError, ReferenceError, SyntaxError, TypeError, URIError
                    //     * "Function" object
                    //     * "Arguments" object
                    //     * various nodeTypes (for example: "Comment" node) // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType#Node_type_constants
                    //     * "RegExp" object
                    //     * "global" object
                    //     * "Math" object
                    //     * "JSON" object
                    //     * Indexed_collections
                    //           * Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array
                    //     * Keyed_collections
                    //           * Map, Set, WeakMap, WeakSet
                    //     * Structured_data
                    //           * ArrayBuffer, SharedArrayBuffer, Atomics, DataView
                    //     * Control_abstraction_objects
                    //           * Promise, Generator, GeneratorFunction, AsyncFunction
                    //     * Reflection
                    //           * Reflect, Proxy
                    //     * Internationalization
                    //           * Intl, Intl.Collator, Intl.DateTimeFormat, Intl.NumberFormat
                    //     * WebAssembly
                    //           * WebAssembly, WebAssembly.Module, WebAssembly.Instance, WebAssembly.Memory, WebAssembly.Table, WebAssembly.CompileError, WebAssembly.LinkError, WebAssembly.RuntimeError
                }
                else if (typeof msg === 'undefined') {
                    if (msg === document.all)                   { logEntryType = 'document.all';    }     // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof#Exceptions
                    else                                        { logEntryType = 'undefined';       }
                }
                else                                            { logEntryType = 'unknown';         }     // Handle any unknown "typeof"

                entryToPush.push(
                    this.logArrayEntry({
                        type: logEntryType,
                        value: msg
                    })
                );
            }

            var report = {
                logMode: logMode,
                time: new Date(),
                logEntry: entryToPush
            };
            if (this.config.reportLogLines) {
                if (logMode === 'window.onerror') {
                    report.initiator = getCurrentExecutionDetails({skipLevels: 0, stack: (args[0].error[4] || {}).stack});
                } else {
                    report.initiator = getCurrentExecutionDetails({skipLevels: 5});
                }
            } else {
                report.initiator = {};
            }

            var that = this;
            that.arrLogs.push(report);
            ready(function () {
                that.flushLogsToUIAsync();
            });
        };

        ConsolePanel.prototype.clear = function () {
            var that = this;

            var reportLogLines = that.config.reportLogLines;

            // Since console is being cleared, "arrLogs" can be emptied
            that.arrLogs = [];

            that.arrLogs.push({
                logMode: 'clear',
                time: new Date(),
                logEntry: [
                    that.logArrayEntry({
                        type: 'console.clear',
                        value: 'Console was cleared'
                    })
                ],
                initiator: reportLogLines ?
                    getCurrentExecutionDetails({skipLevels: 4}) :
                    {}
            });

            that.loggerBody.innerHTML = '';
            that.flushLogsToUIAsync();
        };

        ConsolePanel.prototype.setupIntercept = function () {
            var that = this;
            var originals = that.originals;
            var functionsToIntercept = that.config.functionsToIntercept;

            var interceptIfRequired = function (type, original, cb) {
                if (
                    functionsToIntercept === 'all' ||
                    functionsToIntercept.indexOf(type) >= 0
                ) {
                    return cb();
                } else {
                    return original;
                }
            };

            originals['window.onerror'] = interceptIfRequired('window.onerror', originals['window.onerror'], function () { return after(window,     'onerror', function () { that.markLogEntry('window.onerror', [{ error: arguments }]); }); });

            // Note: console.clear() would be intercepted in all cases, therefore, not using interceptIfRequired()
            originals['console.clear' ] = after(varConsole, 'clear',  function () { that.clear(); }, console);

            originals['console.log'   ] = interceptIfRequired('console.log',    originals['console.log'   ], function () { return after(varConsole, 'log',     function () { that.markLogEntry('log',   arguments); }, console); });
            originals['console.info'  ] = interceptIfRequired('console.info',   originals['console.info'  ], function () { return after(varConsole, 'info',    function () { that.markLogEntry('info',  arguments); }, console); });
            originals['console.warn'  ] = interceptIfRequired('console.warn',   originals['console.warn'  ], function () { return after(varConsole, 'warn',    function () { that.markLogEntry('warn',  arguments); }, console); });
            originals['console.error' ] = interceptIfRequired('console.error',  originals['console.error' ], function () { return after(varConsole, 'error',   function () { that.markLogEntry('error', arguments); }, console); });

            Object.keys(varConsole).forEach(function (key) {
                if (['log', 'info', 'warn', 'error', 'clear'].indexOf(key) === -1) {
                    if (typeof varConsole[key] === 'function') {
                        originals['console.' + key] = interceptIfRequired(key, originals['console.' + key], function () { return after(varConsole, key, function () { that.markLogEntry('unhandled', arguments); }, console); });
                    }
                }
            });
        };

        ConsolePanel.prototype.render = function () {
            var that = this;

            var consolePanelContainer = document.createElement('div');
            consolePanelContainer.id = 'console-panel';
            document.body.appendChild(consolePanelContainer);

            var devToolsIconContainer = document.createElement('div');
            this.devToolsIconContainer = devToolsIconContainer;
            consolePanelContainer.appendChild(devToolsIconContainer);

            var devToolsIconStrongNotification = document.createElement('div');
            this.devToolsIconStrongNotification = devToolsIconStrongNotification;
            devToolsIconContainer.appendChild(devToolsIconStrongNotification);

            var devToolsIcon = document.createElement('div');
            this.devToolsIcon = devToolsIcon;
            devToolsIcon.className = 'dev-tools-icon no-unread-messages';

            devToolsIcon.addEventListener('click', function (evt) { // eslint-disable-line no-unused-vars
                that.showConsolePanel();
                that.hideDevToolsIconContainer();
            });

            this.hideDevToolsIconContainer();
            devToolsIconStrongNotification.appendChild(devToolsIcon);

            var devTools = document.createElement('div');
            this.devTools = devTools;
            consolePanelContainer.appendChild(devTools);
            devTools.className = 'dev-tools';

            this.hideConsolePanel();
            devTools.style.height = (function () {
                var height = parseInt(userPreference('consolePanelHeight'), 10);
                if (height >= 0 && height <= Infinity) {
                    // do nothing
                } else {
                    height = defaultUserPreference[getFullKey('consolePanelHeight')];
                }
                return height + 'px';
            }());

            // Just a block
            {
                var devToolsHeader = document.createElement('div');
                devTools.appendChild(devToolsHeader);
                devToolsHeader.className = 'dev-tools-header';

                // Just a block
                {
                    var consoleDragHandle = document.createElement('div');
                    devToolsHeader.appendChild(consoleDragHandle);
                    consoleDragHandle.className = 'dev-tools-resize-handle';
                    consoleDragHandle.innerHTML = '&nbsp;';

                    var crossIcon = document.createElement('div');
                    devToolsHeader.appendChild(crossIcon);
                    crossIcon.title = 'Close';
                    crossIcon.className = 'dev-tools-header-cross-icon';

                    crossIcon.addEventListener('click', function (evt) { // eslint-disable-line no-unused-vars
                        that.hideConsolePanel();
                        that.showDevToolsIconContainer();
                    });

                    var disableIcon = document.createElement('div');
                    that.disableIcon = disableIcon;
                    disableIcon.title = constants.DISABLE_FOR_THIS_INSTANCE;
                    disableIcon.className = 'dev-tools-header-disable-icon';
                    disableIcon.addEventListener('click', function (evt) { // eslint-disable-line no-unused-vars
                        if (that.config && typeof that.config.beforeDisableButtonClick === 'function') {
                            var doContinue = that.config.beforeDisableButtonClick();
                            if (doContinue === false) {
                                return;
                            }
                        }
                        that.hideConsolePanel();
                        that.disable();
                    });
                    devToolsHeader.appendChild(disableIcon);


                    var clearConsoleIcon = document.createElement('div');
                    devToolsHeader.appendChild(clearConsoleIcon);
                    clearConsoleIcon.title = 'Clear';
                    clearConsoleIcon.className = 'dev-tools-clear-console-icon';

                    clearConsoleIcon.addEventListener('click', function (evt) { // eslint-disable-line no-unused-vars
                        // For most of the situations/browsers, the call to that.clear() is redundant here because immediately
                        // after it, we are calling console.clear() which internally calls that.clear()
                        // But, in some cases, if console.clear() call is not intercepted (eg: In some situations
                        // in IE / Edge or for any future changes where console.clear() may be skipped from
                        // interception), then we shall call it manually.
                        that.clear();

                        console.clear();
                    });


                    var consoleTitle = document.createElement('div');
                    devToolsHeader.appendChild(consoleTitle);
                    consoleTitle.innerHTML = 'Console';
                    consoleTitle.style.cssFloat = 'left';
                }

                if ($ && $.fn && $.fn.resizable) {
                    // Just a preventive try...catch block
                    try {
                        var $devTools = $('.dev-tools');
                        if ($.ui) {
                            // http://api.jqueryui.com/resizable/#option-handles
                            consoleDragHandle.classList.add('ui-resizable-handle');
                            consoleDragHandle.classList.add('ui-resizable-n');

                            $devTools.resizable({
                                handles: {
                                    n: $devTools.find('.dev-tools-resize-handle')
                                },
                                stop: function (evt, ui) { // eslint-disable-line no-unused-vars
                                    userPreference('consolePanelHeight', ui.size.height);
                                }
                            });
                        } else {
                            $devTools.resizable({
                                handleSelector: '.dev-tools-resize-handle',
                                resizeWidth: false,
                                resizeHeightFrom: 'top',
                                onDragEnd: function (e, $el, opt) { // eslint-disable-line no-unused-vars
                                    userPreference('consolePanelHeight', $el.outerHeight());
                                }
                            });
                        }

                        // Use this styling only when the resizing has been setup
                        consoleDragHandle.style.cursor = 'n-resize';
                    } catch (e) {
                        alertNote(
                            'Error in setting up "resize" for console-panel' +
                            ' (' +
                            '<a target="_blank" href="https://github.com/webextensions/console-panel#full-featured-setup">Learn more</a>' +
                            ')',
                            10000
                        );
                    }
                }

                var logger = document.createElement('div');
                this.logger = logger;
                devTools.appendChild(logger);
                logger.className = 'dev-tools-console';

                // Just a block
                {
                    var loggerHeader = document.createElement('div');
                    logger.appendChild(loggerHeader);
                    loggerHeader.className = 'dev-tools-console-header';

                    var loggerBody = document.createElement('div');
                    this.loggerBody = loggerBody;
                    logger.appendChild(loggerBody);
                    loggerBody.className = 'dev-tools-console-body';
                }
            }

            window.addEventListener('console-panel-devtoolschange', function (e) {
                if (that.config.doNotUseWhenDevToolsMightBeOpenInTab) {
                    if (e.detail.open) {
                        that.hideBecauseDevToolsIsOpen();
                    } else {
                        that.showBecauseDevToolsIsClosed();
                    }
                }
            });
            moduleGlobal.updateDevToolsStatus();  // Ensure that the 'console-panel-devtoolschange' event gets fired once (if required)
        };

        /*
            config {}
                position
                    Summary: Position of console-panel's icon
                    Type: string
                    Supported positions: "top-left", "top-right", "bottom-left", "bottom-right"
                    Default value: "bottom-right",
                    Example value: "top-right"
                functionsToIntercept
                    Summary: List of console functions which should be intercepted
                    Type: <falsy-value> OR "all" OR array (of strings)
                    Supported function names: "window.onerror", "console.error", "console.warn", "console.info", "console.log"
                    Default value: "all",
                    Example value: ["window.onerror", "console.error"]
                    Notes: console.clear() would always get intercepted when console-panel is enabled
                showOnlyForTheseRelevantMessages
                    Summary: List of console function calls for which console-panel icon should be shown
                    Type: <falsy-value> OR "all" OR array (of strings)
                    Supported function names: "window.onerror", "console.error", "console.warn", "console.info", "console.log"
                    Default value: null
                    Example value: ["window.onerror", "console.error", "console.warn"]
                    Notes: If it is a <falsy-value>, then console-panel notification icon would be shown all the time
                strongNotificationFor
                    Summary: List of console function calls for which console-panel notification should be shown strongly
                    Type: <falsy-value> OR array (of strings)
                    Supported function names: "window.onerror", "console.error", "console.warn", "console.info", "console.log"
                    Default value: ["window.onerror", "console.error"]
                    Example value: ["window.onerror", "console.error", "console.warn"]
                skipStrongNotificationIfNoStackTrace
                    Summary: When it is set as true, "strong-notification" effect is not shown for errors for which stack
                             trace is not available. This can be used to avoid highlighting errors which are occurring due
                             to a cross-origin / third-party script.
                    Type: boolean
                    Allowed values: <falsy-value> OR <truthy-value>
                    Default value: false
                    Example value: false
                reportLogLines
                    Summary: When it is set as true, the corresponding code line is mentioned along with each console entry.
                             When it is set as true, it may interrupt your debugging session if you are using the "Pause on
                             caught exceptions" feature in browser DevTools
                    Type: boolean
                    Allowed values: <falsy-value> OR <truthy-value>
                    Default value: true
                    Example value: true
                doNotUseWhenDevToolsMightBeOpenInTab
                    Summary: Disable console-panel if browser DevTools might be open within the tab
                    Type: boolean
                    Allowed values: <falsy-value> OR <truthy-value>
                    Default value: false
                    Example value: false
                    Reference: https://github.com/sindresorhus/devtools-detect#support
                disableButtonTitle
                    Summary: Customize the title for the "disable" button in console-panel
                    Type: string
                    Allowed values: Any non-empty string
                    Default value: "Disable for this instance"
                    Example value: "Disable\n(and keep disabled)"
                beforeDisableButtonClick
                    Summary: Function to be called before performing the default action for "disable" button
                    Type: function
                    Example value: function () { localStorage['console-panel-status'] = 'disabled'; }
                    Notes: If this function returns boolean "false", then the default action would not be performed
        */
        ConsolePanel.prototype.enable = function (config) {
            config = config || {};

            var that = this;

            // If consolePanel is already enabled
            if (that.enabled) {
                // Disable consolePanel
                that.disable();
            }

            var functionsToIntercept = (function () {
                    if (Array.isArray(config.functionsToIntercept)) {
                        return config.functionsToIntercept;
                    } else {
                        return 'all';
                    }
                }()),
                showOnlyForTheseRelevantMessages = config.showOnlyForTheseRelevantMessages || null,
                strongNotificationFor = config.strongNotificationFor || ['window.onerror', 'console.error'],
                skipStrongNotificationIfNoStackTrace = config.skipStrongNotificationIfNoStackTrace || false,
                reportLogLines = typeof config.reportLogLines === 'undefined' ? true : !!config.reportLogLines,
                doNotUseWhenDevToolsMightBeOpenInTab = typeof config.doNotUseWhenDevToolsMightBeOpenInTab === 'undefined' ? false : config.doNotUseWhenDevToolsMightBeOpenInTab,
                disableButtonTitle = (typeof config.disableButtonTitle === 'string' && config.disableButtonTitle !== '') ? config.disableButtonTitle : constants.DISABLE_FOR_THIS_INSTANCE,
                beforeDisableButtonClick = config.beforeDisableButtonClick,
                position = (function () {
                    switch(config.position) {
                        case 'top-left':
                        case 'top-right':
                        case 'bottom-left':
                        case 'bottom-right':
                        case 'left-top':
                        case 'left-bottom':
                        case 'right-top':
                        case 'right-bottom':
                            return config.position;
                        default:
                            return 'bottom-right';
                    }
                }());

            (function (config) {
                config.functionsToIntercept = functionsToIntercept;
                config.showOnlyForTheseRelevantMessages = showOnlyForTheseRelevantMessages;
                config.strongNotificationFor = strongNotificationFor;
                config.skipStrongNotificationIfNoStackTrace = skipStrongNotificationIfNoStackTrace;
                config.doNotUseWhenDevToolsMightBeOpenInTab = doNotUseWhenDevToolsMightBeOpenInTab;
                config.disableButtonTitle = disableButtonTitle;
                config.beforeDisableButtonClick = beforeDisableButtonClick;
                config.position = position;
            }(that.config));

            that.setupIntercept();

            if (reportLogLines) {
                that.enableReportLogLines();
            } else {
                that.disableReportLogLines();
            }

            if (!that.domReady) {
                ready(function () {
                    that.render();
                    that.domReady = true;
                });
            }

            ready(function () {
                that.setButtonPosition(position);
                that.disableIcon.title = disableButtonTitle;

                if (
                    showOnlyForTheseRelevantMessages ||
                    (
                        that.config.doNotUseWhenDevToolsMightBeOpenInTab &&
                        (function () {
                            var devtoolsStatus = moduleGlobal.getDevToolsStatus();
                            return devtoolsStatus && devtoolsStatus.open;
                        }())
                    )
                ) {
                    // do nothing
                } else {
                    that.showDevToolsIconContainer();
                }

                that.flushLogsToUIAsync();
            });

            that.enabled = true;
        };
        ConsolePanel.prototype.disable = function () {
            var that = this;

            // Restore window.onerror
            window.onerror = that.originals['window.onerror'];

            // Restore console functions
            Object.keys(varConsole).forEach(function (key) {
                if (that.originals['console.' + key]) {  // Ensure that we have over-ridden that console member (function)
                    varConsole[key] = that.originals['console.' + key];
                }
            });

            that.enabled = false;
        };

        ConsolePanel.prototype.enableReportLogLines = function () {
            this.config.reportLogLines = true;
        };
        ConsolePanel.prototype.disableReportLogLines = function () {
            this.config.reportLogLines = false;
        };

        return ConsolePanel;
    }());

    window.consolePanel = new ConsolePanel();
}(window.jQuery));
