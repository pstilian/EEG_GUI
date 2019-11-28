import { getHeapCodeStatistics } from "v8"

//const WebSocket = require('ws');



/**
 * This class handle:
 *  - create websocket connection
 *  - handle request for : headset , request access, control headset ...
 *  - handle 2 main flows : sub and train flow
 *  - use async/await and Promise for request need to be run on sync
 */
class Cortex {
    constructor (user, socketUrl) {
        // create socket
        //process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
        this.socket = new WebSocket(socketUrl)

        // read user infor
        this.user = user
    }

    queryHeadsetId(){
        const QUERY_HEADSET_ID = 2
        let socket = this.socket
        let queryHeadsetRequest =  {
            "jsonrpc": "2.0",
            "id": QUERY_HEADSET_ID,
            "method": "queryHeadsets",
            "params": {}
        }

        return new Promise(function(resolve, reject){
            socket.send(JSON.stringify(queryHeadsetRequest));
            socket.addEventListener('message', (data)=>{
                try {
                    if(JSON.parse(data.data)['id']==QUERY_HEADSET_ID){
                        // console.log(data)
                        // console.log(JSON.parse(data)['result'].length)
                        if(JSON.parse(data.data)['result'].length > 0){
                            let headsetId = JSON.parse(data.data)['result'][0]['id']
                            resolve(headsetId)
                        }
                        else{
                            console.log('No have any headset, please connect headset with your pc.')
                        }
                    }

                } catch (error) {}
            })
        })
    }

    requestAccess(){
        let socket = this.socket
        let user = this.user
        return new Promise(function(resolve, reject){
            const REQUEST_ACCESS_ID = 1
            let requestAccessRequest = {
                "jsonrpc": "2.0",
                "method": "requestAccess",
                "params": {
                    "clientId": user.clientId,
                    "clientSecret": user.clientSecret
                },
                "id": REQUEST_ACCESS_ID
            }

            // console.log('start send request: ',requestAccessRequest)
            socket.send(JSON.stringify(requestAccessRequest));

            socket.addEventListener('message', (data)=>{
                try {
                    if(JSON.parse(data.data)['id']==REQUEST_ACCESS_ID){
                        resolve(data.data)
                    }
                } catch (error) {}
            })
        })
    }

    authorize(){
        let socket = this.socket
        let user = this.user
        return new Promise(function(resolve, reject){
            const AUTHORIZE_ID = 4
            let authorizeRequest = {
                "jsonrpc": "2.0", "method": "authorize",
                "params": {
                    "clientId": user.clientId,
                    "clientSecret": user.clientSecret,
                    "license": user.license,
                    "debit": user.debit
                },
                "id": AUTHORIZE_ID
            }
            socket.send(JSON.stringify(authorizeRequest))
            socket.addEventListener('message', (data)=>{
                try {
                    if(JSON.parse(data.data)['id']==AUTHORIZE_ID){
                        let cortexToken = JSON.parse(data.data)['result']['cortexToken']
                        resolve(cortexToken)
                    }
                } catch (error) {}
            })
        })
    }

    controlDevice(headsetId){
        let socket = this.socket
        const CONTROL_DEVICE_ID = 3
        let controlDeviceRequest = {
            "jsonrpc": "2.0",
            "id": CONTROL_DEVICE_ID,
            "method": "controlDevice",
            "params": {
                "command": "connect",
                "headset": headsetId
            }
        }
        return new Promise(function(resolve, reject){
            socket.send(JSON.stringify(controlDeviceRequest));
            socket.addEventListener('message', (data)=>{
                try {
                    if(JSON.parse(data.data)['id']==CONTROL_DEVICE_ID){
                        resolve(data.data)
                    }
                } catch (error) {}
            })
        })
    }

    createSession(authToken, headsetId){
        let socket = this.socket
        const CREATE_SESSION_ID = 5
        let createSessionRequest = {
            "jsonrpc": "2.0",
            "id": CREATE_SESSION_ID,
            "method": "createSession",
            "params": {
                "cortexToken": authToken,
                "headset": headsetId,
                "status": "active"
            }
        }
        return new Promise(function(resolve, reject){
            socket.send(JSON.stringify(createSessionRequest));
            socket.addEventListener('message', (data)=>{
                console.log(data.data)
                try {
                    if(JSON.parse(data.data)['id']==CREATE_SESSION_ID){
                        let sessionId = JSON.parse(data.data)['result']['id']
                        resolve(sessionId)
                    }
                } catch (error) {}
            })
        })
    }

