// server.js
// An HTTP server for returning events from a Windows system event log

// Example:
// http://localhost:1337?filename=application&count=25&search=*the*

// Normally this would run as a Windows service. But for demonstration purposes, we will run this using node in a console window.

'use strict';
var http = require('http');
var port = process.env.PORT || 1337;

const defaultLogFileName = 'application';       // default event log file name
const defaultNumLogRecords = 25;                // default number of log events to return


const { spawn } = require('child_process');

var url = require('url');

// global unhandled exception catcher -- error string can be saved in a log file.
process.on('uncaughtException', (err, origin) => {
    console.error('\n' + (new Date).toLocaleString() + ` Caught exception: \n`);
    console.error(err.stack);
    process.exit(1);
});


function ReadEvents(LogFileName, NumLogRecords, SearchString, httpResponse) {

    // the search string is not used unless provided by the caller
    var SearchCmd = "";
    if (SearchString)
        SearchCmd = '-Message ' + SearchString;

    const args = [`Get-EventLog -Newest ${NumLogRecords} -LogName "${LogFileName}" ${SearchCmd} | Format-Table -Auto -wrap`];

    console.log((new Date).toLocaleString() + '  powershell.exe ' + args);
    const subprocess = spawn(`PowerShell.exe`, args);

    subprocess.on('error', (err) => {
        var errmsg = (`Failed to start subprocess. stderr: ${err.message}`);
        console.error(errmsg);
        httpResponse.end(errmsg);
    });

    subprocess.on('exit', (code) => {
        console.log(`child process exited with code ${code}`);
        if (code == 0)
            httpResponse.end(`<<< end of report >>>`);
        else
            httpResponse.end(`<<< report failure >>>`);
    });

    subprocess.stdout.on('data', (data) => {
        httpResponse.write(data);
    });

    //subprocess.stdout.pipe(httpResponse);       // set the child process's stdout to pipe directly to the httpResponse
}


const server = http.createServer(function (req, res) {

    var args = decodeURIComponent(req.url.slice(1));   // we must skip over the leading '?'
    if (!args.search('favicon.ico'))
        return;

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    console.log(`Server running at http://localhost:${port}/`);

    var params = new URLSearchParams(args);
    console.log(`params = ${params}`);

    // use default params unless overridden by caller
    var LogFileName = params.get('filename');
    if (!LogFileName)
        LogFileName = defaultLogFileName;

    var NumLogRecords = params.get('count');
    if (!NumLogRecords)
        NumLogRecords = defaultNumLogRecords;

    ReadEvents(LogFileName, NumLogRecords, params.get('search'), res);

}).listen(port);

