Test CCOW application

This application was built to test the IContextor.js library in a simple MVC application.
This application has two views:

     1. CCOWINIT - This performs a join with the Sentillion service
     
     2. MAIN - Used to test the other methods (get current context, set new context, 
     suspend and resume context, and handle context changes)

In the visual studio debugger, every works except:

      set new context (it fails with a status of Failure)
      
      handle context change (socket error unknown cause as an alert from the IContextor.js library)
      
When this application is published to a Windows 2008 server, it shows the same behavior as Visual Studio debugger. When it is published to a Windows 2016 server, it never calls the Join callback.

I am going to retry this with the 6.4 Vault and service and see if this make things work.
