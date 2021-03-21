class BoilerKey {

  static requestPassword() {
    const secret = localStorage.getItem("key-hotp");

    if(!secret) {
      console.log("Error: No HOTP");
      return;
    }

    let count = localStorage.getItem("key-counter");

    if(count) {
      count = parseInt(count) + 1;
    } else {
      count = 1;
    }

    localStorage.setItem("key-counter", count);

    let hotp = new jsOTP.hotp();
    return hotp.getOtp(secret, count);
  }

  static login(cb) {
    if (BoilerKey.hasData()) {
      BoilerKey.addAuthentication(localStorage.getItem("username"), localStorage.getItem("pin")+","+BoilerKey.requestPassword(), cb);
    }
    else {
      cb(false);
    }
  }

  static genBoilerKey(name, cb, cbStatus) {
    let username = localStorage.getItem("username");
    let pin = localStorage.getItem("pin");

    if ((username === null) || (pin === null)) {
      cb(null);
    }

    cbStatus(0,5);

    let headers = {
      "User-Agent": "okhttp/3.11.0"
    }

    fetch("https://www.purdue.edu/apps/account/flows/BoilerKey", {
      method: "GET",
      headers: headers,
    })
    .then(res => res.text())
    .then(res => {
      // find execution flow number
      var sub_to_find = "/apps/account/flows/BoilerKey?execution=";
      var start_ind = res.indexOf(sub_to_find);
      if (start_ind == -1) {
        // execution flow number not found?!
        throw "execution flow number not found";
      }
      else {
        start_ind += sub_to_find.length;
      }
      var flow_str = res.substring(start_ind, res.indexOf('"', start_ind));

      cbStatus(1,5);

      let new_post_data = {
          "_eventId": "boilerKeyDuoMobileCreate",
          "_flowExecutionKey": flow_str,
          "phoneName": null,
          "execution": flow_str,
      }
      var urlParams = new URLSearchParams(Object.entries(new_post_data));

      // send post to login
      fetch("https://www.purdue.edu/apps/account/flows/BoilerKey", {
        method: "POST",
        headers: headers,
        body: urlParams,
      })
      .then(res => res.text())
      .then(res => {
        // find execution flow number
        var sub_to_find = "/apps/account/flows/BoilerKey?execution=";
        var start_ind = res.indexOf(sub_to_find);
        if (start_ind == -1) {
          // execution flow number not found?!
          throw "execution flow number not found";
        }
        else {
          start_ind += sub_to_find.length;
        }
        var flow_str = res.substring(start_ind, res.indexOf('"', start_ind));

        cbStatus(2,5);

        let cont_post_data = {
                "_eventId": "duoMobileCreateProcessDownloadAppAction",
                "_flowExecutionKey": flow_str,
                "execution": flow_str,
        }
        urlParams = new URLSearchParams(Object.entries(cont_post_data));

        fetch("https://www.purdue.edu/apps/account/flows/BoilerKey", {
          method: "POST",
          headers: headers,
          body: urlParams,
        })
        .then(res => res.text())
        .then(res => {
          // find execution flow number
          var sub_to_find = "/apps/account/flows/BoilerKey?execution=";
          var start_ind = res.indexOf(sub_to_find);
          if (start_ind == -1) {
            // execution flow number not found?!
            throw "execution flow number not found";
          }
          else {
            start_ind += sub_to_find.length;
          }
          var flow_str = res.substring(start_ind, res.indexOf('"', start_ind));

          cbStatus(3,5);

          let pin_post_data = {
                  "_eventId": "duoMobileCreateProcessSetPinAction",
                  "_flowExecutionKey": flow_str,
                  "execution": flow_str,
                  "existingPin": pin,
          }
          urlParams = new URLSearchParams(Object.entries(pin_post_data));

          fetch("https://www.purdue.edu/apps/account/flows/BoilerKey", {
            method: "POST",
            headers: headers,
            body: urlParams,
          })
          .then(res => res.text())
          .then(res => {
            // find execution flow number
            var sub_to_find = "/apps/account/flows/BoilerKey?execution=";
            var start_ind = res.indexOf(sub_to_find);
            if (start_ind == -1) {
              // execution flow number not found?!
              throw "execution flow number not found";
            }
            else {
              start_ind += sub_to_find.length;
            }
            var flow_str = res.substring(start_ind, res.indexOf('"', start_ind));

            cbStatus(4,5);

            let name_post_data = {
                    "_eventId": "duoMobileCreateProcessNameDeviceAction",
                    "_flowExecutionKey": flow_str,
                    "execution": flow_str,
                    "phoneName": name,
            }
            urlParams = new URLSearchParams(Object.entries(name_post_data));

            fetch("https://www.purdue.edu/apps/account/flows/BoilerKey", {
              method: "POST",
              headers: headers,
              body: urlParams,
            })
            .then(res => res.text())
            .then(res => {
              // find duo url
              sub_to_find = 'https://m-1b9bef70.duosecurity.com/activate/';
              start_ind = res.indexOf(sub_to_find);
              if (start_ind == -1) {
                // duo url not found?!
                throw "duo url not found";
              }

              cbStatus(5,5);

              let duo_url = res.substring(start_ind, res.indexOf('"', start_ind));
              cb(duo_url);
            })
            .catch(error => {
              console.log(error);
              alert("Invalid device name! You already have a BoilerKey device with this name!")
              cb(null);
            })
          })
          .catch(error => {
            console.log(error);
            alert("Invalid pin! Please check that you enter the correct PIN.")
            cb(null);
          })
        })
        .catch(error => {
          console.log(error);
          alert("There was an error. Please try again later.")
          cb(null);
        })
      })
      .catch(error => {
        console.log(error);
        alert("There was an error. Please try again later.")
        cb(null);
      })
    })
    .catch(error => {
      console.log(error);
      alert("There was an error. Please try again later.")
      cb(null);
    })
  }

  static addAuthentication(username, password, cb) {
    chrome.cookies.remove({ url: 'https://www.purdue.edu/apps/account/cas/login', name: 'JSESSIONID' },
      (cookie) => {
        if (!cookie) {
          console.log('Can\'t remove cookie!');
        }
    });

    let headers = {
      "User-Agent": "okhttp/3.11.0"
    }

    fetch("https://www.purdue.edu/apps/account/cas/login", {
      method: "GET",
      headers: headers
    })
    .then(res => res.text())
    .then(res => {
      // find lt secret
      var sub_to_find = '<input type="hidden" name="lt" value="';
      var start_ind = res.indexOf(sub_to_find);
      if (start_ind == -1) {
        // lt secret not found?!
        throw "lt secret not found";
      }
      else {
         start_ind += sub_to_find.length;
      }
      let lt = res.substring(start_ind, res.indexOf('"', start_ind));

      // find post url
      sub_to_find = '<form id="fm1" action="';
      start_ind = res.indexOf(sub_to_find);
      if (start_ind == -1) {
        // lt secret not found?!
        throw "post form url not found";
      }
      else {
         start_ind += sub_to_find.length;
      }
      let login_form_url = "https://www.purdue.edu" + res.substring(start_ind, res.indexOf('"', start_ind));

      // generate login payload
      let login_payload = {
          'username': username,
          'password': password,
          'lt': lt,
          'execution': 'e1s1',
          '_eventId': 'submit',
          'submit': 'Login'
      }
      let urlParams = new URLSearchParams(Object.entries(login_payload));
      let uri = login_form_url + "?" + urlParams;

      // send post to login
      fetch(uri, {
        method: "POST",
        headers: headers
      })
      // .then(res => res.text())
      .then(res => {
        cb(true);
      })
      .catch(error => {
        console.log(error);
        cb(false);
      })
    })
    .catch(error => {
      console.log(error);
      cb(false);
    })
  }

  static updateLoginStatus(cb) {
    let headers = {
      "User-Agent": "okhttp/3.11.0"
    }

    fetch("https://www.purdue.edu/apps/account/cas/login?service=https%3A%2F%2Fwl.mypurdue.purdue.edu%2Fc%2Fportal%2Flogin", {
      method: "GET",
      headers: headers,
      redirect: "manual",
    })
    .then(res => {
      if (res.type == "opaqueredirect") {
        console.log("logged in");
        cb(true);
      }
      else {
        console.log("not logged in");
        cb(false);
      }
    })
    .catch(error => {
      console.log(error);
      cb(false);
    });
  }

  static sendRequest(url, cb) {
    let code = url.split("/activate/")[1];

    let headers = {
      "User-Agent": "okhttp/3.11.0"
    }

    let params = {
        "app_id": "com.duosecurity.duomobile.app.DMApplication",
        "app_version": "2.3.3",
        "app_build_number": "323206",
        "full_disk_encryption": "False",
        "manufacturer": "Google",
        "model": "Pixel",
        "platform": "Android",
        "jailbroken": "False",
        "version": "6.0",
        "language": "EN",
        "customer_protocol": 1
    }

    const urlParams = new URLSearchParams(Object.entries(params));
    let uri = "https://api-1b9bef70.duosecurity.com/push/v2/activation/" + code + "?" + urlParams;

    fetch(uri, {
      method: "POST",
      headers: headers
    })
    .then(res => res.json())
    .then(res => {
      const hotpSecret = res["response"]["hotp_secret"];
      localStorage.setItem("key-hotp", hotpSecret);
      localStorage.setItem("key-counter", 1);
      cb(true);
    })
    .catch(error => {
      console.log(error);
      cb(false);
    })
  }

  static addUrl(url, cb) {
    if(url.includes("m-1b9bef70.duosecurity.com")) {
      BoilerKey.sendRequest(url, cb);
    }
  }

  static hasData() {
    if ((localStorage.getItem("key-hotp") === null) ||
        (localStorage.getItem("key-counter") === null) ||
        (localStorage.getItem("username") === null) ||
        (localStorage.getItem("pin") === null)) {
      return false;
    }
    return true;
  }

  static clearData() {
    localStorage.removeItem("key-hotp");
    localStorage.removeItem("key-counter");
    localStorage.removeItem("username");
    localStorage.removeItem("pin");
  }

  static incrementCounter() {
    let count = localStorage.getItem("key-counter");

    if(count) {
      localStorage.setItem("key-counter", count + 1);
      return count + 1;
    } else {
      return null;
    }
  }
}
