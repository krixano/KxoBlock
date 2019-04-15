<template>
	<v-container fluid v-if="!gettingSettings" class="pa-0">
		<v-container role="main" aria-labelledby="welcome" style="max-width: 700px;" v-if="!userSettings.introductionFinished">
			<!-- Introduction -->

			<div id="welcome" class="headline" style="text-align: center; margin-bottom: 8px;">Welcome to KxoDo!</div>
			<div class="subheading" style="margin-bottom: 4px;"></div>
			<v-divider style="margin-top: 8px; margin-bottom: 12px;"></v-divider>

			<div class="title" style="margin-bottom: 4px;">Channels</div>
			<div class="subheading"></div>
			<v-divider style="margin-top: 8px; margin-bottom: 12px;"></v-divider>
			
			<v-btn color="primary" @click="login()">Sign In with ZeroId or KxoId</v-btn>
			<v-btn @click="register()">Register a KxoId</v-btn>
			<a href="./?/" @click.prevent="continueToHome()">Continue to homepage</a>
		</v-container>
		<v-container role="main" aria-label="Homepage" v-else grid-list-xl class="hidden-sm-and-down">
			<!-- Desktop -->
		</v-container>
		<v-container role="main" aria-label="Homepage for mobile" v-if="userSettings.introductionFinished" class="hidden-md-and-up pa-0">
			<!-- Mobile -->
		</v-container>
	</v-container>
</template>

<script>
	var Router = require("../libs/router.js");
	var searchDbQuery = require("../libs/search.js");
	var moment = require("moment");

	module.exports = {
		props: ["gettingSettings", "userSettings", "gettingUserInfo", "userInfo", "langTranslation", "theme"],
		name: "home",
		data: () => {
			return {
			};
		},
		beforeMount: function() {
			var self = this;
			/*this.$parent.$on("setLanguage", function(langTranslation) {
				self.ZiteName = langTranslation["KxoId"];
			});
			this.ZiteName = this.langTranslation["KxoId"];*/
			
			this.$emit("setcallback", "update", function(userInfo) {
			});
		},
		computed: {
			isLoggedIn: function() {
				if (this.userInfo == null) return false;
				return this.userInfo.cert_user_id != null;
			}
		},
		methods: {
			getCors: function(address, callback = null) {
                var self = this;
                this.pageNum = 0;
                if(page.siteInfo.settings.permissions.indexOf("Cors:" + address) < 0) {
                    page.cmd("corsPermission", address, function() {
                            if (callback != null) callback();
                        });
                } else {
                    if (callback != null) callback();
                }
			},
			goto: function(to) {
				Router.navigate(to);
			},
			login: function() {
				page.selectUser();
				this.$emit("setusersettings", { introductionFinished: true });
				page.cmdp("userSetSettings", [{ introductionFinished: true }]);
				Router.navigate('categories');
				return false;
			},
			gotoLink: function(to) {
				console.log(to);
				window.location = to;
			},
			continueToHome: function() {
				this.$emit("setusersettings", { introductionFinished: true });
				page.cmdp("userSetSettings", [{ introductionFinished: true }]);
			},
			register: function() {
				page.cmdp("wrapperOpenWindow", ["/1GTVetvjTEriCMzKzWSP9FahYoMPy6BG1P/?/create-id"]);
			}
		}
	}
</script>