    startRecord(authToken, sessionId, recordName){
        let socket = this.socket
        const CREATE_RECORD_REQUEST_ID = 11

        let createRecordRequest = {
            "jsonrpc": "2.0",
            "method": "updateSession",
            "params": {
                "cortexToken": authToken,
                "session": sessionId,
                "status": "startRecord",
                "title": recordName,
                "description":"test_marker",
                "groupName": "QA"
            },
            "id": CREATE_RECORD_REQUEST_ID
        }

        return new Promise(function(resolve, reject){
            socket.send(JSON.stringify(createRecordRequest));
            socket.addEventListener('message', (data)=>{
                try {
                    if(JSON.parse(data.data)['id']==CREATE_RECORD_REQUEST_ID){
                        console.log('CREATE RECORD RESULT --------------------------------')
                        console.log(data.data)
                        resolve(data.data)
                    }
                } catch (error) {}
            })
        })
    }



    injectMarkerRequest(authToken, sessionId, label, value, port, time){
        let socket = this.socket
        const INJECT_MARKER_REQUEST_ID = 13
        let injectMarkerRequest = {
            "jsonrpc": "2.0",
            "id": INJECT_MARKER_REQUEST_ID,
            "method": "injectMarker",
            "params": {
                "cortexToken": authToken,
                "session": sessionId,
                "label": label,
                "value": value,
                "port": port,
                "time": time
            }
        }

        return new Promise(function(resolve, reject){
            socket.send(JSON.stringify(injectMarkerRequest));
            socket.addEventListener('message', (data)=>{
                try {
                    if(JSON.parse(data.data)['id']==INJECT_MARKER_REQUEST_ID){
                        console.log('INJECT MARKER RESULT --------------------------------')
                        console.log(data.data)
                        resolve(data.data)
                    }
                } catch (error) {}
            })
        })
    }



    stopRecord(authToken, sessionId, recordName){
        let socket = this.socket
        const STOP_RECORD_REQUEST_ID = 12
        let stopRecordRequest = {
            "jsonrpc": "2.0",
            "method": "updateSession",
            "params": {
                "cortexToken": authToken,
                "session": sessionId,
                "status": "stopRecord",
                "title": recordName,
                "description":"test_marker",
                "groupName": "QA"
            },
            "id": STOP_RECORD_REQUEST_ID
        }

        return new Promise(function(resolve, reject){
            socket.send(JSON.stringify(stopRecordRequest));
            socket.addEventListener('message', (data)=>{
                try {
                    if(JSON.parse(data.data)['id']==STOP_RECORD_REQUEST_ID){
                        console.log('STOP RECORD RESULT --------------------------------')
                        console.log(data.data)
                        resolve(data.data)
                    }
                } catch (error) {}
            })
        })
    }

    addMarker(){
        this.socket.addEventListener('open',async ()=>{
            await this.checkGrantAccessAndQuerySessionInfo()

            let recordName = 'test_marker'
            await this.startRecord(this.authToken, this.sessionId, recordName)


            let thisInjectMarker = this
            let numberOfMarker = 10
            for (let numMarker=0; numMarker<numberOfMarker; numMarker++){
                setTimeout(async function(){
                    // injectMarkerRequest(authToken, sessionId, label, value, port, time)
                    let markerLabel = "marker_number_" + numTrain
                    let markerTime = Date.now()
                    let marker = {
                        label:markerLabel,
                        value:"test",
                        port:"test",
                        time:markerTime
                    }

                    await thisInjectMarker.injectMarkerRequest( thisInjectMarker.authToken,
                                                                thisInjectMarker.sessionId,
                                                                marker.label,
                                                                marker.value,
                                                                marker.port,
                                                                marker.time)
                }, 3000)
            }

            await thisStopRecord.stopRecord(thisStopRecord.authToken, thisStopRecord.sessionId, recordName)
        })
    }

