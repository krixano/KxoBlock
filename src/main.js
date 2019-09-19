
// For casting ability
//require("./libs/cast_sender_v1.js");

window.version = "0.1";
/*ziteLanguages = [
	"CS", "DA", "DE", "EN", "ES", "EO", "FR", "HU", "IT", "KO", "NL", "PL", "PT", "PT-BR", "RU", "TR", "UK", "ZH", "ZH-TW"
];*/

var defaultLang = require("./default-lang.js");

window.waitingForResponse = false;
window.permissionaddress = "12F5SvxoPR128aiudte78h8pY7mobroG6V"; // aka public address of kxoid.
window.base64_publickey = "BOVHKzLh7FHFKCx0DjPj7BCFkuVH0Qcf95uh4Ns69LCRGiUkF+4tbe+IhbilIO8AfRDztBZ4y7ELtfOYPLrx2TA=";
window.certname = "kxoid.bit";

// TODO
//userChannelIndexMerger = "1HmJfQqTsfpdRinx3m8Kf1ZdoTzKcHfy2F";

var MarkdownIt = require("markdown-it");
window.md = new MarkdownIt({
	html: false,
	linkify: true,
	breaks: true,
});

window.jdenticon = require("jdenticon");
window.jdenticon.config = {
	replaceMode: "observe"
};

require("@babel/polyfill");

var ZeroFrame = require("./libs/ZeroFrame.js");
window.Router = require("./libs/router.js");
var searchDbQuery = require("./libs/search.js");

//import Vue from 'vue/dist/vue.common.js';
//var Vue = require("vue/dist/vue.min.js");
//Vue = require("vue/dist/vue.min.js");
//var Vue = require("vue/dist/vue.common.js");

import Vue from "vue/dist/vue.min.js";
import Vuetify from "vuetify";
//var Vuetify = require("vuetify");
Vue.use(Vuetify, {
	theme: {
		primary: '#a5313f',
	    //primary: '#2fa541',
	    //secondary: '#b0bec5',
	    //accent: '#8c9eff',
	}
})

var VueZeroFrameRouter = require("./libs/vue-zeroframe-router.js");

var { sprintf, printf, editTableData, editData, makeCurOptional, uploadBigFile, checkOptional } = require("./libs/util.js");

//var { sanitizeStringForUrl, sanitizeStringForUrl_SQL, html_substr, sanitizeHtmlForDb } = require("./util.js");

Vue.use(VueZeroFrameRouter.VueZeroFrameRouter);
Vue.use(Vuetify);

// Vue Components
var Navbar = require("./vue_components/navbar.vue");
var NavDrawer = require("./vue_components/nav-drawer.vue");

