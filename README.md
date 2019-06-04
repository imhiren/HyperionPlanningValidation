# HyperionPlanningValidation
Retrofit Javascript validation in Hyperion Planning version 11.1.2.4 with ADF Interface.


Older versions of Hyperion Planning had a framework which supported javascript validations.
However in 11.1.2.4 the Hyperion Planning was implemented using ADF, discontinuing the support for javascript valdiations.

Following are the steps to retrofit the same functionality in the latest version.

1.	Navigate to "Middleware\EPMSystem11R1\products\Planning\AppServer\InstallableApps\Common\"
    Make a backup copy of the “HyperionPlanning.ear”
2.	Now, unzip the “HyperionPlanning.ear” to a new folder (/ear).
3.	From the extracted files , Unzip “Hyperion.war” file to a new folder (/war).
4.	Replace the file “/ear/war/LaunchPlanningCentral.js” with the modified “LaunchPlanningCentral.js” file attached in the mail.

5.	Replace the file “/ear/war/adfjs/ADFCommon.js” with the modified “ADFCommon.js” file attached in the mail.

6.	Compress the contents of “/ear/war” to “/ear/HyperionPlanning.war”.

7.	Compress the contents of “/ear” to “HyperionPlanning.ear”.

8.	Place this updated  “HyperionPlanning.ear” file in the following path, replacing it with the existing one

“Middleware\EPMSystem11R1\products\Planning\AppServer\InstallableApps\Common\”

9.	Restart the planning server

Note: The method is not supported by Oracle.
