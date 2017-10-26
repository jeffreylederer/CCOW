Test CCOW application

This application was built to test the IContextor.js library in a simple MVC application.
This application has two views:

     1. CCOWINIT - This performs a join with the Sentillion service
     
     2. MAIN - Used to test the other methods (get current context, set new context, 
     suspend and resume context, and handle context changes)

     
When this application is published to a Windows 2008 server, it shows the same behavior as Visual Studio debugger. When it is published to a Windows 2016 server, it never completes the JoinAsync call. (The callback is never called.)

I get the same results with a 6.2 and 6.4 vault and Locator Window Services.
