let transcriptText = "";


async function generateTranscript(){


const apiKey =
document.getElementById("apiKey").value;


const file =
document.getElementById("file").files[0];


const result =
document.getElementById("result");



if(!apiKey){

alert("Please enter AssemblyAI API Key");

return;

}


if(!file){

alert("Please select file");

return;

}



result.value="Uploading...";



// Upload file to AssemblyAI

let upload = await fetch(

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



let audioUrl =
uploadData.upload_url;



result.value="Transcribing...";



// Create Transcript

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


let id=data.id;



while(true){


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


transcriptText=status.text;


result.value=transcriptText;


break;


}



if(status.status==="error"){


result.value=status.error;

break;


}



await new Promise(
r=>setTimeout(r,3000)
);


}


}



function copyText(){


navigator.clipboard.writeText(
transcriptText
);


alert("Copied!");

}



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
