let transcriptText = "";


// ===============================
// API KEY SAVE SYSTEM
// ===============================


window.onload = () => {

    let savedKey = localStorage.getItem(
        "assembly_api_key"
    );

    if(savedKey){

        document.getElementById("apiKey").value = savedKey;

    }

};



function saveKey(){

    let key =
    document.getElementById("apiKey").value.trim();


    if(!key){

        alert("Enter API Key first");

        return;

    }


    localStorage.setItem(
        "assembly_api_key",
        key
    );


    alert("API Key Saved ✅");

}




function changeKey(){

    let key =
    document.getElementById("apiKey").value.trim();


    if(!key){

        alert("Enter New API Key");

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





// ===============================
// PROGRESS SYSTEM
// ===============================


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







// ===============================
// GENERATE TRANSCRIPT
// ===============================


async function generateTranscript(){


const apiKey =
document.getElementById("apiKey").value.trim();


const file =
document.getElementById("file").files[0];


const result =
document.getElementById("result");



if(!apiKey){

alert(
"Please enter AssemblyAI API Key"
);

return;

}



if(!file){

alert(
"Please select file"
);

return;

}



try{


updateProgress(
10,
"Preparing file..."
);



result.value="";





// Upload File


updateProgress(
30,
"Uploading File..."
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
"Upload Failed"
);

}



let uploadData =
await upload.json();


let audioUrl =
uploadData.upload_url;





// Create Transcript


updateProgress(
55,
"Sending to AssemblyAI..."
);



let response =
await fetch(

"https://api.assemblyai.com/v2/transcript",

{

method:"POST",

headers:{

"authorization":apiKey,

"content-type":"application/json"

},

body:JSON.stringify({

audio_url:audioUrl

})

}

);





let data =
await response.json();


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


result.value =
status.error;


updateProgress(
0,
"Error ❌"
);


break;


}





await new Promise(

r=>setTimeout(r,3000)

);



}



}

catch(error){


result.value =
error.message;


updateProgress(
0,
"Something went wrong ❌"
);



}



}









// ===============================
// COPY
// ===============================


function copyText(){


navigator.clipboard.writeText(
transcriptText
);


alert(
"Copied ✅"
);


}







// ===============================
// DOWNLOAD TXT
// ===============================


function downloadText(){



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
