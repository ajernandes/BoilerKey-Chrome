// var optionsDiv;
var clear;
var autoLoginToggle;
// var backBtn;
var bodyDiv;
var loadingDiv;
var setupDiv;
var setupLoginDiv;
var checkStatusBtn;
var setupInputDiv;
var username;
var pin;
var deviceName;
var submit;
var loginDiv;
var progressDiv;
var progressBar;
// var optionsBtn;

function init() {
  clear.addEventListener("click", (e) => {
    let confirmed = confirm("Are you sure you want to go through the entire setup process again?")

    if (confirmed) {
      BoilerKey.clearData();
      BoilerKey.updateLoginStatus((loggedIn) => {
        showDropDown(loggedIn);
      })
    }
  })

  autoLoginToggle.addEventListener("change", (e) => {
    if (autoLoginToggle.checked) {
      chrome.storage.local.set({autoLogin: 1}, function() {
      });
    }
    else {
      chrome.storage.local.set({autoLogin: 0}, function() {
      });
    }
  })

  // optionsBtn.addEventListener("click", (e) => {
  //   hide(bodyDiv);
  //   show(optionsDiv);
  // })
  // backBtn.addEventListener("click", (e) => {
  //   show(bodyDiv);
  //   hide(optionsDiv);
  // })


  checkStatusBtn.addEventListener("click", (e) => {
    BoilerKey.updateLoginStatus((loggedIn) => {
      showDropDown(loggedIn);
    })
  })

  submit.addEventListener("click", (e) => {
    e.preventDefault();
    if (!submit.hasAttribute('disabled')) {
      let confirmed = confirm("Confirm: A new BoilerKey device will be created and you will get an email");
      if (confirmed) {
        chrome.storage.local.set({username: username.value, pin: pin.value}, function() {

          // localStorage.setItem("username", username.value);
          // localStorage.setItem("pin", pin.value);

          console.log("getting url");
          disableForm();
          show(progressDiv);

          let url = BoilerKey.genBoilerKey(deviceName.value, (url) => {
            if (url) {
              BoilerKey.addUrl(url, (used) => {
                BoilerKey.updateLoginStatus((loggedIn) => {
                  showDropDown(loggedIn);
                });
                if (!used) {
                  alert("There was an error. Please try again later.")
                  enableForm();
                }
              });
            } else {
              BoilerKey.updateLoginStatus((loggedIn) => {
                showDropDown(loggedIn);
              });
              enableForm();
            }
          }, (curr, tot) => {
            moveProgressBar(progressBar, curr, tot);
          });
        });
      }
    }
    e.preventDefault();
  })

  function checkForm(e) {
    if ((username.value.length != 0) && ((pin.value.length == 4) || (pin.value.length == 6)) && (!isNaN(pin.value))) {
      regex = /^[A-Za-z0-9_]+$/;
      let str = deviceName.value;
      if ((str.length < 32) && (str.length > 0) && (regex.test(str))) {
        BoilerKey.updateLoginStatus((loggedIn) => {
          if (loggedIn) {
            submit.removeAttribute("disabled");
          } else {
            submit.setAttribute("disabled", "disabled");
          }
        });
      } else {
        alert("Device name can only include numbers, letters, and underscores");
      }
    } else {
      submit.setAttribute("disabled", "disabled");
    }
  }

  username.addEventListener("input", checkForm);
  pin.addEventListener("input", checkForm);
  deviceName.addEventListener("input", checkForm);
}

function disableForm() {
  username.setAttribute("disabled", "disabled");
  pin.setAttribute("disabled", "disabled");
  deviceName.setAttribute("disabled", "disabled");
  hide(submit);
}

function enableForm() {
  username.removeAttribute("disabled");
  pin.removeAttribute("disabled");
  deviceName.removeAttribute("disabled");
  show(submit);
}

// ret true/false for whether autologin is enabled
function isAuto(cb) {
  chrome.storage.local.get(['autoLogin'], function(result) {
    if (!('autoLogin' in result)) {
      chrome.storage.local.set({autoLogin: 0}, function() {
        cb(false);
      });
    }
    else if (result.autoLogin == 0) {
      cb(false);
    }
    else {
      cb(true);
    }
  });
}

function moveProgressBar(elem, num, tot) {
  let targetWid = (100 * num / tot).toFixed(2);
  var currWid = Number(elem.style.width.replace(/[^\d\.\-]/g, ''));
  if (targetWid < currWid) {
    elem.style.width = targetWid + "%";
  } else {
    var id = setInterval(frame, 10);

    function frame() {
      if (currWid >= targetWid) {
        clearInterval(id);
      } else {
        currWid++;
        elem.style.width = currWid + '%';
      }
    }
  }
}

function hide(el) {
  el.style.display = "none";
}
function show(el) {
  el.style.display = "block";
}

function showDropDown(loggedIn) {
  show(loadingDiv);
  // hide(optionsDiv);
  hide(bodyDiv);
  BoilerKey.hasData((status) => {
    if (!status) {
      console.log("not set up");
      hide(loadingDiv);
      show(bodyDiv);
      hide(loginDiv);
      hide(progressDiv);

      show(setupDiv);

      if (loggedIn) {
        hide(setupLoginDiv);
        show(setupInputDiv);
        enableForm();
      } else {
        show(setupLoginDiv);
        hide(setupInputDiv);
        disableForm();
      }
    }
    else {
      console.log("set up");
      isAuto((stat) => {
        autoLoginToggle.checked = stat;
      });

      hide(loadingDiv);
      show(bodyDiv);
      hide(setupDiv);
      hide(progressDiv);

      show(loginDiv);

      // TODO: Add status indicator here
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // optionsDiv = document.getElementById("options");
  clear = document.getElementById("clear-data");
  autoLoginToggle = document.getElementById("auto-login-toggle");
  // backBtn = document.getElementById("options-close");
  bodyDiv = document.getElementById("body");
  loadingDiv = document.getElementById("loading");
  setupDiv = document.getElementById("setup");
  setupLoginDiv = document.getElementById("setup-login-div");
  checkStatusBtn = document.getElementById("check-login-status");
  setupInputDiv = document.getElementById("setup-input-div");
  username = document.getElementById("username");
  pin = document.getElementById("pin");
  deviceName = document.getElementById("device-name");
  submit = document.getElementById("submit");
  loginDiv = document.getElementById("login");
  progressDiv = document.getElementById("progress-div");
  progressBar = document.getElementById("progress-bar");
  // optionsBtn = document.getElementById("options-open");

  init();
  // TODO: make option to log in when loading purdue login site
  BoilerKey.updateLoginStatus((loggedIn) => {
    showDropDown(loggedIn);
  })
}, false);
