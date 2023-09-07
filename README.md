# CriblLogTest

This project is an HTTP server that will return events from a Windows event log via a REST API. The logfiles are normally stored in C:\Windows\System32\winevt\Logs. The main ones of interest are: system, security, application, and setup. Newest events are returned first.

The Node.js filename that contains the server code is "server.js". This should be executed in a console window as <node server.js>.

The server currently runs on port 1337 and takes 3 optional parameters.
1) filename -- The name of the log file (without the extension). Defaults to "application"
2) count -- The number of events to return. Defaults to 25
3) search -- The string to filter events on (accepts wildcards). Default is "" (no filter)

Examples:

http://localhost:1337    Returns last 25 events from the application event log.
http://localhost:1337?filename=application&count=50&search=*error*    Returns last 50 events from application log where Message contains the word "error"
http://localhost:1337?filename=system&count=100000		Returns the last 100,000 events from the system event log.


To test for error conditions:
http://localhost:1337?filename=XXapplication
http://localhost:1337?count=-1


Sample output:

Index Time         EntryType   Source                               InstanceID Message                                 
----- ----         ---------   ------                               ---------- -------                                 
12359 Sep 06 19:26 Information igccservice                                   0 PowerEvent handled successfully by the  
                                                                               service.                                
12358 Sep 06 19:26 Information BrYNSvc                                       0 The description for Event ID '0' in     
                                                                               Source 'BrYNSvc' cannot be found.  The  
                                                                               local computer may not have the         
                                                                               necessary registry information or       
                                                                               message DLL files to display the        
                                                                               message, or you may not have permission 
                                                                               to access them.  The following          
                                                                               information is part of the event:'Bad   
                                                                               service request'  
<<< end of report >>>