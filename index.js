const google = require('googleapis');
const extend = require('xtend');
const gsheets = google.sheets('v4');

// Setup a middleware that will read a range of values from a
// Google Sheets Spreadsheet range and add the values in the context state
//
// ### Arguments:
// - params: should be an object containing:
//   - auth: an oauth2Client
//   - spreadsheetId: the id of the spreadsheet, the part after /d/... in the sheet url
//   - range: a range to read values from, example: 'Sheet1!A1:K'
//
// ### Modified ctx.state:
// If the read is sucessful this middleware will add a new object on
// ```ctx.state.sheets[sheetName]``` containing the values of the range,
// sheetName is the name of the sheet, for example, if the range is
// `Sheet1!A1:k' the values will be accessible under ```ctx.sheets['Sheet1']```
const createMiddleWare = params => (ctx, next) => {
    const pattern = new RegExp('([^!]*)!');
    const matches = params.range.match(pattern);
    const sheetName = matches ? matches[1] : 'Sheet1';
    gsheets.spreadsheets.values.get(params, (err, response) => {
        if (err) {
            console.error(err);
            return err;
        }
        const sheet = response.values;
        const stateSheets = ctx.state.sheets || {};
        const nextSheets = extend(stateSheets, { [sheetName]: sheet });
        const nextState = extend(ctx.state, { sheets: nextSheets });
        ctx.state = nextState; // eslint-disable-line
        return next();
    });
};

module.exports = createMiddleWare;

