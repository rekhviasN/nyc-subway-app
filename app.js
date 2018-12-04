const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const rp = require('request-promise');

app.listen(port, () => {
  console.log('Listening on port ', port);
});

// Store for all data 
const trainStatus = {
  '123': { status: "DELAYED", downtime: 1, uptime: 1, latestTimestamp: Date.now(), note: null },
  '456' : { status: "DELAYED", downtime: 1, uptime: 1, latestTimestamp: Date.now(), note: null },
  '7' : { status: "DELAYED", downtime: 1, uptime: 1, latestTimestamp: Date.now(), note: null },
  'ACE': { status: "DELAYED", downtime: 1, uptime: 1, latestTimestamp: Date.now(), note: null },
  'BDFM' : { status: "DELAYED", downtime: 1, uptime: 1, latestTimestamp: Date.now(), note: null },
  'JZ' : { status: "DELAYED", downtime: 1, uptime: 1, latestTimestamp: Date.now(), note: null },
  'L' : { status: "DELAYED", downtime: 1, uptime: 1, latestTimestamp: Date.now(), note: null },
  'NQR' : { status: "DELAYED", downtime: 1, uptime: 1, latestTimestamp: Date.now(), note: null },
  'S' : { status: "DELAYED", downtime: 1, uptime: 1, latestTimestamp: Date.now(), note: null },
}

// Initiate and increment by 1 everytime and update occurs
let updateTracker = 0

// Set initial train status values
getUpdates()

// Update status & alert (note) values 
setInterval(getUpdates,5000)

//Helper functions 

const checkStatus = (str) => {
  // Capture the string spanning between the name of the train and the closing of its status designation
  let lastIndex = str.indexOf('</status>')
  // Check to see if there's Good Service included in the string
  if (str.slice(0,lastIndex).includes('GOOD SERVICE')){
    return "Not delayed"
  }else {
    return "DELAYED"
  }
}

const determineNote = (newStatus, train) => {
  return newStatus === "DELAYED" ? `Line ${train} is experiencing delays` : `Line ${train} is now recovered` 
}

const setUpAndDownTime = (newStatus, train) => {
  let newStamp = Date.now()
  let diff = newStamp - trainStatus[train].timestamp
  if(trainStatus[train].status === "DELAYED"){
    trainStatus[train].downtime+=diff
  }
  if(trainStatus[train].status ==="Not delayed"){
    trainStatus[train].uptime+=diff
  }
  trainStatus[train].timestamp = newStamp 
}

// Function to mke API call & log data to console 

function getUpdates(){
  const options = { 
    url: 'http://web.mta.info/status/serviceStatus.txt',
  }

  rp.get(options)
    .then((data)=>{
      // Parse data & set new values trainStatus object 
      let indicies = {
         index123 : data.indexOf('<name>123</name>'),
         index456 : data.indexOf('<name>456</name>'),
         index7 : data.indexOf('<name>7</name>'),
         indexACE: data.indexOf('<name>ACE</name>'),
         indexBDFM : data.indexOf('<name>BDFM</name>'),
         indexJZ : data.indexOf('<name>JZ</name>'),
         indexL : data.indexOf('<name>L</name>'),
         indexNQR : data.indexOf('<name>NQR</name>'),
         indexS : data.indexOf('<name>S</name>')
      }
      
      for(let k in indicies){
        let train = k.slice(5)
        let indexOfTrainInData = data.slice(indicies[k])
        let newStatus = checkStatus(indexOfTrainInData)
        trainStatus[train].note = trainStatus[train].status!== newStatus ? determineNote(newStatus, train) : trainStatus[train].note
        setUpAndDownTime(newStatus, train)
        trainStatus[train].status = newStatus
      }

      // Confirm function iterates as expected 
      console.log('# Update:', updateTracker++)

      // Print the status of the trains in the console
      let log = ""
      for(let k in trainStatus){
        log+="Train "+ k+": "+trainStatus[k].status+'\n' + 'note: ' + trainStatus[k].note + '\n\n'
      }
      console.log(log)
      
  })
}


