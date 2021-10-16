/* logs in */
if (window.location.href == "https://purdue.brightspace.com/d2l/login") {
    window.location.href = "https://purdue.brightspace.com/d2l/lp/auth/saml/initiate-login?entityId=https://idp.purdue.edu/idp/shibboleth";
}

/* switches the icon */
if (document.querySelector('link[rel*="icon"]').href) {
    document.querySelector('link[rel*="icon"]').href = "https://s.brightspace.com/lib/favicon/2.0.0/favicon.ico";
}