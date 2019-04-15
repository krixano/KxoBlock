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

            <div v-if="isLoggedIn">
                <v-divider style="margin-top: 12px;"></v-divider>
                <v-subheader>Starred Projects</v-subheader>

                <v-divider style="margin-top: 12px;"></v-divider>
                <v-subheader>Your Projects</v-subheader>
                <v-list-tile :href="'./?/'" @click.prevent="goto('')">
                    <v-list-tile-content>
                        <v-list-tile-title>Create Project</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <!-- TODO -->
            </div>

            <v-divider style="margin-top: 12px; margin-bottom: 12px;"></v-divider>
            <v-list-tile :class="{ 'menu-item-active': routerIsActive('device-settings') }" href="./?/device-settings" @click.prevent="goto('device-settings')">
                <v-list-tile-title>Device Settings</v-list-tile-title>
            </v-list-tile>
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
        background-color: #505050;
    }
</style>


<script>
	var Router = require("../libs/router.js");

	module.exports = {
		props: ["theme", "gettingUserInfo", "userInfo", "gettingSettings", "userSettings", "langTranslation"],
		name: "nav-drawer",
		data: () => {
			return {
                subscriptions: [],
                category_subscriptions: []
			};
		},
		beforeMount: function() {
			var self = this;
            
            this.$emit("setcallback", "navDrawerUpdate", function(userInfo) {
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
			goto: function(to) {
                Router.navigate(to);
			},
			login: function() {
				page.selectUser();
				return false;
			},
			gotoLink: function(to) {
				window.location = to;
            },
            routerIsActive: function(route) {
                return Router.currentRoute == route;
            },
		}
	}
</script>