var Cookies = require('js-cookie');
import { initQlikSense, getAllSlides } from '/imports/ui/useCases/useCaseSelection.js';
import * as nav from "/imports/ui/nav.js";

//Layout Configuration. http://stackoverflow.com/questions/28864942/meteor-use-2-different-layouts-ironrouter
Router.configure({
    layoutTemplate: 'containerlayout',
    notFoundTemplate: 'notFound',
});

Router.route('/slides', {
    template: 'slides',
    layoutTemplate: 'emptyLayout'
});

Router.route('/', async function () {
    var selection = this.params.query.selection
    if (selection) {
        await initQlikSense();
        await nav.selectViaQueryId(selection);
        // get the data and go to the slides
        await getAllSlides(false);
        // after we got all data in an array from sense, change the router/browser to the slides page
        Router.go("slides");
    }
    else {
        Router.go('useCaseSelection');
    }
});

Router.route('/useCaseSelection', async function () {
    var selection = this.params.query.selection
    if (selection) {
        await initQlikSense();
        await nav.selectViaQueryId(selection);
        // get the data and go to the slides
        await getAllSlides(false);
        // after we got all data in an array from sense, change the router/browser to the slides page
        Router.go("slides");
    }
    else {
        this.layout('containerlayout');
        this.render('useCaseSelection');
    }
});


//GENERATION
Router.route('/generation');
Router.route('/generation_embedded', {
    template: 'generation',
    layoutTemplate: 'emptyContainerLayout'
});
Router.route('/users', {
    template: 'users',
    layoutTemplate: 'emptyContainerLayout'
});

//SELF SERVICE
Router.route('/selfService', function () {
    this.layout('SSBILayout');
    this.render('nav', { to: 'nav' });
    this.render('SSBIUsers', { to: 'aside' });
    this.render('SSBISenseApp');
});

Router.route('/selfService_embedded', function () {
    this.layout('SSBILayout');
    this.render('SSBIUsers', { to: 'aside' });
    this.render('SSBISenseApp');
});


//API
Router.route('/APILogs');
Router.route('/API_embedded', {
    template: 'APILogs',
    layoutTemplate: 'SSOLayout'
});

Router.route('/ApiLogsTable');
Router.route('/ApiLogsTable_embedded', {
    template: 'ApiLogsTable',
    layoutTemplate: 'SSOLayout'
});
//SECURITY
Router.route('/introductionSecurity');
Router.route('/security_embedded', {
    template: 'introductionSecurity',
    layoutTemplate: 'SSOLayout'
});

//WEB
Router.route('/webIntegration');
Router.route('/webIntegration_embedded', {
    template: 'webIntegration',
    layoutTemplate: 'SSOLayout'
});

//ARCHITECTURE
Router.route('/architecture');
Router.route('/architecture_embedded', {
    template: 'architecture',
    layoutTemplate: 'SSOLayout'
});

//generic overview
Router.route('/generic_links_embedded', {
    template: 'genericDocumentation',
    layoutTemplate: 'SSOLayout'
});

Router.route('/sequenceDiagramOverview');
Router.route('/sequenceDiagramGeneration');
Router.route('/legal');

Router.route('/notFound');
Router.route('/userOverview');
Router.route('/homeAbout');
Router.route('/introduction');
Router.route('/SecurityDeepDive');

//VIDEO OVERVIEW
Router.route('/videoOverview', {
    template: 'videoOverview',
    layoutTemplate: 'containerlayout'
});
Router.route('/videoOverview_embedded', {
    template: 'videoOverview',
    layoutTemplate: 'SSOLayout'
});

Router.route('/documentation', {
    template: 'documentation',
    layoutTemplate: 'containerlayout'
});

Router.route('/templateOverview', {
    template: 'templateOverview',
    layoutTemplate: 'SSOLayout'
});

Router.route('/securityRules', {
    template: 'securityRules',
    layoutTemplate: 'SSOLayout'
});


Router.route('/QMC', {
    template: 'QMC',
    layoutTemplate: 'SSOLayout'
});

// Single sing on integration route, this is the route you configure in Qlik sense proxy
Router.route('/SSO', {
    template: 'SSO',
    layoutTemplate: 'SSOLayout'
});

//users for the slide generator have their own virtual proxy redirect path
Router.route('/presentationsso', {
    template: 'SSO',
    layoutTemplate: 'SSOLayout'
});

//SLIDE GENERATOR LANDING PAGES
Router.route('/presentation', {
    template: 'landingPage',
    layoutTemplate: 'presentationLayout'
});

Router.route('/integration', {
    template: 'landingPage',
    layoutTemplate: 'presentationLayout'
});

//redirect users from saasdemo.qlik.com to integration.qlik.com
if (window.location.href.indexOf("saasdemo") > -1) {
    window.location = "http://integration.qlik.com" + window.location.pathname;
}