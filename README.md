Test CCOW application

This application was built to test the IContextor.js library in a simple MVC application.
This application has two views:

     1. CCOWINIT - This performs a join with the sentillion service
     
     2. MAIN - Used to test the other methods (get current context, set new context, suspend and resume contex, and handle context changes)

In the visual studio debugger, every works except:

      set new context (it fails with a status of Failure)
      
      handle context change (socket error unknow cause as an alert from the IContextor.js library)
      
When this application is published to a Windows 2008 server, it shows the same behavior as Visual Studio debugger. When it is published to a Windows 2016 server, it never returns from the Join callback.