var app = new Vue({
	el: "#app",
	template: `<div><v-app role="application" :dark="theme == 'dark'">
			<v-navigation-drawer role="navigation" app clipped fixed light width="225" hide-overlay v-model="drawer" :dark="theme == 'dark'" style="padding-bottom: 50px;">
				<component ref="nav_drawer" :is="nav_drawer" v-model="drawer" v-on:setcallback="setCallback" :user-info="userInfo" :getting-user-info="gettingUserInfo" :site-info="siteInfo" :lang-translation="langTranslation" :theme="theme"></component>
			</v-navigation-drawer>
			<component ref="navbar" role="banner" :is="navbar" v-on:toggle-drawer="toggleDrawer" v-on:setcallback="setCallback" :theme="theme" :getting-settings="gettingSettings" :user-settings="userSettings" :user-info="userInfo" :site-info="siteInfo" :getting-user-info="gettingUserInfo" :lang-translation="langTranslation"></component>
			<v-content>
				<component ref="view" :is="currentView" v-on:setcallback="setCallback" v-on:get-user-info="getUserInfo()" :theme="theme" :getting-settings="gettingSettings" :user-settings="userSettings" v-on:setusersettings="setUserSettings" :user-info="userInfo" :site-info="siteInfo" :getting-user-info="gettingUserInfo" :lang-translation="langTranslation"></component>
			</v-content>
		</v-app></div>`,
	data: {
		navbar: Navbar,
		nav_drawer: NavDrawer,
		currentView: null,
		siteInfo: {
			privatekey: null,
			cert_user_id: null,
			auth_address: null,
			settings: null,
			address: null,
		},
		userInfo: {
		    keyvalue: {
    		    ko_interface: false,
    		    cs_interface: false
    		},
		    cert_user_id: null,
			auth_address: null,
			privatekey: null,
		},
		gettingUserInfo: true,
		userSettings: {
			introductionFinished: false
		},
		gettingSettings: true,
		langTranslation: defaultLang,
		updateCallback: null,
		navDrawerUpdateCallback: null,
		updateSiteInfoCallback: null,
		drawer: null,
		theme: "",
	},
	methods: {
		setUserSettings: function(settings) {
			console.log("Set User Settings");
			this.$set(this.userSettings, 'introductionFinished', settings.introductionFinished);
		},
		toggleDrawer: function() {
			this.drawer = !this.drawer;
		},
		getUserInfo: function(f = null) {
			console.log(this.siteInfo);
            if (this.siteInfo == null || this.siteInfo.cert_user_id == null) {
                this.userInfo = null;
				app.callCallback("update", this.userInfo);
				app.callCallback("navDrawerUpdate", this.userInfo);
                return;
            }

            var that = this;

            if (f !== null && typeof f === "function") f();

            page.cmd("dbQuery", ["SELECT key, value FROM keyvalue LEFT JOIN json USING (json_id) WHERE cert_user_id=\"" + this.siteInfo.cert_user_id + "\" AND directory=\"data/users/" + this.siteInfo.auth_address + "\""], (rows) => {
                var keyvalue = {};

                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    
                    keyvalue[row.key] = row.value;
                }
				
				if (that.userInfo != null) {
					that.$set(that.userInfo, 'privatekey', that.siteInfo.privatekey);
					that.$set(that.userInfo, 'cert_user_id', that.siteInfo.cert_user_id);
					that.$set(that.userInfo, 'auth_address', that.siteInfo.auth_address);
					that.$set(that.userInfo, 'keyvalue', keyvalue);
				} else {
					that.userInfo = {
						privatekey: that.siteInfo.privatekey,
						cert_user_id: that.siteInfo.cert_user_id,
						auth_address: that.siteInfo.auth_address,
						keyvalue: keyvalue
					};
				}

				console.log(keyvalue);

				if (that.userInfo.keyvalue.ko_interface) {
					that.cmdp("fileGet", { "inner_path": "languages/ko.json", "required": false }).then((data) => {
						data = JSON.parse(data);
						console.log("langdata: ", data);
						if (data) {
							app.langTranslation = data;
							app.$emit("setLanguage", data);
						}
					});
				} else if (that.userInfo.keyvalue.cs_interface) {
					that.cmdp("fileGet", { "inner_path": "languages/cs.json", "required": false }).then((data) => {
						data = JSON.parse(data);
						console.log("langdata: ", data);
						if (data) {
							app.langTranslation = data;
							app.$emit("setLanguage", data);
						}
					});
				}

				// TODO: Follow Feed Stuff

				// TODO: Check optional of all merged zites?
				/*page.cmd("mergerSiteList", [], function(sites) {
					if(Object.keys(sites).indexOf("1GDLfuB3PTpbM8v4zFCwkBuVv6KHWamucQ") != -1) {
						page.checkOptional("1GDLfuB3PTpbM8v4zFCwkBuVv6KHWamucQ", true, null);
					}
				});*/

				console.log("Keyvalue: ", that.userInfo.keyvalue);

				that.gettingUserInfo = false;
				//that.$emit("setUserInfo", that.userInfo); // TODO: Not sure if I need this if I can pass in a function callback instead
				//that.$emit("update", that.userInfo);
				app.$refs.view.$forceUpdate();
				app.$refs.nav_drawer.$forceUpdate();
				app.callCallback("update", that.userInfo);
				app.callCallback("navDrawerUpdate", that.userInfo);
				if (f !== null && typeof f === "function") f();
			});
			
			/*page.cmdp("dbQuery", ["SELECT * FROM channels LEFT JOIN json USING (json_id) WHERE cert_user_id=\"" + this.siteInfo.cert_user_id + "\" AND directory=\"data/users/" + this.siteInfo.auth_address + "\""])
				.then((results) => {
					console.log(results);
					app.userChannels = results;
				});*/
		},
		setCallback: function(name, callback) {
			console.log("Setting '" + name + "Callback' callback to ", callback);
			this[name + "Callback"] = callback;
		},
		callCallback: function(name, ...params) {
			if (!this[name + "Callback"]) return;
			this[name + "Callback"](...params);
			this.$emit(name);
		},
		setSiteInfo: function(siteInfo) {
			//this.siteInfo = siteInfo;
			this.$set(this.siteInfo, 'privatekey', siteInfo.privatekey || false);
			this.$set(this.siteInfo, 'settings', siteInfo.settings);
			this.$set(this.siteInfo, 'cert_user_id', siteInfo.cert_user_id);
			this.$set(this.siteInfo, 'auth_address', siteInfo.auth_address);
			this.$set(this.siteInfo, 'address', siteInfo.address);

			this.getUserInfo();

			console.log(this.siteInfo.cert_user_id);
		}
	}
});