    subRequest(stream, authToken, sessionId){
        let socket = this.socket
        const SUB_REQUEST_ID = 6
        let subRequest = {
            "jsonrpc": "2.0",
            "method": "subscribe",
            "params": {
                "cortexToken": authToken,
                "session": sessionId,
                "streams": stream
            },
            "id": SUB_REQUEST_ID
        }
        console.log('sub eeg request: ', subRequest)
        socket.send(JSON.stringify(subRequest))
        socket.addEventListener('message', (data)=>{
            try {
                // if(JSON.parse(data)['id']==SUB_REQUEST_ID){
                    console.log('SUB REQUEST RESULT --------------------------------')
                    console.log(data.data)
                    console.log('\r\n')
                // }
            } catch (error) {}
        })
    }

    mentalCommandActiveActionRequest(authToken, sessionId, profile, action){
        let socket = this.socket
        const MENTAL_COMMAND_ACTIVE_ACTION_ID = 10
        let mentalCommandActiveActionRequest = {
            "jsonrpc": "2.0",
            "method": "mentalCommandActiveAction",
            "params": {
              "cortexToken": authToken,
              "status": "set",
              "session": sessionId,
              "profile": profile,
              "actions": action
            },
            "id": MENTAL_COMMAND_ACTIVE_ACTION_ID
        }
        // console.log(mentalCommandActiveActionRequest)
        return new Promise(function(resolve, reject){
            socket.send(JSON.stringify(mentalCommandActiveActionRequest))
            socket.addEventListener('message', (data)=>{
                try {
                    if(JSON.parse(data.data)['id']==MENTAL_COMMAND_ACTIVE_ACTION_ID){
                        console.log('MENTAL COMMAND ACTIVE ACTION RESULT --------------------')
                        console.log(data.data)
                        console.log('\r\n')
                        resolve(data.data)
                    }
                } catch (error) {
                }
            })
        })
    }

    /**
     * - query headset infor
     * - connect to headset with control device request
     * - authentication and get back auth token
     * - create session and get back session id
     */
    async querySessionInfo(){
        let headsetId=""
        await this.queryHeadsetId().then((headset)=>{headsetId = headset})
        this.headsetId = headsetId

        let ctResult=""
        await this.controlDevice(headsetId).then((result)=>{ctResult=result})
        this.ctResult = ctResult
        console.log(ctResult)

        let authToken=""
        await this.authorize().then((auth)=>{authToken = auth})
        this.authToken = authToken

        let sessionId = ""
        await this.createSession(authToken, headsetId).then((result)=>{sessionId=result})
        this.sessionId = sessionId

        console.log('HEADSET ID -----------------------------------')
        console.log(this.headsetId)
        console.log('\r\n')
        console.log('CONNECT STATUS -------------------------------')
        console.log(this.ctResult)
        console.log('\r\n')
        console.log('AUTH TOKEN -----------------------------------')
        console.log(this.authToken)
        console.log('\r\n')
        console.log('SESSION ID -----------------------------------')
        console.log(this.sessionId)
        console.log('\r\n')
    }

    /**
     * - check if user logined
     * - check if app is granted for access
     * - query session info to prepare for sub and train
     */
    async checkGrantAccessAndQuerySessionInfo(){
        let requestAccessResult = ""
        await this.requestAccess().then((result)=>{requestAccessResult=result})

        let accessGranted = JSON.parse(requestAccessResult)

        // check if user is logged in CortexUI
        if ("error" in accessGranted){
            console.log('You must login on CortexUI before request for grant access then rerun')
            throw new Error('You must login on CortexUI before request for grant access')
        }else{
            console.log(accessGranted['result']['message'])
            // console.log(accessGranted['result'])
            if(accessGranted['result']['accessGranted']){
                await this.querySessionInfo()
            }
            else{
                console.log('You must accept access request from this app on CortexUI then rerun')
                throw new Error('You must accept access request from this app on CortexUI')
            }
        }
    }


