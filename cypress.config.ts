import { defineConfig } from "cypress";
import SocialLogins from "cypress-social-logins";

const { GitHubSocialLogin } = SocialLogins.plugins;

export default defineConfig({
    component: {
        devServer: {
            framework: "next",
            bundler: "webpack",
        },
    },

    e2e: {
        baseUrl: "http://localhost:3000",
        chromeWebSecurity: false,
        setupNodeEvents(on, config) {
            on("task", {
                GitHubSocialLogin,
            });
        },
    },
});
