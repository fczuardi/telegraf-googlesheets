const google = require('googleapis');
const extend = require('xtend');
const gsheets = google.sheets('v4');

// Setup a middleware that will read a range of values from a
// Google Sheets Spreadsheet and populate a "sheet" property
// in the ctx.state
//
// Arguments:
// - params: should be an object containing:
//   - auth: an oauth2Client
//   - spreadsheetId: the id of the spreadsheet, the part after /d/... in the sheet url
//   - range: a range to read values from, example: 'Sheet1!A1:K'
// - withHead: default = true, a boolean to flag if the first row of a range
// is the head of a table with titles and not data
//
// Modified ctx.state:
// If the read is sucessful this middleware will add a new object on
// ```ctx.state.sheet``` containing the properties ```head``` and ```body```,
// both are arrays of rows, ```head``` will be null if the withHead flag was false
const createMiddleWare = ({ params, withHead = true }) => (ctx, next) => {
    gsheets.spreadsheets.values.get(params, (err, response) => {
        if (err) {
            console.error(err);
            return err;
        }
        const sheet =
            { head: withHead ? response.values[0] : null
            , body: response.values.slice(1)
            };
        const nextState = extend(ctx.state, { sheet });
        ctx.state = nextState; // eslint-disable-line
        return next();
    });
};

module.exports = createMiddleWare;

