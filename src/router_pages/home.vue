<template>
	<v-container fluid v-if="!gettingSettings" class="pa-0">
		<v-container role="main" aria-labelledby="welcome" style="max-width: 700px;" v-if="!userSettings.introductionFinished">
			<!-- Introduction -->
			<div id="welcome" class="headline" style="text-align: center; margin-bottom: 8px;">Welcome to {{ langTranslation["zite-title"] }}!</div>
			<div class="subheading" style="margin-bottom: 4px;">Created by Krixano</div>
			<v-divider style="margin-top: 8px; margin-bottom: 12px;"></v-divider>

			<div class="title" style="margin-bottom: 4px;">Blocklists</div>
			<div class="subheading">This is a zite that allows you to easily create, explore, and share blocklists.</div>
			<v-divider style="margin-top: 8px; margin-bottom: 12px;"></v-divider>

			<div class="title" style="margin-bottom: 4px;">Collaboration</div>
			<div class="subheading">Another component of the zite is that you can easily pick and choose the zites or users from a blocklist to add to one of your own blocklists. You can also follow blocklists to get a NewsFeed Notification on when that blocklist is updated.</div>
			<v-divider style="margin-top: 8px; margin-bottom: 12px;"></v-divider>
			
			<v-btn color="primary" @click="login()">Sign In</v-btn>
			<a href="./?/" @click.prevent="continueToHome()">Continue to homepage</a>
		</v-container>
		<v-container role="main" aria-label="Homepage" v-else grid-list-xl class="hidden-sm-and-down" style="max-width: 700px;">
			<v-divider></v-divider>
			<v-subheader>Recently Created Blocklists</v-subheader>
			
			<v-list two-line>
                <v-list-tile v-for="blocklist in recent" :key="blocklist.directory + '_' + blocklist.blocklist_id" @click="goto('blocklist/' + blocklist.directory.replace('users/', '') + '/' + blocklist.blocklist_id)">
                    <v-list-tile-content>
                        <v-list-tile-title>{{ blocklist.title }}</v-list-tile-title>
                        <v-list-tile-sub-title>{{ blocklist.cert_user_id }} - {{ blocklist.description }}</v-list-tile-sub-title>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
		</v-container>
		<v-container role="main" aria-label="Homepage for mobile" v-if="userSettings.introductionFinished" class="hidden-md-and-up pa-0">
			<v-list two-line>
				<v-subheader>Recently Created Blocklists</v-subheader>
                <v-list-tile v-for="blocklist in recent" :key="blocklist.directory + '_' + blocklist.blocklist_id" @click="goto('blocklist/' + blocklist.directory.replace('users/', '') + '/' + blocklist.blocklist_id)">
                    <v-list-tile-content>
                        <v-list-tile-title>{{ blocklist.title }}</v-list-tile-title>
                        <v-list-tile-sub-title>{{ blocklist.cert_user_id }} - {{ blocklist.description }}</v-list-tile-sub-title>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
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
				recent: []
			};
		},
		beforeMount: function() {
			var self = this;
			/*this.$parent.$on("setLanguage", function(langTranslation) {
				self.ZiteName = langTranslation["KxoId"];
			});
			this.ZiteName = this.langTranslation["KxoId"];*/
			
			this.getRecent();
			this.$emit("setcallback", "update", function(userInfo) {
				self.getRecent();
			});
		},
		computed: {
			isLoggedIn: function() {
				if (this.userInfo == null) return false;
				return this.userInfo.cert_user_id != null;
			}
		},
		methods: {
			getRecent: function() {
				var self = this;
				var query = `SELECT * FROM blocklists LEFT JOIN json USING (json_id) ORDER BY date_added ASC LIMIT 15`;
				window.page.cmdp("dbQuery", [query])
					.then((results) => {
						self.recent = results;
					})
			},
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
		}
	}
</script>