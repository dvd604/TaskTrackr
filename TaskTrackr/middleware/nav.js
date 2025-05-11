const log = require('../util/logUtil');

const navLinks = [];
const loginLinks = [
    {link: "/auth/login",text: "Login"},
    {link: "/auth/register", text: "Register"},
];
let hasUpdated = true;

/**
 * NavBar middleware that adds the NavLinks to the request locals.
 * @param req
 * @param res
 * @param next
 */
function buildNavbar(req, res, next) {
    if(hasUpdated) {
        navLinks.sort((a, b) => {
            return a.order - b.order;
        });
        hasUpdated = false;
    }

    res.locals.navLinks = navLinks;
    res.locals.loginLinks = loginLinks;
    next();
}

/** Registers a new NavBar NavLink.
 *  Orders should start at 0000 be initially separated by 1000 each time.
 *  This ensures we can add links easily in-between existing links.
 * @param {string} link - The link to navigate to
 * @param {string} text - The text on the nav bar
 * @param {int} order - The order the link will appear, lower is earlier
 * **/
function addNavLink(link, text, order = 9999){
    log('Nav', `Registered Nav Link for ${text} : ${link}`)
    navLinks.push({text: text, link: link, order: order});
    hasUpdated = true;
}

module.exports = {buildNavbar: buildNavbar, addNavLink: addNavLink};