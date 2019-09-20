<template>
	<v-container fluid>
        <v-container style="max-width: 700px" v-if="blocklist">
            <div class="title" style="text-align: center;">{{ blocklist.title }}</div>
            <v-subheader style="margin-bottom: 8px; height: 30px; text-align: center; display: block;">{{ blocklist.cert_user_id }}</v-subheader>
            <div style="text-align: center; margin-bottom: 18px;" v-if="blocklist.description.trim()">
                {{ blocklist.description }}
            </div>
            <v-switch v-model="active" :value="active" label="Enable" @click="toggleEnable()"></v-switch>

            <div v-if="blocklist.type == 'users' || blocklist.type == 'both'">
                <v-divider></v-divider>
                <v-subheader>Users</v-subheader>

                <div v-if="isLoggedIn && userInfo.auth_address == auth">
                    <v-menu :close-on-content-click="false" :nudge-width="200" v-model="usersAddMenu">
                        <v-spacer></v-spacer>
                        <v-btn small flat slot="activator" color="primary">Add A User</v-btn>
                        <v-card>
                            <v-card-text>
                                <v-text-field label="User Id" v-model="user_id"></v-text-field>
                                <v-text-field label="User Auth Address" v-model="user_auth"></v-text-field>
                                <v-text-field label="Reason" v-model="user_reason"></v-text-field>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn small flat @click="usersAddMenu = false">Cancel</v-btn>
                                <v-btn small flat color="primary" @click="addUser()" :loading="userAddLoading">Add</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-menu>
                    <div style="clear: both;"></div>
                </div>

                <v-list two-line dense v-if="users.length > 0">
                    <v-list-tile v-for="user in users" :key="user.auth_address" @click="showMenu($event, user)">
                        <v-list-tile-content>
                            <v-list-tile-title>
                                {{ user.cert_user_id }}
                            </v-list-tile-title>
                            <v-list-tile-sub-title>
                                {{ user.auth_address }} - {{ user.reason }}
                            </v-list-tile-sub-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
                <div v-else style="text-align: center; color: red;">
                    There are no users on this blocklist currently.
                </div>
            </div>
            <div v-if="blocklist.type == 'zites' || blocklist.type == 'both'">
                <v-divider :style="{ 'margin-top: 8px;': blocklist.type == 'both' }"></v-divider>
                <v-subheader>Zites</v-subheader>

                <div v-if="isLoggedIn && userInfo.auth_address == auth">
                    <v-menu :close-on-content-click="false" :nudge-width="400" v-model="zitesAddMenu">
                        <v-spacer></v-spacer>
                        <v-btn small flat slot="activator" color="primary">Add A Zite</v-btn>
                        <v-card>
                            <v-card-text>
                                <v-text-field label="Zite Name" v-model="zite_name"></v-text-field>
                                <v-text-field label="Zite Address" v-model="zite_address"></v-text-field>
                                <v-text-field label="Reason" v-model="zite_reason"></v-text-field>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn small flat @click="zitesAddMenu = false">Cancel</v-btn>
                                <v-btn small flat color="primary" @click="addZite()" :loading="ziteAddLoading">Add</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-menu>
                    <div style="clear: both;"></div>
                </div>

                <v-list two-line dense v-if="zites.length > 0">
                    <v-list-tile v-for="zite in zites" :key="zite.address" @click="showMenu($event, zite)">
                        <v-list-tile-content>
                            <v-list-tile-title>
                                {{ zite.name }}
                            </v-list-tile-title>
                            <v-list-tile-sub-title>
                                {{ zite.address }} - {{ zite.reason }}
                            </v-list-tile-sub-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
                <div v-else style="text-align: center; color: red;">
                    There are no zites on this blocklist currently.
                </div>
            </div>

            <v-divider style="margin-top: 18px; margin-bottom: 10px;" v-if="isLoggedIn && userInfo.auth_address == auth"></v-divider>
            <v-btn small flat color="red" v-if="isLoggedIn && userInfo.auth_address == auth" @click="deleteBlocklist()">Delete Blocklist</v-btn>

            <!-- Menus for users and zites -->
            <v-menu :position-x="mx" :position-y="my" :close-on-content-click="false" :nudge-width="400" v-for="zite in zites" :key="zite.address" v-model="zite.menu">
                <v-card>
                    <v-card-title style="font-weight: bold;">{{ zite.name }}</v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>
                        {{ zite.address }}
                    </v-card-text>
                    <v-divider></v-divider>
                    <v-card-text>
                        <strong style="display: block;">Add To One of Your Blocklists</strong>
                    </v-card-text>
                    <v-divider></v-divider>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn small flat @click="removeZite(zite)">Remove</v-btn>
                        <v-btn small flat @click="zite.menu = false">Cancel</v-btn>
                        <!--<v-btn small flat color="primary" @click="addZite()">Mute</v-btn>-->
                    </v-card-actions>
                </v-card>
            </v-menu>

            <v-menu :position-x="mx" :position-y="my" :close-on-content-click="false" :nudge-width="400" v-for="user in users" :key="user.auth_address" v-model="user.menu">
                <v-card>
                    <v-card-title style="font-weight: bold;">{{ user.cert_user_id }}</v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>
                        {{ user.auth_address }}
                    </v-card-text>
                    <v-divider></v-divider>
                    <v-card-text>
                        <strong style="display: block;">Add To One of Your Blocklists</strong>
                    </v-card-text>
                    <v-divider></v-divider>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn small flat @click="user.menu = false">Cancel</v-btn>
                        <v-btn small flat @click="removeUser(user)">Remove</v-btn>
                        <v-btn small flat color="red" @click="muteUser(user)">Mute</v-btn>
                    </v-card-actions>
                </v-card>
            </v-menu>
        </v-container>
	</v-container>
