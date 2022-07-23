var googleAuth = (function () {
  function Auth() {
    this.installClient = () => {
    var apiUrl = "https://accounts.google.com/gsi/client";
    return new Promise((resolve) => {
      var script = document.createElement("script");
      script.id = "gsi-client"
      script.src = apiUrl;
      script.onreadystatechange = script.onload = function () {
        if (!script.readyState || /loaded|complete/.test(script.readyState)) {
          console.log(google)
          setTimeout(function () {
            resolve();
          }, 500);
        }
      };
      document.getElementsByTagName("head")[0].appendChild(script);
    });
  }

  this.initClient = (config) => {
    return new Promise((resolve, reject) => {
      console.log("HERE1")
      this.client = google.accounts.oauth2.initTokenClient({
        client_id: config.clientId,
        scope: config.scope,
        callback: config.callback,
        access_type: 'offline',
      });
    })
  }

    if (!(this instanceof Auth)) return new Auth();
    this.GoogleAuth = null; /* window.gapi.auth2.getAuthInstance() */
    this.isAuthorized = false;
    this.isInit = false;
    this.prompt = null;
    this.isLoaded = function () {
      /* eslint-disable */
      console.warn(
        'isLoaded() will be deprecated. You can use "this.$gAuth.isInit"'
      );
      return !!this.GoogleAuth;
    };

    this.load = (config, prompt) => {
      this.installClient()
        .then(() => {
          this.initClient(config)
        })
        .catch((error) => {
          console.error(error);
        });
    };

    this.getAuthCode = (successCallback, errorCallback) => {
      this.client.requestAccessToken();
    };

    this.signOut = (successCallback, errorCallback) => {
      return new Promise((resolve, reject) => {
        if (!this.GoogleAuth) {
          if (typeof errorCallback === "function") errorCallback(false);
          reject(false);
          return;
        }
        this.GoogleAuth.signOut()
          .then(() => {
            if (typeof successCallback === "function") successCallback();
            this.isAuthorized = false;
            resolve(true);
          })
          .catch((error) => {
            if (typeof errorCallback === "function") errorCallback(error);
            reject(error);
          });
      });
    };
  }

  return new Auth();
})();

function installGoogleAuthPlugin(Vue, options) {
  /* eslint-disable */
  //set config
  let GoogleAuthConfig = null;
  let GoogleAuthDefaultConfig = { scope: "profile email" };
  let prompt = "select_account";
  if (typeof options === "object") {
    GoogleAuthConfig = Object.assign(GoogleAuthDefaultConfig, options);
    if (options.scope) GoogleAuthConfig.scope = options.scope;
    if (options.prompt) prompt = options.prompt;
    if (!options.clientId) {
      console.warn("clientId is required");
    }
  } else {
    console.warn("invalid option type. Object type accepted only");
  }

  //Install Vue plugin
  Vue.gAuth = googleAuth;
  Object.defineProperties(Vue.prototype, {
    $gAuth: {
      get: function () {
        return Vue.gAuth;
      },
    },
  });
  Vue.gAuth.load(GoogleAuthConfig, prompt);
}

export default installGoogleAuthPlugin;
