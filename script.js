let transcriptText = "";


// ==========================
// LOAD API KEY
// ==========================

window.onload = () => {

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

        showError("Please enter API Key");

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

        showError("Enter new API Key");

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
// ERROR BOX
// ==========================

function showError(message){

    const box =
    document.getElementById("errorBox");


    box.style.display="block";


    box.innerText =
    "❌ Error:\n\n" + message;

}



function clearError(){

    const box =
    document.getElementById("errorBox");


    box.style.display="none";


    box.innerText="";

}







// ==========================
// FILE INFO
// ==========================

document
.getElementById("file")
.addEventListener(
"change",
function(){


    const file=this.files[0];


    if(!file){

        return;

    }


    let size =
    (file.size / 1024 / 1024)
    .toFixed(2);



    document.getElementById("fileInfo")
    .innerHTML =

    `
    🎬 File:
    ${file.name}
    <br><br>

    📦 Size:
    ${size} MB

    <br><br>

    📄 Type:
    ${file.type || "Unknown"}
    `;


});








// ==========================
// PROGRESS
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


clearError();



const apiKey =
document.getElementById("apiKey")
.value.trim();



const file =
document.getElementById("file")
.files[0];



const language =
document.getElementById("language")
.value;



const result =
document.getElementById("result");





if(!apiKey){

showError(
"API Key is missing"
);

return;

}




if(!file){

showError(
"Please select Video / Audio file"
);

return;

}





try{


result.value="";



updateProgress(
10,
"Checking file..."
);





// Upload


updateProgress(
30,
"Uploading to AssemblyAI..."
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






let uploadData =
await upload.json();





if(!upload.ok){

throw new Error(
JSON.stringify(uploadData)
);

}





if(!uploadData.upload_url){

throw new Error(
"No upload URL received"
);

}





let audioUrl =
uploadData.upload_url;







// Create Transcript


updateProgress(
50,
"Creating Transcript..."
);





let bodyData = {


audio_url: audioUrl


};



// Language

if(language !== "auto"){

bodyData.language_code =
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
JSON.stringify(bodyData)

}

);







let data =
await response.json();





if(!response.ok){

throw new Error(
JSON.stringify(data)
);

}





if(!data.id){

throw new Error(
"Transcript ID not found: "
+
JSON.stringify(data)
);

}





let id =
data.id;








// Check Status


while(true){



updateProgress(
75,
"AI Transcribing..."
);





let check =
await fetch(

"https://api.assemblyai.com/v2/transcript/"+id,

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

r=>setTimeout(r,3000)

);



}




}

catch(error){


showError(
error.message
);



updateProgress(
0,
"Failed ❌"
);



}

}








// ==========================
// COPY
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
// DOWNLOAD
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
