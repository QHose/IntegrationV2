import {
    Meteor
} from 'meteor/meteor';
// import { APILogs } from '/imports/api/APILogs';
var fs = require('fs-extra');
const path = require('path');

import {
    qrs,
    validateJSON
} from '/imports/api/config.js';
import * as QSLic from '/imports/api/server/QRSFunctionsLicense';

export function getSecurityRules(name) {
    return QSLic.getSystemRules(name);
}

export function disableDefaultSecurityRules() {
    console.log('------------------------------------');
    console.log('disable Default SecurityRules')
    console.log('------------------------------------');

    for (let ruleName of Meteor.settings.security.rulesToDisable) {
        console.log('From Meteor.settings.security.rulesToDisable, Disable security rule: ', ruleName)

        var ruleDefinition = QSLic.getSystemRules(ruleName)[0];
        if (ruleDefinition) {
            ruleDefinition.disabled = true;
            var response = qrs.put('/qrs/SystemRule/' + ruleDefinition.id, null, ruleDefinition);
        } else {
            console.warn('The system rule does not exist in Sense: ' + ruleName);
        }
    };
}

export async function createSecurityRules() {
    console.log('------------------------------------');
    console.log('create security rules in Qlik Sense based on import file');
    console.log('------------------------------------');

    var file = path.join(Meteor.settings.broker.automationBaseFolder, 'securityrules', 'import', 'securityRuleSettings.json');

    // READ THE FILE 
    var securityRules = await fs.readJson(file);
    try {
        validateJSON(securityRules)
    } catch (err) {
        throw new Error('Cant read the security rule definitions file: ' + file);
    }

    securityRules.forEach(function(rule) {
        //check if the rule already exists in Sense
        if (!QSLic.getSystemRules(rule.name).length) {
            //if not exist, create it
            var response = qrs.post('/qrs/SystemRule', null, rule);
        } else {
            console.log('Security rule "' + rule.name + '" already existed');
        }
    });
}

function stringToJSON(myString) {
    var myJSONString = JSON.stringify(myString);
    var myEscapedJSONString = myJSONString.replace(/\\n/g, "\\n")
        .replace(/\\'/g, "\\'")
        .replace(/\\"/g, '\\"')
        .replace(/\\&/g, "\\&")
        .replace(/\\r/g, "\\r")
        .replace(/\\t/g, "\\t")
        .replace(/\\b/g, "\\b")
        .replace(/\\f/g, "\\f");

    console.log('myEscapedJSONString', myEscapedJSONString)
}