<template>
	<v-container fluid>
        <v-container style="max-width: 700px">
            <div class="title" style="margin-bottom: 8px; text-align: center;">Create Blocklist</div>
            
            <v-text-field v-model="title" label="Title" required></v-text-field>
            <v-text-field v-model="description" label="Description..." multi-line></v-text-field>

            <v-radio-group v-model="type" label="Blocklist Type">
                <v-radio key="users" label="Users" value="users"></v-radio>
                <v-radio key="zites" label="Zites" value="zites"></v-radio>
                <v-radio key="both" label="Both (Users and Zites)" value="both"></v-radio>
            </v-radio-group>

			<v-select v-model="tags" label="Tags (press enter to add tag)" chips tags></v-select>

            <v-btn color="primary" ripple @click="create()">Create</v-btn>
        </v-container>
	</v-container>
</template>

<script>
	var Router = require("../libs/router.js");
	var searchDbQuery = require("../libs/search.js");

	module.exports = {
		props: ["userInfo", "langTranslation"],
		name: "create-blocklist",
		data: () => {
			return {
                title: "",
                description: "",
				type: "users",
				tags: []
			};
		},
		beforeMount: function() {
			var self = this;
		},
		mounted: function() {
			var self = this;

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
				return false;
			},
			gotoLink: function(to) {
				console.log(to);
				window.location = to;
			},
			create: function() {
				if (!this.isLoggedIn) return;

				var filename = "blocklist_" + this.title.replace(/[^a-zA-Z_]/, "") + "_" + Date.now();
				var file = filename + ".json";

				var self = this;
				window.page.checkOptional(false, () => {
					window.page.editTableData("blocklists", (date, data, tableData) => {
						tableData.push({
							"blocklist_id": date,
							"title": self.title,
							"description": self.description,
							"type": self.type,
							"file": file,
							"tags": self.tags.join("|"),
							"date_added": date
						});

						return tableData;
					}, ({ id, auth }) => {
						window.page.editData((date, data) => {
							if (!data) data = {};
							if (self.type == "users" || self.type == "both") {
								data["mutes"] = {};
							}
							if (self.type == "zites" || self.type == "both") {
								data["siteblocks"] = {};
							}

							return data;
						}, () => {
							Router.navigate("blocklist/" + auth + "/" + id);
						}, filename);
					});
				});
			}
		}
	}
</script>