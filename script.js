let transcriptText = "";


// ==========================
// LOAD SAVED API KEY
// ==========================

window.onload = function(){

    const saved =
    localStorage.getItem("assembly_api_key");


    if(saved){

        document.getElementById("apiKey").value = saved;

    }

};




// ==========================
// API KEY SYSTEM
// ==========================


function saveKey(){

    const key =
    document.getElementById("apiKey").value.trim();


    if(!key){

        alert("Please enter API Key");

        return;

    }


    localStorage.setItem(
        "assembly_api_key",
        key
    );


    alert("API Key Saved ✅");

}




function changeKey(){

    const key =
    document.getElementById("apiKey").value.trim();


    if(!key){

        alert("Enter new API Key");

        return;

    }


    localStorage.setItem(
        "assembly_api_key",
        key
    );


    alert("API Key Changed ✅");

}





function removeKey(){

    localStorage.removeItem(
        "assembly_api_key"
    );


    document.getElementById("apiKey").value="";


    alert("API Key Removed 🗑");

}






// ==========================
// PROGRESS SYSTEM
// ==========================


function updateProgress(percent,text){


    document.getElementById(
        "progressBar"
    ).style.width =
    percent+"%";



    document.getElementById(
        "progressPercent"
    ).innerText =
    percent+"%";



    document.getElementById(
        "statusText"
    ).innerText =
    text;


}









// ==========================
// GENERATE TRANSCRIPT
// ==========================


async function generateTranscript(){



const apiKey =
document.getElementById("apiKey").value.trim();



const file =
document.getElementById("file").files[0];



const language =
document.getElementById("language").value;



const result =
document.getElementById("result");





if(!apiKey){

alert("Please enter AssemblyAI API Key");

return;

}




if(!file){

alert("Please select Video / Audio");

return;

}





try{



result.value="";



updateProgress(
10,
"Preparing file..."
);






// ==========================
// UPLOAD FILE
// ==========================


updateProgress(
30,
"Uploading file..."
);



let upload =
await fetch(

"https://api.assemblyai.com/v2/upload",

{

method:"POST",

headers:{

"authorization":apiKey

},

body:file

}

);





if(!upload.ok){

throw new Error(
"Upload failed"
);

}





let uploadData =
await upload.json();



let audioUrl =
uploadData.upload_url;






// ==========================
// CREATE TRANSCRIPT
// ==========================


updateProgress(
50,
"Sending to AssemblyAI..."
);




let requestData = {


audio_url: audioUrl,


speech_model:"universal"


};




// Language Select

if(language !== "auto"){


requestData.language_code =
language;


}






let response =
await fetch(

"https://api.assemblyai.com/v2/transcript",

{

method:"POST",


headers:{


"authorization":apiKey,


"content-type":"application/json"


},


body:
JSON.stringify(requestData)


}

);






let data =
await response.json();



if(!data.id){

throw new Error(
"Transcript creation failed"
);

}



let transcriptId =
data.id;








// ==========================
// CHECK STATUS
// ==========================


while(true){



updateProgress(
75,
"AI Transcribing..."
);





let check =
await fetch(

"https://api.assemblyai.com/v2/transcript/"+transcriptId,

{

headers:{

"authorization":apiKey

}

}

);





let status =
await check.json();






if(status.status==="completed"){



transcriptText =
status.text;



result.value =
transcriptText;




updateProgress(

100,

"Transcript Completed ✅"

);



break;


}







if(status.status==="error"){



throw new Error(
status.error
);


}






await new Promise(

resolve =>
setTimeout(resolve,3000)

);



}





}

catch(error){



result.value =
error.message;



updateProgress(

0,

"Error: "+error.message

);



}



}








// ==========================
// COPY TEXT
// ==========================


function copyText(){



if(!transcriptText){

return;

}



navigator.clipboard.writeText(
transcriptText
);



alert("Copied ✅");


}









// ==========================
// DOWNLOAD TXT
// ==========================


function downloadText(){



if(!transcriptText){

return;

}



let blob =
new Blob(

[transcriptText],

{

type:"text/plain"

}

);



let link =
document.createElement("a");



link.href =
URL.createObjectURL(blob);



link.download =
"transcript.txt";



link.click();



        }
