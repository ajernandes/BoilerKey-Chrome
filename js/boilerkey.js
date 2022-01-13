class BoilerKey {

  static makeStr(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  // returns dict of {username, password}
  static getLoginDetails(cb) {
    chrome.storage.local.get(['keyHotp', 'username', 'pin'], function(result) {
      if ('keyHotp' in result) {
        BoilerKey.incrementCounter((count) => {
          let hotp = new jsOTP.hotp();
          let pass = hotp.getOtp(result.keyHotp, count);
          cb({
            username: result.username,
            password: result.pin + "," + pass
          });
        });
      } else {
        console.error("Error: No HOTP");
        cb(null);
      }
    });
  }

  static requestPassword(cb) {
    chrome.storage.local.get(['keyHotp'], function(result) {
      if ('keyHotp' in result) {
        BoilerKey.incrementCounter((count) => {
          let hotp = new jsOTP.hotp();
          let pass = hotp.getOtp(result.keyHotp, count);
          cb(pass);
        });
      } else {
        console.error("Error: No HOTP");
        return;
      }
    });
  }

  static login(cb) {
    if (BoilerKey.hasData()) {
      BoilerKey.getLoginDetails((det) => {
        if (det) {
          BoilerKey.addAuthentication(det.username, det.password, cb);
        }
      })
      // BoilerKey.requestPassword((pass) => {
      //   chrome.storage.local.get(['username', 'pin'], function(result) {
      //     let username = result.username;
      //     let pin = result.pin;
      //
      //   });
      // });
    } else {
      cb(false);
    }
  }

  static genBoilerKey(name, cb, cbStatus) {
    chrome.storage.local.get(['username', 'pin'], function(result) {
      if (!('username' in result) && !('pin' in result)) {
        cb(null);
      }

      let username = result.username;
      let pin = result.pin;

      cbStatus(0, 5);

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
          } else {
            start_ind += sub_to_find.length;
          }
          var flow_str = res.substring(start_ind, res.indexOf('"', start_ind));

          cbStatus(1, 5);

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
              } else {
                start_ind += sub_to_find.length;
              }
              var flow_str = res.substring(start_ind, res.indexOf('"', start_ind));

              cbStatus(2, 5);

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
                  } else {
                    start_ind += sub_to_find.length;
                  }
                  var flow_str = res.substring(start_ind, res.indexOf('"', start_ind));

                  cbStatus(3, 5);

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
                      } else {
                        start_ind += sub_to_find.length;
                      }
                      var flow_str = res.substring(start_ind, res.indexOf('"', start_ind));

                      cbStatus(4, 5);

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

                          cbStatus(5, 5);

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
    });
  }

  static totGenBoilerKey(password, name, cb, cbStatus) {
    chrome.storage.local.get(['username', 'pin'], function(result) {
      if (!('username' in result) && !('pin' in result)) {
        cb(null);
      }

      let username = result.username;
      let pin = result.pin;

      cbStatus(0, 6);

      let headers = {
        "User-Agent": "okhttp/3.11.0"
      }

      chrome.cookies.remove({
          url: 'https://www.purdue.edu/apps/account/cas/login',
          name: 'JSESSIONID'
        },
        (cookie) => {
          if (!cookie) {
            console.log('Can\'t remove cookie!');
          }
          fetch("https://www.purdue.edu/apps/account/flows/BoilerKey", {
              method: "GET",
              headers: headers
            })
            .then(res => res.text())
            .then(res => {

              var sub_to_find = '<title>Purdue Web Authentication</title>'
              var start_ind = res.indexOf(sub_to_find);
              if (start_ind == -1) {
                // find execution flow number
                var sub_to_find = "/apps/account/flows/BoilerKey?execution=";
                var start_ind = res.indexOf(sub_to_find);
                if (start_ind == -1) {
                  // execution flow number not found?!
                  throw "execution flow number not found";
                } else {
                  start_ind += sub_to_find.length;
                }
                var flow_str = res.substring(start_ind, res.indexOf('"', start_ind));

                cbStatus(2, 6);

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
                    } else {
                      start_ind += sub_to_find.length;
                    }
                    var flow_str = res.substring(start_ind, res.indexOf('"', start_ind));

                    cbStatus(3, 6);

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
                        } else {
                          start_ind += sub_to_find.length;
                        }
                        var flow_str = res.substring(start_ind, res.indexOf('"', start_ind));

                        cbStatus(4, 6);

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
                            } else {
                              start_ind += sub_to_find.length;
                            }
                            var flow_str = res.substring(start_ind, res.indexOf('"', start_ind));

                            cbStatus(5, 6);

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

                                cbStatus(6, 6);

                                let duo_url = res.substring(start_ind, res.indexOf('"', start_ind));
                                cb(duo_url);
                              })
                              .catch(error => {
                                // find execution flow number
                                var sub_to_find = "/apps/account/flows/BoilerKey?execution=";
                                var start_ind = res.indexOf(sub_to_find);
                                if (start_ind == -1) {
                                  // execution flow number not found?!
                                  throw "execution flow number not found";
                                } else {
                                  start_ind += sub_to_find.length;
                                }
                                var flow_str = res.substring(start_ind, res.indexOf('"', start_ind));

                                // console.log(error);
                                // alert("Invalid device name! You already have a BoilerKey device with this name!")
                                let sec_try_name_post_data = {
                                  "_eventId": "duoMobileCreateProcessNameDeviceAction",
                                  "_flowExecutionKey": flow_str,
                                  "execution": flow_str,
                                  "phoneName": name + "_" + BoilerKey.makeStr(5),
                                }
                                urlParams = new URLSearchParams(Object.entries(sec_try_name_post_data));

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

                                    cbStatus(6, 6);

                                    let duo_url = res.substring(start_ind, res.indexOf('"', start_ind));
                                    cb(duo_url);
                                  })
                                  .catch(error => {
                                    console.log(error);
                                    alert("Invalid device name! You already have a BoilerKey device with this name!")
                                    cb(null);
                                  })
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
                return;
              }

              // find lt secret
              var sub_to_find = '<input type="hidden" name="lt" value="';
              var start_ind = res.indexOf(sub_to_find);
              if (start_ind == -1) {
                // lt secret not found?!
                throw "lt secret not found";
              } else {
                start_ind += sub_to_find.length;
              }
              let lt = res.substring(start_ind, res.indexOf('"', start_ind));

              // find post url
              sub_to_find = '<form id="fm1" action="';
              start_ind = res.indexOf(sub_to_find);
              if (start_ind == -1) {
                // lt secret not found?!
                throw "post form url not found";
              } else {
                start_ind += sub_to_find.length;
              }
              let login_form_url = "https://www.purdue.edu" + res.substring(start_ind, res.indexOf('"', start_ind));

              cbStatus(1, 6);

              // generate login payload
              let login_payload = {
                'username': username,
                'password': password,
                'lt': lt,
                'execution': 'e1s1',
                '_eventId': 'submit',
                'submit': 'Login'
              }
              urlParams = new URLSearchParams(Object.entries(login_payload));
              let uri = login_form_url + "&" + urlParams;

              // send post to login
              fetch(uri, {
                  method: "POST",
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
                  } else {
                    start_ind += sub_to_find.length;
                  }
                  var flow_str = res.substring(start_ind, res.indexOf('"', start_ind));

                  cbStatus(2, 6);

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
                      } else {
                        start_ind += sub_to_find.length;
                      }
                      var flow_str = res.substring(start_ind, res.indexOf('"', start_ind));

                      cbStatus(3, 6);

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
                          } else {
                            start_ind += sub_to_find.length;
                          }
                          var flow_str = res.substring(start_ind, res.indexOf('"', start_ind));

                          cbStatus(4, 6);

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
                              } else {
                                start_ind += sub_to_find.length;
                              }
                              var flow_str = res.substring(start_ind, res.indexOf('"', start_ind));

                              cbStatus(5, 6);

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

                                  cbStatus(6, 6);

                                  let duo_url = res.substring(start_ind, res.indexOf('"', start_ind));
                                  cb(duo_url);
                                })
                                .catch(error => {
                                  // find execution flow number
                                  var sub_to_find = "/apps/account/flows/BoilerKey?execution=";
                                  var start_ind = res.indexOf(sub_to_find);
                                  if (start_ind == -1) {
                                    // execution flow number not found?!
                                    throw "execution flow number not found";
                                  } else {
                                    start_ind += sub_to_find.length;
                                  }
                                  var flow_str = res.substring(start_ind, res.indexOf('"', start_ind));

                                  // console.log(error);
                                  // alert("Invalid device name! You already have a BoilerKey device with this name!")
                                  let sec_try_name_post_data = {
                                    "_eventId": "duoMobileCreateProcessNameDeviceAction",
                                    "_flowExecutionKey": flow_str,
                                    "execution": flow_str,
                                    "phoneName": name + "_" + BoilerKey.makeStr(5),
                                  }
                                  urlParams = new URLSearchParams(Object.entries(sec_try_name_post_data));

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

                                      cbStatus(6, 6);

                                      let duo_url = res.substring(start_ind, res.indexOf('"', start_ind));
                                      cb(duo_url);
                                    })
                                    .catch(error => {
                                      console.log(error);
                                      alert("Invalid device name! You already have a BoilerKey device with this name!")
                                      cb(null);
                                    })
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
                  alert("Error:\nLogin failed. Please check your credentials");
                  cb(null);
                })
            })
            .catch(error => {
              console.log(error);
              cb(null);
            });
        });
    });
  }

  static addAuthentication(username, password, cb) {
    let headers = {
      "User-Agent": "okhttp/3.11.0"
    }
    chrome.cookies.remove({
        url: 'https://www.purdue.edu/apps/account/cas/login',
        name: 'JSESSIONID'
      },
      (cookie) => {
        if (!cookie) {
          console.log('Can\'t remove cookie!');
        }
        fetch("https://www.purdue.edu/apps/account/cas/login?service=https%3A%2F%2Fwl.mypurdue.purdue.edu", {
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
            } else {
              start_ind += sub_to_find.length;
            }
            let lt = res.substring(start_ind, res.indexOf('"', start_ind));

            // find post url
            sub_to_find = '<form id="fm1" action="';
            start_ind = res.indexOf(sub_to_find);
            if (start_ind == -1) {
              // lt secret not found?!
              throw "post form url not found";
            } else {
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
            let uri = login_form_url + "&" + urlParams;

            // send post to login
            fetch(uri, {
                method: "POST",
                headers: headers,
                redirect: "manual"
              })
              // .then(res => res.text())
              .then(res => {
                if (res.type == "opaqueredirect") {
                  console.log("logged in");
                  cb(true);
                } else {
                  console.log("not logged in");
                  cb(false);
                }
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
      });
  }

  static updateLoginStatus(cb) {
    let headers = {
      "User-Agent": "okhttp/3.11.0"
    }

    fetch("https://www.purdue.edu/apps/account/cas/login?service=https%3A%2F%2Fwl.mypurdue.purdue.edu", {
        method: "GET",
        headers: headers,
        redirect: "manual",
      })
      .then(res => {
        if (res.type == "opaqueredirect") {
          console.log("logged in");
          cb(true);
        } else {
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
        chrome.storage.local.set({
          keyHotp: hotpSecret,
          hotpCounter: 1
        }, function() {
          cb(true);
        });
        // localStorage.setItem("keyHotp", hotpSecret);
        // localStorage.setItem("hotpCounter", 1);
      })
      .catch(error => {
        console.log(error);
        cb(false);
      })
  }

  static clearCookies(cb) {
    chrome.cookies.getAll({
        domain: 'www.purdue.edu',
        session: true
      },
      (cookieList) => {
        var count = 0;
        for (var i = 0; i < cookieList.length; i++) {
          console.log("Removing: " + cookieList[i].name);
          chrome.cookies.remove({
            name: cookieList[i].name,
            url: "https://" + cookieList[i].domain
          }, (cookie) => {
            count++;
            if (count == cookieList.length) {
              cb();
            }
          });
        }
      });
  }

  static addUrl(url, cb) {
    if (url.includes("m-1b9bef70.duosecurity.com")) {
      BoilerKey.sendRequest(url, cb);
    }
  }

  static hasData(cb) {
    chrome.storage.local.get(['keyHotp', 'hotpCounter', 'username', 'pin'], function(result) {
      if (("keyHotp" in result) &&
        ("hotpCounter" in result) &&
        ("username" in result) &&
        ("pin" in result)) {
        cb(true);
      } else {
        cb(false);
      }
    });
    // if ((localStorage.getItem("keyHotp") === null) ||
    //     (localStorage.getItem("hotpCounter") === null) ||
    //     (localStorage.getItem("username") === null) ||
    //     (localStorage.getItem("pin") === null)) {
    //   return false;
    // }
    // return true;
  }

  static clearData(cb) {
    chrome.storage.local.clear(cb);
    // localStorage.removeItem("keyHotp");
    // localStorage.removeItem("hotpCounter");
    // localStorage.removeItem("username");
    // localStorage.removeItem("pin");
  }

  static incrementCounter(cb) {
    chrome.storage.local.get(['hotpCounter'], function(result) {
      var count;
      if ('hotpCounter' in result) {
        count = parseInt(result.hotpCounter);
      } else {
        count = 1;
      }
      chrome.storage.local.set({
        hotpCounter: count + 1
      }, function() {
        if (cb) {
          cb(count);
        }
      });
    });
    // let count = localStorage.getItem("hotpCounter");
    //
    // if(count) {
    //   localStorage.setItem("hotpCounter", count + 1);
    //   return count + 1;
    // } else {
    //   return null;
    // }
  }
}
