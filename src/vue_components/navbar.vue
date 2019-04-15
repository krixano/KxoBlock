<template>
	<v-toolbar clipped-left app dark style="padding-right: 45px; padding-left: 45px;" color="primary">
		<v-toolbar-side-icon @click.stop="toggleDrawer()"></v-toolbar-side-icon>

		<v-menu bottom>
	    	<v-toolbar-title slot="activator" style="cursor: pointer;" @mousedown.middle="gotoLinkNewTab('./?/')" @click.prevent="goto('')">
	    		<span>{{ ZiteName }} (alpha)</span>
	    		<v-icon dark>arrow_drop_down</v-icon>
	    	</v-toolbar-title>
	    	<v-list dense>
		        <v-list-tile v-for="item in kxozites" :key="item.address" :href="'/' + item.address" @click="gotoLink('/' + item.address)">
		        	<v-list-tile-title v-text="item.title"></v-list-tile-title>
		        </v-list-tile>
	    	</v-list>
	    </v-menu>

		<!--<v-toolbar-title href="./?/" style="cursor: pointer;" @click.prevent="goto('')">{{ ZiteName }} (alpha)</v-toolbar-title>-->
		<v-spacer class="hidden-md-and-down">
			<div style="width: 350px; margin: auto;">
				<!--<v-spacer class="hidden-md-and-down"></v-spacer>-->
				<v-text-field role="search" :dark="theme == 'dark'" class="hidden-md-and-down" solo flat light hide-details placeholder="Search" v-model="search" :value="search" @keypress.enter="goto('search/' + search)" prepend-icon="search"></v-text-field>
				<!--<v-spacer></v-spacer>-->
			</div>
		</v-spacer>
		<v-spacer class="hidden-lg-and-up"></v-spacer>
		<!--<v-toolbar-items style="margin-left: 10px;">-->
			<!--<v-btn flat>News</v-btn>-->
			<!--<v-btn flat @click="goto('plugins')">Plugin Store</v-btn>-->
		<!--</v-toolbar-items>-->
		<!--<v-menu left offset-y dark>
			<v-btn icon slot="activator" class="hidden-xs-only">
		      <v-icon>apps</v-icon>
		    </v-btn>
		    <v-list>
		    	<v-subheader>Network Zites</v-subheader>
				<v-list-tile href="/1GTVetvjTEriCMzKzWSP9FahYoMPy6BG1P" @click="gotoLink('/1GTVetvjTEriCMzKzWSP9FahYoMPy6BG1P')">
		    		<v-list-tile-title>KxoNetwork</v-list-tile-title>
		    	</v-list-tile>
		    	<v-list-tile href="/kxovid.bit" @click="gotoLink('/kxovid.bit')">
		    		<v-list-tile-title>KxoVid</v-list-tile-title>
		    	</v-list-tile>
		    	<v-list-tile href="/ZeroMedium.bit" @click="gotoLink('/ZeroMedium.bit')">
		    		<v-list-tile-title>ZeroMedium</v-list-tile-title>
		    	</v-list-tile>
		    	<v-list-tile href="/ZeroExchange.bit" @click="gotoLink('/ZeroExchange.bit')">
		    		<v-list-tile-title>KxoQA</v-list-tile-title>
		    	</v-list-tile>
		    	<v-list-tile href="/1LqcxtENM69yBggxPYLaj87J4bqon5SVwU" @click="gotoLink('/1LqcxtENM69yBggxPYLaj87J4bqon5SVwU')">
		    		<v-list-tile-title>KxoHub (ZeroMe Hub)</v-list-tile-title>
		    	</v-list-tile>
		    	<v-divider></v-divider>
		    	<v-subheader>Partner Zites</v-subheader>
		    	<v-list-tile href="/1Ag6xidDHiPgWoDKhfSx4xFQr6WC3NqxZg" @click="gotoLink('/1Ag6xidDHiPgWoDKhfSx4xFQr6WC3NqxZg')">
		    		<v-list-tile-title>0Play Game Center</v-list-tile-title>
		    	</v-list-tile>
		    </v-list>
		</v-menu>-->
		<v-toolbar-items>
			<v-btn flat v-if="!isLoggedIn" @click="login()">Sign In</v-btn>
			<v-menu flat v-else offset-y>
				<!--<v-btn slot="activator" icon class="hidden-sm-and-up" style="margin-right: 25px;">
					<svg style="height: 55%;" v-bind:data-jdenticon-value="userInfo.auth_address" v-if="isLoggedIn"></svg>
				</v-btn>-->
				<v-btn slot="activator" flat>
					<svg style="height: 40%; width: auto; margin-top: auto; margin-bottom: auto; margin-right: 5px;" v-bind:data-jdenticon-value="userInfo.auth_address" v-if="isLoggedIn"></svg>
					<span class="hidden-xs-only">{{ userInfo.cert_user_id }}</span>
				</v-btn>
			</v-menu>
		</v-toolbar-items>
	</v-toolbar>
</template>

<script>
	var Router = require("../libs/router.js");

	module.exports = {
		props: ["theme", "gettingsUserInfo", "userInfo", "gettingSettings", "userSettings", "langTranslation"],
		name: "navbar",
		data: () => {
			return {
				ZiteName: "KxoDo",
				search: "",
				kxozites: [
					{ title: "KxoNetwork", address: "1GTVetvjTEriCMzKzWSP9FahYoMPy6BG1P" },
					{ title: "KxoVid", address: "14c5LUN73J7KKMznp9LvZWkxpZFWgE1sDz" },
					{ title: "KxoQA", address: "1PHBjZSAc6mHDMkySJNs3XeSXUL7eY7Q7W" },
					{ title: "ZeroMedium", address: "1CVmbCKWtbskK2GAZLM6gnMuiL6Je25Yds" },
				],
			};
		},
		beforeMount: function() {
			var self = this;
			this.$parent.$on("setLanguage", function(langTranslation) {
				self.ZiteName = langTranslation["KxoDo"];
			});
			this.ZiteName = this.langTranslation["KxoDo"];

			if (Router.currentParams["searchquery"]) {
				this.search = Router.currentParams["searchquery"];
			}
		},
		mounted: function() {
			var self = this;
		},
		updated: function() {
			//jdenticon();
		},
		computed: {
			isLoggedIn: function() {
				if (this.userInfo == null) return false;
				return this.userInfo.cert_user_id != null;
			}
		},
		methods: {
			toggleDrawer: function() {
				this.$emit("toggle-drawer");
			},
			goto: function(to) {
				Router.navigate(to);
			},
			gotoLink: function(to) {
				page.cmdp("wrapperOpenWindow", [to]);
			},
			gotoLinkNewTab: function(to) {
				page.cmdp("wrapperOpenWindow", [to, "_blank"]);
			},
			login: function() {
				page.selectUser();
				return false;
			},
			gotoLink: function(to) {
				window.location = to;
			},
			signout: function() {
				page.signout();
			}
		}
	}
</script>