    /**
     *
     * - check login and grant access
     * - subcribe for stream
     * - logout data stream to console or file
     */
    sub(streams){
        this.socket.addEventListener('open', async ()=>{
            console.log("opened")
            await this.checkGrantAccessAndQuerySessionInfo()
            this.subRequest(streams, this.authToken, this.sessionId)
            this.socket.addEventListener('message', (data)=>{

                let lb = data.data[2];
                let hB = data.data[3];
                let alpha = data.data[1];
                let theta = data.data[0];
                let engagement = (data.data[3] / data.data[1]) + data.data[0];
                let fatigue = data.data[0] + (data.data[1] / data.data[2]);



               let layout = {
                    margin: {
                        l: 30,
                        t: 20,
                        b: 20,
                        r: 20
                    }
                };
                let cnt = 0;
                Plotly.plot('low_beta_AF3',[{
                    y:[lb],
                    type: 'line',
                }], layout, {responsive: true});
                setInterval(function(){
                    Plotly.extendTraces('low_beta_AF3', { y:[lb]},[0]);
                    if(!pause){
                        cnt++;
                        if(cnt > 100){
                            Plotly.relayout('low_beta_AF3',{
                                xaxis: {
                                    range: [cnt-100,cnt]
                                },
                            });
                        }
                    }

                },100);



                //plot_g(hb);
                Plotly.plot('high_beta_AF3',[{
                    y:[hB],
                    type: 'line',
                }], layout, {responsive: true});
                setInterval(function(){
                   if(!pause){
                        Plotly.extendTraces('high_beta_AF3', { y:[hB]},[0]);
                        cnt++;
                        if(cnt > 100){
                            Plotly.relayout('high_beta_AF3',{
                                xaxis: {
                                    range: [cnt-100,cnt]
                                },
                            });
                        }
                    }
                },100);
                //plot_g(alpha);
                
                Plotly.plot('alpha_AF3',[{
                    y:[alpha],
                    type: 'line',
                }], layout, {responsive: true});
                setInterval(function(){
                    if(!pause){
                        Plotly.extendTraces('alpha_AF3', { y:[alpha]},[0]);
                        cnt++;
                        if(cnt > 100){
                            Plotly.relayout('alpha_AF3',{
                                xaxis: {
                                    range: [cnt-100,cnt]
                                },
                            });
                        }
                    }
                },100);

               // plot_g(theta);
                Plotly.plot('theta_AF3',[{
                    y:[theta],
                    type: 'line',
                }], layout, {responsive: true});
                setInterval(function(){
                    if(!pause){
                        Plotly.extendTraces('theta_AF3', { y:[theta]},[0]);
                        cnt++;
                        if(cnt > 100){
                            Plotly.relayout('theta_AF3',{
                                xaxis: {
                                    range: [cnt-100,cnt]
                                },
                            });
                        }
                    }
                },100);
                
                Plotly.plot('engagement_AF3',[{
                    y:[engagement],
                    type: 'line',
                }], layout, {responsive: true});
                setInterval(function(){
                    if(!pause){
                        Plotly.extendTraces('engagement_AF3', { y:[engagement]},[0]);
                        cnt++;
                        if(cnt > 100){
                            Plotly.relayout('engagement_AF3',{
                                xaxis: {
                                    range: [cnt-100,cnt]
                                },
                            });
                        }
                    }
                },100);

                //plot_g(engagement);
               // plot_g(fatiuge);
                Plotly.plot('fatigue_AF3',[{
                    y:[fatigue],
                    type: 'line',
                }], layout, {responsive: true});
                setInterval(function(){
                    if(!pause){
                        Plotly.extendTraces('fatigue_AF3', { y:[fatigue]},[0]);
                        cnt++;
                        if(cnt > 100){
                            Plotly.relayout('fatigue_AF3',{
                                xaxis: {
                                    range: [cnt-100,cnt]
                                },
                            });
                        }
                  }
                },100);
                let AF3_switch = document.getElementById('AF3_switch');
                let AF3 = document.getElementById('AF3');
                let AF4_switch = document.getElementById('AF4_switch');
                let AF4 = document.getElementById('AF4');
                let pause = false;
                let init = false;
                AF3_switch.addEventListener('click', function(e){
                    if(!AF3_switch.classList.contains('active')){
                        AF3_switch.classList.toggle('active');
                        AF4_switch.classList.toggle('active');
                        pause = true;
                        $(AF4).slideUp(200, function(f){
                            $(AF3).slideDown(200, function(g){
                                pause = false;
                            });
                        });
                    };
                });
                AF4_switch.addEventListener('click', function(e){
                    if(!AF4_switch.classList.contains('active')){
                        AF3_switch.classList.toggle('active');
                        AF4_switch.classList.toggle('active');
                        pause = true;
                        $(AF3).slideUp(200, function(f){
                            $(AF4).slideDown(200, function(g){
                                if(!init){
                                    plot_g('low_beta_AF4');
                                    plot_g('high_beta_AF4');
                                    plot_g('alpha_AF4');
                                    plot_g('theta_AF4');
                                    plot_g('engagement_AF4');
                                    plot_g('fatigue_AF4');
                                    init = true;
                                }
                                pause = false;
                            });
                        });
                    };
                });
                console.log(data.data)
            })
        })
    }


