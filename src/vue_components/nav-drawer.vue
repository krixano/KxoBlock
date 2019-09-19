<template>
    <div>
        <!--<v-toolbar flat class="transparent" v-if="isLoggedIn">
            <v-list class="pa-0">
                <v-list-tile avatar>
                    <v-list-tile-avatar>
                        <svg style="height: 75%; width: auto;" v-bind:data-jdenticon-value="userInfo.auth_address"></svg>
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ userInfo.cert_user_id }}</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
        </v-toolbar>
        <v-divider style="margin-bottom: 12px;" v-if="isLoggedIn"></v-divider>-->
        <v-list :dark="dark == 'dark'" dense>
            <v-list-tile :class="{ 'menu-item-active': routerIsActive('') }" href="./?/" @click.prevent="goto('')">
                <v-list-tile-action>
                    <v-icon>home</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                    <v-list-tile-title>Home</v-list-tile-title>
                </v-list-tile-content>
            </v-list-tile>

            <div v-if="enabled_blocklists.length > 0">
                <v-divider style="margin-top: 8px;"></v-divider>
                <v-subheader>{{ langTranslation["navdrawer-enabled-blocklists"] }}</v-subheader>
            </div>

            <div v-if="isLoggedIn">
                <v-divider style="margin-top: 8px;"></v-divider>
                <v-subheader>{{ langTranslation["navdrawer-your-blocklists"] }}</v-subheader>
                <v-list-tile v-for="blocklist in your_blocklists" :key="blocklist.blocklist_id" :class="{ 'menu-item-active': blocklistIsActive(userInfo.auth_address, blocklist.blocklist_id) }" :href="'./?/blocklist/' + userInfo.auth_address + '/' + blocklist.blocklist_id" @click.prevent="goto('blocklist/' + userInfo.auth_address + '/' + blocklist.blocklist_id)">
                    <v-list-tile-content>
                        <v-list-tile-title>{{ blocklist.title }}</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>

                <v-list-tile :class="{ 'menu-item-active': routerIsActive('create-blocklist') }" href="./?/create-blocklist" @click.prevent="goto('create-blocklist')">
                    <v-list-tile-content>
                        <v-list-tile-title>{{ langTranslation["navdrawer-create-blocklist"] }}</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <!-- TODO -->
            </div>

            <v-divider style="margin-top: 8px; margin-bottom: 8px;"></v-divider>
            <v-list-tile :class="{ 'menu-item-active': routerIsActive('support-me') }" href="./?/support-me" @click.prevent="goto('support-me')">
                <v-list-tile-title>Support Me</v-list-tile-title>
            </v-list-tile>
        </v-list>
    </div>
</template>

<style lang="css" scoped>
    .menu-item-active {
        background-color: lightgray;
    }
    .theme--dark .menu-item-active {
        background-color: #605050;
    }
</style>


<script>
	var Router = require("../libs/router.js");

	module.exports = {
		props: ["theme", "gettingUserInfo", "userInfo", "gettingSettings", "userSettings", "langTranslation"],
		name: "nav-drawer",
		data: () => {
			return {
                enabled_blocklists: [],
                your_blocklists: [],
			};
		},
		beforeMount: function() {
			var self = this;
            
            //this.getBlocklists();
            this.$emit("setcallback", "navDrawerUpdate", function(userInfo) {
                self.getBlocklists();
			});
		},
		updated: function() {
            //jdenticon();
            /*switch (this.$vuetify.breakpoint.name) {
                case 'xs': this.value = false;
                case 'sm': this.value = false;
                case 'md': this.value = false;
                case 'lg': this.value = null;
                case 'xl': this.value = null;
            }*/
		},
		computed: {
			isLoggedIn: function() {
				if (this.userInfo == null) return false;
				return this.userInfo.cert_user_id != null;
            }
		},
		methods: {
            getBlocklists: function() {
                var self = this;
                var query = `SELECT * FROM blocklists LEFT JOIN json USING (json_id) WHERE directory="users/${this.userInfo.auth_address}" ORDER BY date_added ASC`;
                console.log(query);
                window.page.cmdp("dbQuery", [query])
                    .then((results) => {
                        console.log(results);
                        self.your_blocklists = results;
                    })
            },
			goto: function(to) {
                Router.navigate(to);
			},
			login: function() {
				window.page.selectUser();
				return false;
			},
			gotoLink: function(to) {
				window.location = to;
            },
            routerIsActive: function(route) {
                return Router.currentRoute == route;
            },
            blocklistIsActive: function(auth, id) {
                return Router.currentRoute == "blocklist/:auth/:id" && Router.currentParams["auth"] == auth && Router.currentParams["id"] == id;
            }
		}
	}
</script>