class ZeroApp extends ZeroFrame {
	onOpenWebsocket() {
		var self = this;

		this.cmdp("userGetSettings")
			.then((settings) => {
				app.gettingSettings = false;
				//app.$set(app.userSettings, "allowCasting", settings.allowCasting || false);
				//app.$set(app.userSettings, "castingServer", settings.castingServer || "https://core.0net.io/");
				app.$set(app.userSettings, 'introductionFinished', settings.introductionFinished || false);
				if (settings.allowCasting) {
					var script = document.createElement("script");
					script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
					document.head.appendChild(script);
					setTimeout(app.initializeCasting, 1000);
				}
			});

		this.cmdp("serverInfo", {})
			.then((serverInfo) => {
				console.log("Server Info: ", serverInfo);
				self.serverInfo = serverInfo;
				app.serverInfo = serverInfo;

				app.theme = serverInfo.user_settings.theme || "light";
				return this.cmdp("fileGet", { "inner_path": "languages/" + self.serverInfo.language + ".json", "required": false })
			}).then((data) => {
				data = JSON.parse(data);
				console.log("langdata: ", data);
				if (data) {
					app.langTranslation = data;
					app.$emit("setLanguage", data);
				}
				return this.cmdp("siteInfo", {});
			}).then((siteInfo) => {
				console.log("Site Info: ", siteInfo);
				self.siteInfo = siteInfo;
				app.setSiteInfo(siteInfo);
				
				// TODO: set Merger permission
				/*if(siteInfo.settings.permissions.indexOf("Merger:KxoVid") == -1) {
					page.cmd("wrapperPermissionAdd", ["Merger:KxoVid"], function() {
						page.addUserChannelIndexMerger();
					});
				} else {
					page.addUserChannelIndexMerger();
				}*/

				//app.callCallback("updateSiteInfo", siteInfo);
				if(siteInfo.address!="161W1XFqy3dFyeaGuw34eH4GKvCnbbCLPR"&&!siteInfo.settings.own){self.cmdp("wrapperNotification",["warning","Note: This was cloned from another zite. You<br>\ncan find the original zite at this address:<br>\n 14c5LUN73J7KKMznp9LvZWkxpZFWgE1sDz."]);}
				printf(makeCurOptional(false, false, false, false, false, false, false, true));
				//if (siteInfo.cert_user_id) self.checkOptional(true);
			});
	}