    setupProfile(authToken, headsetId, profileName, status){
        const SETUP_PROFILE_ID = 7
        let setupProfileRequest = {
            "jsonrpc": "2.0",
            "method": "setupProfile",
            "params": {
              "cortexToken": authToken,
              "headset": headsetId,
              "profile": profileName,
              "status": status
            },
            "id": SETUP_PROFILE_ID
        }
        // console.log(setupProfileRequest)
        let socket = this.socket
        return new Promise(function(resolve, reject){
            socket.send(JSON.stringify(setupProfileRequest));
            socket.addEventListener('message', (data)=>{
                if(status=='create'){
                    resolve(data.data)
                }

                try {
                    // console.log('inside setup profile', data)
                    if(JSON.parse(data.data)['id']==SETUP_PROFILE_ID){
                        if(JSON.parse(data.data)['result']['action']==status){
                            console.log('SETUP PROFILE -------------------------------------')
                            console.log(data.data)
                            console.log('\r\n')
                            resolve(data.data)
                        }
                    }

                } catch (error) {

                }

            })
        })
    }

    queryProfileRequest(authToken){
        const QUERY_PROFILE_ID = 9
        let queryProfileRequest = {
            "jsonrpc": "2.0",
            "method": "queryProfile",
            "params": {
              "cortexToken": authToken
            },
            "id": QUERY_PROFILE_ID
        }

        let socket = this.socket
        return new Promise(function(resolve, reject){
            socket.send(JSON.stringify(queryProfileRequest))
            socket.addEventListener('message', (data)=>{
                try {
                    if(JSON.parse(data.data)['id']==QUERY_PROFILE_ID){
                        // console.log(data)
                        resolve(data.data)
                    }
                } catch (error) {

                }
            })
        })
    }


    /**
     *  - handle send training request
     *  - handle resolve for two difference status : start and accept
     */
    trainRequest(authToken, sessionId, action, status){
        const TRAINING_ID = 8
        const SUB_REQUEST_ID = 6
        let trainingRequest = {
            "jsonrpc": "2.0",
            "method": "training",
            "params": {
              "cortexToken": authToken,
              "detection": "mentalCommand",
              "session": sessionId,
              "action": action,
              "status": status
            },
            "id": TRAINING_ID
        }

        // console.log(trainingRequest)
        // each train take 8 seconds for complete
        console.log('YOU HAVE 8 SECONDS FOR THIS TRAIN')
        console.log('\r\n')

        let socket = this.socket
        return new Promise(function(resolve, reject){
            socket.send(JSON.stringify(trainingRequest))
            socket.addEventListener('message', (data)=>{
                // console.log('inside training ', data)
                try {
                    if (JSON.parse(data.data)[id]==TRAINING_ID){
                        console.log(data.data)
                    }
                } catch (error) {}

                // incase status is start training, only resolve until see "MC_Succeeded"
                if (status == 'start'){
                    try {
                        if(JSON.parse(data.data)['sys'][1]=='MC_Succeeded'){
                            console.log('START TRAINING RESULT --------------------------------------')
                            console.log(data.data)
                            console.log('\r\n')
                            resolve(data.data)
                        }
                    } catch (error) {}
                }

                // incase status is accept training, only resolve until see "MC_Completed"
                if (status == 'accept'){
                    try {
                        if(JSON.parse(data.data)['sys'][1]=='MC_Completed'){
                            console.log('ACCEPT TRAINING RESULT --------------------------------------')
                            console.log(data.data)
                            console.log('\r\n')
                            resolve(data.data)
                        }
                    } catch (error) {}
                }
            })
        })
    }

    /**
     * - check login and grant access
     * - create profile if not yet exist
     * - load profile
     * - sub stream 'sys' for training
     * - train for actions, each action in number of time
     */
     
