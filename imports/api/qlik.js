import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import enigma from "enigma.js";
import schema from "enigma.js/schemas/12.612.0.json";

// Singleton enigma.js connection to the Qlik Cloud app that holds the slide data.
// The M2M access token is fetched from the server (see server/methods.js) and
// passed to the websocket via the "jwt" subprotocol, the way Qlik Cloud expects it.
let app = null;

export async function getSlideGenApp() {
    if (app) return app;

    const { qlikCloudTenant, appId } = Meteor.settings.public;
    const accessToken = await Meteor.call("getQlikAccessToken");

    const host = qlikCloudTenant.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const url = `wss://${host}/app/${appId}`;

    const session = enigma.create({
        schema,
        url,
        createSocket: () => new WebSocket(url, `jwt.${accessToken}`),
    });

    const enigmaGlobal = await session.open();
    app = await enigmaGlobal.openDoc(appId);
    return app;
}

//
// ─── SLIDE HEADERS ──────────────────────────────────────────────────────────────
//

// All Level 1 + Level 2 combinations: one row per slide title.
// Level 2 is sorted on the first CSV row it appears in (min(CSVRowNo)),
// which keeps slides in the order of the source spreadsheet.
async function getAllSlideHeadersPlain(qix) {
    const sessionModel = await qix.createSessionObject({
        qInfo: { qType: "cube" },
        qHyperCubeDef: {
            qDimensions: [
                { qDef: { qFieldDefs: ["Level 1"] } },
                {
                    qDef: {
                        qFieldDefs: ["Level 2"],
                        qSortCriterias: [
                            {
                                qSortByState: 0,
                                qSortByFrequency: 0,
                                qSortByNumeric: 0,
                                qSortByAscii: 0,
                                qSortByLoadOrder: 1,
                                qSortByExpression: 1,
                                qExpression: { qv: "min(CSVRowNo)" },
                                qSortByGreyness: 0,
                            },
                        ],
                    },
                },
            ],
        },
    });

    const sessionData = await sessionModel.getHyperCubeData("/qHyperCubeDef", [
        { qTop: 0, qLeft: 0, qWidth: 3, qHeight: 3333 },
    ]);
    return sessionData[0].qMatrix;
}

// Insert the chapter name as a plain string whenever Level 1 changes.
// The slides template renders those strings as chapter breaker slides.
function insertSectionBreakers(table) {
    let previousLevel1 = "";
    const tableWithChapters = [];

    table.forEach((currentRow) => {
        const currentLevel1 = currentRow[0].qText;
        if (previousLevel1 !== currentLevel1) {
            tableWithChapters.push(currentLevel1);
            previousLevel1 = currentLevel1;
        }
        tableWithChapters.push(currentRow);
    });
    return tableWithChapters;
}

// Load all slides (headers + chapter breakers) into the reactive session,
// which triggers the slides template to render.
export async function getAllSlides() {
    const qix = await getSlideGenApp();
    const table = insertSectionBreakers(await getAllSlideHeadersPlain(qix));
    Session.set("slideHeaders", table);
}

//
// ─── SLIDE CONTENT ──────────────────────────────────────────────────────────────
//

// The bullets of a slide: all Level 3 rows that belong to the given
// Level 1 + Level 2 combination, sorted on CSVRowNo.
export async function getLevel3(level1, level2) {
    try {
        const qix = await getSlideGenApp();
        const sessionModel = await qix.createSessionObject({
            qInfo: { qType: "cube" },
            qHyperCubeDef: {
                qDimensions: [
                    { qDef: { qFieldDefs: ["Level 3"] } },
                    { qDef: { qFieldDefs: ["CSVRowNo"] } },
                ],
                qMeasures: [
                    {
                        qDef: {
                            qDef:
                                'sum({< "Level 1"={"' +
                                level1 +
                                '"}, "Level 2"={"' +
                                level2 +
                                '"}>}1)',
                        },
                    },
                ],
            },
        });
        const sessionData = await sessionModel.getHyperCubeData("/qHyperCubeDef", [
            { qTop: 0, qLeft: 0, qWidth: 3, qHeight: 3333 },
        ]);

        const level3Temp = sessionData[0].qMatrix;
        sessionModel.removeAllListeners();

        return normalizeAndSortData(level3Temp);
    } catch (error) {
        //error happens when you select something else after your selection... not a real error
    }
}

// The comment of a slide, or an empty string when there is none.
export async function getComment(level1, level2) {
    const qix = await getSlideGenApp();
    const sessionModel = await qix.createSessionObject({
        qInfo: { qType: "cube" },
        qHyperCubeDef: {
            qDimensions: [{ qDef: { qFieldDefs: ["Comment"] } }],
            qMeasures: [
                {
                    qDef: {
                        qDef:
                            'sum({< "Level 1"={"' +
                            level1 +
                            '"}, "Level 2"={"' +
                            level2 +
                            '"} >}1)',
                    },
                },
            ],
        },
    });
    const sessionData = await sessionModel.getHyperCubeData("/qHyperCubeDef", [
        { qTop: 0, qLeft: 0, qWidth: 2, qHeight: 1000 },
    ]);

    const comment = sessionData[0].qMatrix[0][0].qText;
    return comment != "null" ? comment : "";
}

function normalizeAndSortData(senseArray) {
    const result = [];
    senseArray.sort(compare);
    for (const element of senseArray) {
        result.push(element[0].qText);
    }
    return result;
}

function compare(a, b) {
    if (a[1].qNum < b[1].qNum) return -1;
    if (a[1].qNum > b[1].qNum) return 1;
    return 0;
}