	// TODO
	addUserChannelIndexMerger() {
		var self = this;
		this.cmd("mergerSiteList", [], function(sites) {
			if(Object.keys(sites).indexOf(userChannelIndexMerger) === -1) {
				self.cmd("mergerSiteAdd", [userChannelIndexMerger], function() {
					app.getUserInfo();
					app.callCallback("update");
					app.callCallback("navDrawerUpdate");
				});
			} else {
				app.getUserInfo();
				app.callCallback("update");
				app.callCallback("navDrawerUpdate");
			}
		});
	}

	onRequest(cmd, message) {
		window.Router.listenForBack(cmd, message);
		if (cmd === "setSiteInfo") {
			if (message.params.address == "161W1XFqy3dFyeaGuw34eH4GKvCnbbCLPR") {
				this.siteInfo = message.params;
				console.log("onRequest SiteInfo: ", message.params);
				app.setSiteInfo(message.params);
				//app.getUserInfo();
			}
		}

		if (message.params.event && message.params.event[0] === "file_done") {
			//app.getUserInfo();
			app.callCallback("update");
			app.callCallback("navDrawerUpdate");
		}
	}

	selectUser() {
		return this.cmdp("certSelect", { accepted_domains: ["kxoid.bit", "zeroid.bit"] });
    }

    signout() {
    	return this.cmdp("certSelect", { accepted_domains: [""] });
    }

    unimplemented() {
        return this.cmdp("wrapperNotification", ["info", "Unimplemented!"]);
	}

	checkOptional(doSignPublish, f) {
		checkOptional(this, null, null, page.siteInfo.auth_address, doSignPublish, f, "blocklist_.+\\.(json|JSON)(.piecemap.msgpack)?");
    }

	uploadBigFile(file, f = null) {
		uploadBigFile(this, null, null, page.siteInfo.auth_address, file, f, "blocklist_.+\\.(json|JSON)(.piecemap.msgpack)?");
	}

	editTableData(table, manageDataFunc, beforePublishCB = null) {
		if (!this.siteInfo.cert_user_id) {
			return this.cmdp("wrapperNotification", ["error", "You must be logged in to make a post."]);
		} /*else if (!window.Router.currentParams["topicaddress"] && !mergerAddress) {
			return this.cmdp("wrapperNotification", ["error", "You must choose a topic to post to."]);
		}*/

		editTableData(this, null, null, page.siteInfo.auth_address, table, manageDataFunc, ({ date, auth }) => {
			app.getUserInfo();
			beforePublishCB(date, auth);
		});
	}

	editData(manageDataFunc, beforePublishCB = null, file = null) {
		if (!this.siteInfo.cert_user_id) {
			return this.cmdp("wrapperNotification", ["error", "You must be logged in to make a post."]);
		} /*else if (!window.Router.currentParams["topicaddress"] && !mergerAddress) {
			return this.cmdp("wrapperNotification", ["error", "You must choose a topic to post to."]);
		}*/
	
		editData(this, null, null, page.siteInfo.auth_address, manageDataFunc, ({ date, auth }) => {
			app.getUserInfo();
			beforePublishCB(date, auth);
		}, file);
	}
}

window.page = new ZeroApp();

var Home = require("./router_pages/home.vue");
var Blocklist = require("./router_pages/blocklist.vue");
var CreateBlocklist = require("./router_pages/create_blocklist.vue");

var Search = require("./router_pages/search.vue");
var SupportMe = require("./router_pages/support_me.vue");

VueZeroFrameRouter.VueZeroFrameRouter_Init(window.Router, app, [
	{ route: "search/:searchquery", component: Search },
	{ route: "search", component: Search },
	{ route: "support-me", component: SupportMe },
	{ route: "blocklist/:auth/:id", component: Blocklist },
	{ route: "create-blocklist", component: CreateBlocklist },
	{ route: "", component: Home }
]);
