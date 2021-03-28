
var submit;
var node;

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

function auth() {
  node.setAttribute("disabled", "disabled");
  BoilerKey.getLoginDetails((det) => {
    if (("username" in det) && ("password" in det)) {
      document.getElementById("username").value = det.username;
      document.getElementById("password").value = det.password;
      submit.click();
    }
  })
}

if (location.href.indexOf("https://www.purdue.edu/apps/account/cas/login") == 0) {
  submit = document.querySelectorAll("input[name='submit'][accesskey='s'][value='Login'][tabindex='3'][type='submit']")[0];
  // prevent chrome from trying to save password
  document.getElementsByClassName("password")[0].insertAdjacentHTML("afterbegin", '<input type="password" style="display:none"/>');

  submit.addEventListener('click', (e) => {
    node.setAttribute("disabled", "disabled");
  })

  node = document.createElement("button");
  node.className = "submit-button";
  node.innerHTML = "Auto Login";
  BoilerKey.hasData((status) => {
    if (status) {
      isAuto((automatic) => {
        submit.parentNode.appendChild(node);
        if (automatic) {
          auth();
        }
        else {
          node.onclick = auth;
        }
      });
    }
    else {
      node.setAttribute("disabled", "disabled");
      submit.parentNode.appendChild(node);
    }
  });
}
