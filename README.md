# EEG GUI
This project is to produce a custom GUI application for use with the emotiv BCI headset to allow the user to view EEG data in real time. This application allows users to visualize EEG data using the Emotiv Insight headset. The following metrics are plotted in real time. 

* Low Beta Waves
* High Beta Waves
* Alpha Waves
* Theta Waves
* User Engagement Levels
* Fatigue Levels

## Installation 
* [Install Nodejs](https://nodejs.org/en/)

* [Install EmotivApps](https://emotiv.com)

* Install ws package with npm ```npm install ws```

## Prepare
### Create emotiv id
Go to [emotiv website](https://emotiv.com) for create new emotivid

### Make sure you are using your Client ID and Client Secret
If not go to [emotiv website](https://emotiv.com) to create a new pair of client id and client secret for your app.
In the code for cortex_code_example.js replace the following code...
```
"clientId":"Your Client ID",
"clientSecret":"Your Client Secret"
```
## Running the Program
* Start the CortexUI
* Login on CortexUI with emotivid and password manually
* Connect headset with pc or mac
* Wear headset and make sure have a good contact quality, contact quality could be viewed visually on CortexUI
* Run example first time to request access ```node cortex_code_example.js```
* Approve access on CortexUI manually (Action of approve need to do only onece)
* Run the program using ```index.html```

## Credits to Contributors
* [Peter Stilian](https://github.com/pstilian)
* [Donald Christianson](https://github.com/Donaldc354)
* [Mary Wilson](https://github.com/mwilson18)
* Emily Cardella
