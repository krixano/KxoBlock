<template>
	<v-container fluid v-if="!gettingSettings" class="pa-0">
		<v-container role="main" style="max-width: 700px;">
            <v-list two-line>
                <v-list-tile v-for="blocklist in results" :key="blocklist.directory + '_' + blocklist.blocklist_id" @click="goto('blocklist/' + blocklist.directory.replace('users/', '') + '/' + blocklist.blocklist_id)">
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
		name: "search",
		data: () => {
			return {
                results: [],
                searchQuery: "",
			};
		},
		beforeMount: function() {
			var self = this;
			/*this.$parent.$on("setLanguage", function(langTranslation) {
				self.ZiteName = langTranslation["KxoId"];
			});
			this.ZiteName = this.langTranslation["KxoId"];*/
            
            if (Router.currentParams["searchquery"]) {
                this.searchQuery = Router.currentParams["searchquery"].replace(/%20/g, " ");
            }
            self.getSearchResults();

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
            getSearchResults: function() {
                var self = this;

                var searchSelects = [
                    { col: "title", score: 5 },
                    { col: "description", score: 4 },
                    { col: "tags", score: 2 },
                    { col: "cert_user_id", score: 2, usingJson: true }
                ];

                var orderBy = "ASC";
                if (!this.searchQuery) {
                    orderBy = "DESC";
                }

                var query = searchDbQuery(this, this.searchQuery || "", {
                    orderByScore: true,
                    id_col: "blocklist_id",
                    select: "*",
                    searchSelects: searchSelects,
                    table: "blocklists",
                    join: `INNER JOIN json USING (json_id)`,
                    afterOrderBy: "date_added " + orderBy
                });

                console.log(query);

                window.page.cmdp("dbQuery", [query])
                    .then((results) => {
                        self.results = results;
                    });
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
		}
	}
</script>