<template>
	<v-container fluid>
        <v-container style="max-width: 700px" v-if="blocklist">
            <div class="title" style="text-align: center;">{{ blocklist.title }}</div>
            <v-subheader style="margin-bottom: 8px; height: 30px; text-align: center; display: block;">Editing</v-subheader>
            <div style="text-align: center; margin-bottom: 18px;" v-if="blocklist.description.trim()">
                {{ blocklist.description }}
            </div>

            <div v-if="blocklist.type == 'users' || blocklist.type == 'both'">
                <v-divider></v-divider>
                <v-subheader>Add Users</v-subheader>

                <v-btn color="primary" small>Add User</v-btn>
            </div>
            <div v-if="blocklist.type == 'zites' || blocklist.type == 'both'">
                <v-divider :style="{ 'margin-top: 8px;': blocklist.type == 'both' }"></v-divider>
                <v-subheader>Add Zites</v-subheader>

                <v-btn color="primary" small>Add Zite</v-btn>
            </div>
        </v-container>
	</v-container>
</template>

<script>
	var Router = require("../libs/router.js");
	var searchDbQuery = require("../libs/search.js");

	module.exports = {
		props: ["userInfo", "langTranslation"],
		name: "blocklist",
		data: () => {
			return {
                auth: "",
                id: "",
                blocklist: null,
                loading: true,
                users: [],
                zites: [],
                active: false
			};
		},
		beforeMount: function() {
            var self = this;

            this.auth = Router.currentParams["auth"];
            this.id = Router.currentParams["id"];

            this.getBlocklist();
			this.$emit("setcallback", "update", function(userInfo) {
                self.getBlocklist();
			});
		},
		computed: {
			isLoggedIn: function() {
				if (this.userInfo == null) return false;
				return this.userInfo.cert_user_id != null;
			}
		},
		methods: {
            getUsers: function() {
                var self = this;
                page.cmdp("fileQuery", [`data/${self.blocklist.directory}/${self.blocklist.file}`, "mutes"])
                    .then((mutes) => {
                        var users = [];

                        for (var user_key in mutes[0].value) {
                            users.push({
                                cert_user_id: mutes[0].value[user_key].cert_user_id,
                                auth_address: user_key,
                                reason: mutes[0].value[user_key].reason
                            });
                        }

                        self.users = users;
                    });
            },
            getZites: function() {
                var self = this;
                page.cmdp("fileQuery", [`data/${self.blocklist.directory}/${self.blocklist.file}`, "siteblocks"])
                    .then((siteblocks) => {
                        var zites = [];

                        for (var zite_key in siteblocks[0].value) {
                            zites.push({
                                address: zite_key,
                                name: siteblocks[0].value[zite_key].name,
                                reason: siteblocks[0].value[zite_key].reason
                            });
                        }

                        self.zites = zites;
                    });
            },
            getBlocklist: function() {
                var self = this;

                var query = `SELECT * FROM blocklists LEFT JOIN json USING (json_id) WHERE directory="users/${this.auth}" AND blocklist_id="${this.id}" LIMIT 1`;
                window.page.cmdp("dbQuery", [query])
                    .then((results) => {
                        self.blocklist = results[0];

                        window.page.cmdp("fileNeed", [`data/${self.blocklist.directory}/${self.blocklist.file}`])
                            .then(() => {
                                if (self.blocklist.type == 'users' || self.blocklist.type == 'both') self.getUsers();
                                if (self.blocklist.type == 'zites' || self.blocklist.type == 'both') self.getZites();
                                self.loading = false;
                            });
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
				return false;
			},
			gotoLink: function(to) {
				console.log(to);
				window.location = to;
            },
            toggleEnable: function() {
                if (!this.active) {
                    page.cmdp("filterIncludeAdd", `data/${this.blocklist.directory}/${this.blocklist.file}`);
                } else {
                    page.cmdp("filterIncludeRemove", `data/${this.blocklist.directory}/${this.blocklist.file}`);
                }
            }
		}
	}
</script>