</template>

<script>
	var Router = require("../libs/router.js");
	var searchDbQuery = require("../libs/search.js");

	module.exports = {
		props: ["userInfo", "siteInfo", "langTranslation"],
		name: "blocklist",
		data: () => {
			return {
                auth: "",
                id: "",
                blocklist: null,
                loading: true,
                users: [],
                zites: [],
                usersAddMenu: false,
                zitesAddMenu: false,
                active: false,
                zite_name: "", // Used for adding zite
                zite_address: "",
                zite_reason: "",
                ziteAddLoading: false,
                user_id: "", // Used for adding zite
                user_auth: "",
                user_reason: "",
                userAddLoading: false,
                mx: 0,
                my: 0,
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
            detectEnabled: function(blocklist) {
                console.log(`data/${blocklist.directory}/${blocklist.file}`);
                console.log(this.siteInfo.address);
                var self = this;
                window.page.cmdp("filterIncludeList", [])
                    .then((filters) => {
                        for (var filter of filters) {
                            console.log("Filter: ", filter);
                            if (filter.inner_path == `data/${blocklist.directory}/${blocklist.file}` && filter.address == self.siteInfo.address) {
                                self.active = true;
                                console.log("Active");
                                break;
                            }
                        }
                    });
            },
            getUsers: function() {
                var self = this;
                page.cmdp("fileQuery", [`data/${self.blocklist.directory}/${self.blocklist.file}`, "mutes"])
                    .then((mutes) => {
                        var users = [];

                        if (!mutes[0]) {
                            self.users = users;
                            return;
                        }
                        for (var user_key in mutes[0].value) {
                            users.push({
                                cert_user_id: mutes[0].value[user_key].cert_user_id,
                                auth_address: user_key,
                                source: mutes[0].value[user_key].source,
                                reason: mutes[0].value[user_key].reason,
                                date_added: mutes[0].value[user_key].date_added,
                            });
                        }

                        for (var i = 0; i < users.length; i++) {
                            users[i]["menu"] = false;
                        }

                        self.users = users.sort((a, b) => {
                            return a.date_added - b.date_added; // TODO:
                        });

                    });
            },
            getZites: function() {
                var self = this;
                page.cmdp("fileQuery", [`data/${self.blocklist.directory}/${self.blocklist.file}`, "siteblocks"])
                    .then((siteblocks) => {
                        var zites = [];

                        if (!siteblocks[0]) {
                            self.zites = zites;
                            return;
                        }
                        for (var zite_key in siteblocks[0].value) {
                            zites.push({
                                address: zite_key,
                                name: siteblocks[0].value[zite_key].name,
                                reason: siteblocks[0].value[zite_key].reason,
                                date_added: siteblocks[0].value[zite_key].date_added,
                            });
                        }

                        for (var i = 0; i < zites.length; i++) {
                            zites[i]["menu"] = false;
                        }

                        self.zites = zites.sort((a, b) => {
                            return a.date_added - b.date_added; // TODO:
                        });

                    });
            },
            getBlocklist: function() {
                var self = this;

                var query = `SELECT * FROM blocklists LEFT JOIN json USING (json_id) WHERE directory="users/${this.auth}" AND blocklist_id="${this.id}" LIMIT 1`;
                window.page.cmdp("dbQuery", [query])
                    .then((results) => {
                        self.blocklist = results[0];

                        self.detectEnabled(results[0]);
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
            },
            addUser: function() {
                var self = this;
                if (!this.isLoggedIn && this.userInfo != auth) return;

                // Check if already in list
                for (var user in self.users) {
                    if (user.auth_address == self.auth) {
                        window.page.cmdp("wrapperNotification", ["error", "Already in blocklist."]);
                        return;
                    }
                }

                self.userAddLoading = true;
                window.page.editData((data) => {
                    if (self.blocklist.type == "users" || self.blocklist.type == "both") {
                        if (!data["mutes"]) data["mutes"] = {};

                        data["mutes"][self.user_auth] = {
                            date_added: Date.now(),
                            cert_user_id: self.user_id,
                            reason: self.user_reason,
                        };
                    } else { // TODO
                        window.page.cmdp("wrapperNotification", ["error", "Blocklist type doesn't allow adding users."]);
                    }

                    return data;
                }, () => {
                    self.userAddLoading = false;
                    self.usersAddMenu = false;
                    self.user_auth = ""; // Used for adding zite
                    self.user_id = "";
                    self.user_reason = "";
                    //Router.navigate("blocklist/" + auth + "/" + id);
                }, this.blocklist.file.replace(".json", ""));
            },
            removeUser: function(user) {
                var self = this;
                if (!this.isLoggedIn && this.userInfo != auth) return;

                window.page.editData((data) => {
                    if (self.blocklist.type == "users" || self.blocklist.type == "both") {
                        if (!data["mutes"]) {
                            window.page.cmdp("wrapperNotification", ["error", "Blocklist's users is empty."]);
                            data["mutes"] = {};
                            return data;
                        }

                        var entries = Object.entries(data["mutes"]);
                        for (var entry of entries) {
                            var key = entry[0];
                            var value = entry[1];

                            if (key == user.auth_address) {
                                delete data["mutes"][key];
                                return data;
                            }
                        }
                    }
                }, () => {
                }, this.blocklist.file.replace(".json", ""));
            },
            addZite: function() {
                var self = this;
                if (!this.isLoggedIn && this.userInfo != auth) return;

                // Check if already in list
                for (var zite in self.zites) {
                    if (zite.address == self.zite_address) {
                        window.page.cmdp("wrapperNotification", ["error", "Already in blocklist."]);
                        return;
                    }
                }

                self.ziteAddLoading = true;
                window.page.editData((data) => {
                    if (self.blocklist.type == "zites" || self.blocklist.type == "both") {
                        if (!data["siteblocks"]) data["siteblocks"] = {};

                        data["siteblocks"][self.zite_address] = {
                            date_added: Date.now(),
                            name: self.zite_name,
                            reason: self.zite_reason,
                        };
                    } else { // TODO
                        window.page.cmdp("wrapperNotification", ["error", "Blocklist type doesn't allow adding zites."]);
                    }

                    return data;
                }, () => {
                    self.ziteAddLoading = false;
                    self.zitesAddMenu = false;
                    self.zite_name = ""; // Used for adding zite
                    self.zite_address = "";
                    self.zite_reason = "";
                    //Router.navigate("blocklist/" + auth + "/" + id);
                }, this.blocklist.file.replace(".json", ""));
            },
            removeZite: function(zite) {
                var self = this;
                if (!this.isLoggedIn && this.userInfo != auth) return;

                console.log("test");

                window.page.editData((data) => {
                    if (self.blocklist.type == "zites" || self.blocklist.type == "both") {
                        if (!data["siteblocks"]) {
                            window.page.cmdp("wrapperNotification", ["error", "Blocklist's zites is empty."]);
                            data["siteblocks"] = {};
                            return data;
                        }

                        var entries = Object.entries(data["siteblocks"]);
                        for (var entry of entries) {
                            var key = entry[0];
                            var value = entry[1];

                            if (key == zite.address) {
                                delete data["siteblocks"][key];
                                return data;
                            }
                        }
                    }
                }, () => {
                }, this.blocklist.file.replace(".json", ""));
            },
            deleteBlocklist: function() {
                var self = this;
                if (!this.isLoggedIn || this.blocklist.directory != "users/" + this.userInfo.auth_address) return;

                // Delete file
                window.page.cmdp("fileDelete", [`data/${this.blocklist.directory}/${this.blocklist.file}`]);

                // Delete from database
                window.page.checkOptional(false, () => {
					window.page.editTableData("blocklists", (date, data, tableData) => {
                        for (var i = 0; i < tableData.length; i++) {
                            var blocklist = tableData[i];
                            if (blocklist.blocklist_id == self.id) {
                                tableData.splice(i, 1);
                            }
                        }

						return tableData;
					}, ({ id, auth }) => {
						Router.navigate("");
					});
				});
            },
            showMenu: function(e, obj) {
                e.preventDefault()

                for (var i = 0; i < this.users; i++) this.users[i].menu = false;
                for (var i = 0; i < this.zites; i++) this.zites[i].menu = false;

		        this.mx = e.clientX
                this.my = e.clientY
                
				var self = this;
		        this.$nextTick(() => {
				  obj.menu = true;
		        })
            },
            muteUser: function(user) {
                window.page.cmdp("muteAdd", [user.auth_address, user.cert_user_id, user.reason]);
            }
		}
	}
</script>