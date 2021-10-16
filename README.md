# BoilerKey - Chrome

A chrome extension to log in for you using your Purdue account without having to confirm with DuoMobile, forked from <a href="https://github.com/jeremywgleeson/BoilerKey-Chrome">https://github.com/jeremywgleeson/BoilerKey-Chrome</a> 


## Install unpacked extensions
Look through the guide <a href="https://developer.chrome.com/docs/extensions/mv3/getstarted/">here</a>

<img src="https://imgur.com/Ztea55n.png" width="800">

A button is added below the normal 'Login' button on the Purdue sign in page. This will automatically autofill a one-time-password generated from your BoilerKey and sign in for you!

## Setup
**This setup will create a new BoilerKey Device for you!**

<img src="https://imgur.com/k9lv3Ik.png" width="500">

Simply enter your Purdue username and password.
This password may be any acceptable kind that Purdue's own sign in page would accept ("0000,push", "0000,push0", "0000,000000").
If you choose to use a "push" type password, you need to accept the DuoMobile request for the setup to complete.

<img src="https://imgur.com/rnnlwDb.png" width="500">

The setup will take a few seconds to complete. If you click away and close the setup window during this time, it will cancel.

That's all! You're done setting up.

## Usage
<img src="https://imgur.com/xImZmiF.png" width="500">

There is an option for 'Auto Login' which will automatically log in for you once the Purdue login page shows up.
You may also clear data here to remove your data from the extension.

**This will NOT remove the BoilerKey device!**

If you delete the BoilerKey device being used by the extension (`BoilerKey_Chrome` or `BoilerKey_Chrome_XXXX`), it **will stop working!** If you would like to continue using the extension, you can clear data and complete setup again.

## Privacy
This extension collects your login details for Purdue websites. When you enter your credentials into the setup window, the extension will use these credentials to log into your Purdue account and create a BoilerKey. The username and pin are stored along with the BoilerKey **only on your local computer**. This means that I do not have access to them, nor are they sent anywhere else. These credentials are used to generate username and password pairs which will bypass 2fa (DuoMobile) when using the auto-login functionality. They are not used in any other way.