app.get('/status/:train',(req, res)=>{
  let train = req.params.train

  if(train === "1" || train==="2" || train ==="3"){
    res.send(`${train} Train <div> Status: ${trainStatus['123'].status} \n<div> Note: ${trainStatus['123'].note}`)
  }
  else if(train==="4" || train==="5" || train ==="6"){
    res.send(`${train} Train <div> Status: ${trainStatus['456'].status} \n<div> Note: ${trainStatus['456'].note}`)
  }
  else if(train==="7"){
    res.send(`${train} Train <div> Status: ${trainStatus['7'].status} \n<div> Note: ${trainStatus['7'].note}`)
  }
  else if(train==="A" || train==="C" || train==="E"){
    res.send(`${train} Train <div> Status: ${trainStatus['ACE'].status} \n<div> Note: ${trainStatus['ACE'].note}`)
  }
  else if(train==="B" || train==="D" || train==="F" || train ==="M"){
    res.send(`${train} Train <div> Status: ${trainStatus['BDFM'].status} \n<div> Note: ${trainStatus['BDFM'].note}`)
  }
  else if(train==="J" || train ==="Z"){
      res.send(`${train} Train <div> Status: ${trainStatus['JZ'].status} \n<div> Note: ${trainStatus['JZ'].note}`)
  }
  else if(train==="L"){
    res.send(`${train} Train <div> Status: ${trainStatus['L'].status} \n<div> Note: ${trainStatus['L'].note}`)
  }
  else if(train ==="N" || train==="Q" || train=== "R"){
    res.send(`${train} Train <div> Status: ${trainStatus['NQR'].status} \n<div> Note: ${trainStatus['NQR'].note}`)
  }
  else if(train==="S"){
    res.send(`${train} Train <div> Status: ${trainStatus['S'].status} \n<div> Note: ${trainStatus['S'].note}`)
  }else{
    res.send("Please request a valid train")
  }
})

app.get('/uptime/:train', (req, res)=>{
  let train = req.params.train
  if(train === "1" || train==="2" || train ==="3"){
    let percentage = Math.floor((trainStatus['123'].uptime*100)/(trainStatus['123'].downtime + trainStatus['123'].uptime))+"%"
    res.send(`${train} Train <div> Uptime: ${percentage}`)
  }
  else if(train==="4" || train==="5" || train ==="6"){
    let percentage = Math.floor((trainStatus['456'].uptime*100)/(trainStatus['456'].downtime + trainStatus['456'].uptime))+"%"
    res.send(`${train} Train <div> Uptime: ${percentage}`)
  }
  else if(train==="7"){
    let percentage = Math.floor((trainStatus['7'].uptime*100)/(trainStatus['7'].downtime + trainStatus['7'].uptime))+"%"
    res.send(`${train} Train <div> Uptime: ${percentage}`)
  }
  else if(train==="A" || train==="C" || train==="E"){
    let percentage = Math.floor((trainStatus['ACE'].uptime*100)/(trainStatus['ACE'].downtime + trainStatus['ACE'].uptime))+"%"
    res.send(`${train} Train <div> Uptime: ${percentage}`)
  }
  else if(train==="B" || train==="D" || train==="F" || train ==="M"){
    let percentage = Math.floor((trainStatus['BDFM'].uptime*100)/(trainStatus['BDFM'].downtime + trainStatus['BDFM'].uptime))+"%"
    res.send(`${train} Train <div> Uptime: ${percentage}`)
  }
  else if(train==="J" || train ==="Z"){
    let percentage = Math.floor((trainStatus['JZ'].uptime*100)/(trainStatus['JZ'].downtime + trainStatus['JZ'].uptime))+"%"
    res.send(`${train} Train <div> Uptime: ${percentage}`)
  }
  else if(train==="L"){
    let percentage = Math.floor((trainStatus['L'].uptime*100)/(trainStatus['L'].downtime + trainStatus['L'].uptime))+"%"
    res.send(`${train} Train <div> Uptime: ${percentage}`)
  }
  else if(train ==="N" || train==="Q" || train=== "R"){
    let percentage = Math.floor((trainStatus['NQR'].uptime*100)/(trainStatus['NQR'].downtime + trainStatus['NQR'].uptime))+"%"
    res.send(`${train} Train <div> Uptime: ${percentage}`)
  }
  else if(train==="S"){
    let percentage = Math.floor((trainStatus['S'].uptime*100)/(trainStatus['S'].downtime + trainStatus['S'].uptime))+"%"
    res.send(`${train} Train <div> Uptime: ${percentage}`)
  }else{
    res.send("Please request a valid train")
  }
})

