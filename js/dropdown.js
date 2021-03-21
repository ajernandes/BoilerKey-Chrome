
function moveProgressBar(elem, num, tot) {
  let targetWid = (100*num/tot).toFixed(2);
  var currWid = Number(elem.style.width.replace(/[^\d\.\-]/g, ''));
  if (targetWid < currWid) {
    elem.style.width = targetWid + "%";
  }
  else {
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

function validate(usernameEl, pinEl, nameEl) {
  if ((usernameEl.value.length != 0) && ((pinEl.value.length == 4) || (pinEl.value.length == 6)) && (!isNaN(pinEl.value))) {
    regex = /^[A-Za-z0-9_]+$/;
    let str = nameEl.value;
    if ((nameEl.value.length < 32) && (nameEl.value.length > 0) && (regex.test(str))) {
      return true;
    }
    else {
      alert("Name can only include numbers, letters, and underscores");
    }
  }
  return false;
}

function onInit() {
  let optionsDiv = document.getElementById("options");
  let bodyDiv = document.getElementById("body");
  let inputDiv = document.getElementById("input-div");
  let loginSetupDiv = document.getElementById("login-setup-div");
  let progressDiv = document.getElementById("progress-div");
  let progressBar = document.getElementById("generate-progress-bar");
  let submit = document.getElementById("submit");
  let checkStatusBtn = document.getElementById("check-status");
  let login = document.getElementById("login-button");
  let clear = document.getElementById("clear-data");
  let username = document.getElementById("username");
  let pin = document.getElementById("pin");
  let name = document.getElementById("name");

  if (BoilerKey.hasData()) {
    username.value = localStorage.getItem("username");
    pin.value = localStorage.getItem("pin");
  }

  let loadingDiv = document.getElementById("loading");
  let setupDiv = document.getElementById("setup");
  let loginDiv = document.getElementById("login");

  function showDropDown(loggedIn) {
    loadingDiv.style.display = "block";
    if (!BoilerKey.hasData()) {
      loadingDiv.style.display = "none";
      loginDiv.style.display = "none";
      setupDiv.style.display = "block";
      progressDiv.style.display = "none";
      BoilerKey.clearData();
      console.log("doesnt hotp");
      if (loggedIn) {
        inputDiv.style.display = "block";
        loginSetupDiv.style.display = "none";
      }
      else {
        inputDiv.style.display = "none";
        loginSetupDiv.style.display = "block";
      }
    } else {
      loadingDiv.style.display = "none";
      setupDiv.style.display = "none";
      progressDiv.style.display = "none";
      loginDiv.style.display = "block";
      console.log("has have");
      login.textContent = "Login";
      if (loggedIn) {
        // TODO: Add more info here and prevent logging in again
        login.textContent = "Already logged in";
        login.setAttribute("disabled", "disabled");
      }
      else {
        login.textContent = "Login";
        login.removeAttribute("disabled");
      }
    }
  }

  // TODO: Add form handling listeners

  submit.addEventListener("click", (e) => {
    e.preventDefault();
    if (!submit.hasAttribute('disabled')) {
      let confirmed = confirm("Confirm: A new BoilerKey device will be created and you will get an email");
      if (confirmed) {
        localStorage.setItem("username", username.value);
        localStorage.setItem("pin", pin.value);

        // TODO: Add loading indicator
        // TODO: username/pin error support
        // TODO: device name error handling

        console.log("getting url");
        console.log("name.value");
        progressDiv.style.display = "block";
        // progressBar.style.width = "0%";
        submit.style.display = "none";
        let url = BoilerKey.genBoilerKey(name.value, (url) => {
          if (url) {
            BoilerKey.addUrl(url, (used) => {
              BoilerKey.updateLoginStatus((loggedIn) => {
                showDropDown(loggedIn);
              });
              if (!used) {
                alert("There was an error. Please try again later.")
                submit.style.display = "block";
              }
            });
          }
          else {
            BoilerKey.updateLoginStatus((loggedIn) => {
              showDropDown(loggedIn);
            });
            submit.style.display = "block";
          }
        }, (curr, tot) => {
          moveProgressBar(progressBar, curr, tot);
        });
      }
    }
    e.preventDefault();
  })

  login.addEventListener("click", (e) => {
    if (!login.hasAttribute('disabled')) {
      BoilerKey.login((status) => {
        if (!status) {
          alert("Error logging in");
        }
        else {
          alert("Logged in");
        }
      });
    }
  })

  clear.addEventListener("click", (e) => {
    let confirmed = confirm("Are you sure you want to go through the entire setup process again?")

    if (confirmed) {
      BoilerKey.clearData();
      loginDiv.style.display = "none";
      setupDiv.style.display = "block";
      BoilerKey.updateLoginStatus((loggedIn) => {
        showDropDown(loggedIn);
      })
    }
  })

  document.getElementById("options-open").addEventListener("click", (e) => {
      bodyDiv.style.display = "none";
      optionsDiv.style.display = "block";
  })

  document.getElementById("options-close").addEventListener("click", (e) => {
      bodyDiv.style.display = "block";
      optionsDiv.style.display = "none";
  })

  checkStatusBtn.addEventListener("click", (e) => {
    BoilerKey.updateLoginStatus((loggedIn) => {
      showDropDown(loggedIn);
    })
  })

  username.addEventListener("input", (e) => {
    if (validate(username, pin, name)) {
      BoilerKey.updateLoginStatus((loggedIn) => {
        if (loggedIn) {
          submit.removeAttribute("disabled");
        }
        else {
          submit.setAttribute("disabled", "disabled");
        }
      })
    }
    else {
      submit.setAttribute("disabled", "disabled");
    }
  })

  pin.addEventListener("input", (e) => {
    if (validate(username, pin, name)) {
      BoilerKey.updateLoginStatus((loggedIn) => {
        if (loggedIn) {
          submit.removeAttribute("disabled");
        }
        else {
          submit.setAttribute("disabled", "disabled");
        }
      })
    }
    else {
      submit.setAttribute("disabled", "disabled");
    }
  })

  name.addEventListener("input", (e) => {
    if (validate(username, pin, name)) {
      BoilerKey.updateLoginStatus((loggedIn) => {
        if (loggedIn) {
          submit.removeAttribute("disabled");
        }
        else {
          submit.setAttribute("disabled", "disabled");
        }
      })
    }
    else {
      submit.setAttribute("disabled", "disabled");
    }
  })

  // TODO: make option to log in when loading purdue login site
  BoilerKey.updateLoginStatus((loggedIn) => {
    showDropDown(loggedIn);
  })
}

document.addEventListener('DOMContentLoaded', onInit, false);