    train(profileName, trainingActions, numberOfTrain){
        this.socket.addEventListener('open',async ()=>{

            console.log("start training flow")

            // check login and grant access
            await this.checkGrantAccessAndQuerySessionInfo()

            // to training need subcribe 'sys' stream
            this.subRequest(['sys'], this.authToken, this.sessionId)

            // create profile
            let status = "create";
            let createProfileResult = ""
            await this.setupProfile(this.authToken,
                                    this.headsetId,
                                    profileName, status).then((result)=>{createProfileResult=result})

            // load profile
            status = "load"
            let loadProfileResult = ""
            await this.setupProfile(this.authToken,
                                    this.headsetId,
                                    profileName, status).then((result)=>{loadProfileResult=result})

            // training all actions
            let self = this

            for (let trainingAction of trainingActions){
                for (let numTrain=0; numTrain<numberOfTrain; numTrain++){
                    // start training for 'neutral' action
                    console.log(`START TRAINING "${trainingAction}" TIME ${numTrain+1} ---------------`)
                    console.log('\r\n')
                    await self.trainRequest(self.authToken,
                                        self.sessionId,
                                        trainingAction,
                                        'start')

                    //
                    // FROM HERE USER HAVE 8 SECONDS TO TRAIN SPECIFIC ACTION
                    //


                    // accept 'neutral' result
                    console.log(`ACCEPT "${trainingAction}" TIME ${numTrain+1} --------------------`)
                    console.log('\r\n')
                    await self.trainRequest(self.authToken,
                                        self.sessionId,
                                        trainingAction,
                                        'accept')
                }

                let status = "save"
                let saveProfileResult = ""

                // save profile after train
                await self.setupProfile(self.authToken,
                                        self.headsetId,
                                        profileName, status)
                                        .then((result)=>{
                                            saveProfileResult=result
                                            console.log(`COMPLETED SAVE ${trainingAction} FOR ${profileName}`)
                                        })
            }
        })
    }

    /**
     *
     * - load profile which trained before
     * - sub 'com' stream (mental command)
     * - user think specific thing which used while training, for example 'push' action
     * - 'push' command should show up on mental command stream
     */
    live(profileName) {
        this.socket.addEventListener('open',async ()=>{

            await this.checkGrantAccessAndQuerySessionInfo()

            // load profile
            let loadProfileResult=""
            let status = "load"
            await this.setupProfile(this.authToken,
                                    this.headsetId,
                                    profileName,
                                    status).then((result)=>{loadProfileResult=result})
            console.log(loadProfileResult)

            // // sub 'com' stream and view live mode
            this.subRequest(['com'], this.authToken, this.sessionId)

            this.socket.addEventListener('message', (data)=>{
                console.log(data.data)
            })
        })
    }
}

// ---------------------------------------------------------
let socketUrl = 'wss://localhost:6868'
let user = {
    "clientId":"CjMsoEj6aDCYqrkfsnyjrnlJ95Wuv4iWhHq7WcYB",
    "clientSecret":"LKSPP1EUeGoramnqvF51KeqASSzpBBrdaPz2O1La2JHazyf2EujRPjbjfbrD9CHJCSF1SstNnc2WeOVtaj5klQGEAeWCefGOOLr6vHYVFkaYImFDvpEvylXryt4fU0Hn",
    "debit":5000
}
let c = new Cortex(user, socketUrl)
// ---------- sub data stream
// have six kind of stream data ['fac', 'pow', 'eeg', 'mot', 'met', 'com']
// user could sub one or many stream at once
let streams = ['pow']


c.sub(streams);

/*
const WebSocket = require('ws');
const wss = new WebSocket.Server({port: 8080})

wss.on('connection', ws =>{
    ws.on('message', bs =>{
    console.log('recieved message => ${message}')
})

ws.send('Hello! Message From Server!!')
})

*/



    





/*
ws.onopen = function() {
    ws.send('hello server!');
    ws.send(JSON.stringify({'msg': c.sub(streams)}));

    var buffer = new ArrayBuffer(128);
    ws.send(buffer);
    console.log(buffer);
    */
    /*
    var intview = new Uint32Array(buffer);
    socket.send(interview);
    var blob = new blob([buffer]);
    socket.send(blob);
    
}
*/










// ---------- training mental command for profile
// // train is do with a specific profile
// // if profile not yet exist, it will be created
// let profileName = 'test'

// // number of repeat train for each action
// // user have 8 seconds for each time of training
// let numberOfTrain = 1

// // always train 'neutral' complete first then train other action
// let trainingActions = ['neutral', 'push']

// c.train(profileName, trainingActions, numberOfTrain)


// ----------- go to live mode after train
// // load profile which already trained then test your mental command
// c.live(profileName)
// ---------------------------------------------------------
