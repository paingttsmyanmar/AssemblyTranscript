let transcriptText = "";


// =========================
// LOAD SAVED KEY
// =========================

window.onload = () => {

    const key =
    localStorage.getItem("assembly_api_key");


    if(key){

        document.getElementById("apiKey").value = key;

    }

};



// =========================
// API KEY
// =========================


function saveKey(){

    let key =
    document.getElementById("apiKey").value.trim();


    if(!key){

        showError("API Key မထည့်ရသေးပါ");

        return;

    }


    localStorage.setItem(
        "assembly_api_key",
        key
    );


    alert("API Key Saved ✅");

}





function changeKey(){

    saveKey();

}





function removeKey(){

    localStorage.removeItem(
        "assembly_api_key"
    );


    document.getElementById("apiKey").value="";


    alert("API Key Removed 🗑");

}







// =========================
// ERROR DISPLAY
// =========================


function showError(error){


    let box =
    document.getElementById("errorBox");


    box.style.display="block";


    box.innerText =
    "❌ ERROR\n\n" + error;


}






function clearError(){

    let box =
    document.getElementById("errorBox");


    box.style.display="none";

    box.innerText="";

}








// =========================
// PROGRESS
// =========================


function progress(value,text){


document.getElementById(
"progressBar"
).style.width=value+"%";



document.getElementById(
"progressPercent"
).innerText=value+"%";



document.getElementById(
"statusText"
).innerText=text;


}








// =========================
// FILE INFO
// =========================


document
.getElementById("file")
.addEventListener(
"change",
()=>{


let file =
document.getElementById("file").files[0];



if(file){


document.getElementById(
"fileInfo"
).innerHTML = `

🎬 ${file.name}

<br><br>

📦 ${(file.size/1024/1024).toFixed(2)} MB

<br><br>

📄 ${file.type}

`;


}


});









// =========================
// MAIN
// =========================


async function generateTranscript(){



clearError();



let apiKey =
document.getElementById("apiKey").value.trim();



let file =
document.getElementById("file").files[0];



let language =
document.getElementById("language").value;



let result =
document.getElementById("result");






if(!apiKey){

showError(
"API Key မရှိပါ"
);

return;

}




if(!file){

showError(
"File မရွေးထားပါ"
);

return;

}





try{


result.value="";



progress(
10,
"Preparing..."
);






// =========================
// UPLOAD
// =========================


progress(
30,
"Uploading to AssemblyAI..."
);



let uploadResponse =
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
await uploadResponse.json();






if(!uploadResponse.ok){


throw new Error(

"UPLOAD ERROR\n\n"+
JSON.stringify(
uploadData,
null,
2
)

);


}





if(!uploadData.upload_url){


throw new Error(

"No upload URL received\n\n"+
JSON.stringify(
uploadData,
null,
2
)

);


}







let audioUrl =
uploadData.upload_url;










// =========================
// CREATE TRANSCRIPT
// =========================


progress(
50,
"Sending to AssemblyAI..."
);






let body = {


audio_url:audioUrl


};




// language


if(language !== "auto"){


body.language_code =
language;


}








console.log(
"Request Body",
body
);








let transcriptResponse =
await fetch(

"https://api.assemblyai.com/v2/transcript",

{

method:"POST",

headers:{


"authorization":apiKey,


"content-type":"application/json"


},


body:JSON.stringify(body)


}

);






let transcriptData =
await transcriptResponse.json();






console.log(
"Transcript Response",
transcriptData
);







if(!transcriptResponse.ok){


throw new Error(

"TRANSCRIPT API ERROR\n\n"+
JSON.stringify(
transcriptData,
null,
2
)

);


}







if(!transcriptData.id){


throw new Error(

"No Transcript ID\n\n"+
JSON.stringify(
transcriptData,
null,
2
)

);


}






let id =
transcriptData.id;










// =========================
// CHECK STATUS
// =========================


while(true){



progress(
75,
"Transcribing..."
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





let statusData =
await check.json();





if(statusData.status==="completed"){



transcriptText =
statusData.text;



result.value =
transcriptText;



progress(
100,
"Completed ✅"
);


break;


}







if(statusData.status==="error"){


throw new Error(

"PROCESS ERROR\n\n"+
statusData.error

);


}





await new Promise(

r=>setTimeout(r,3000)

);




}





}

catch(error){



result.value =
error.message;



showError(
error.message
);



progress(
0,
"Failed ❌"
);



}




}








// =========================
// COPY
// =========================


function copyText(){


navigator.clipboard.writeText(
transcriptText
);


alert("Copied ✅");


}







// =========================
// DOWNLOAD
// =========================


function downloadText(){


let blob =
new Blob(

[transcriptText],

{
type:"text/plain"
}

);



let a =
document.createElement("a");



a.href =
URL.createObjectURL(blob);



a.download =
"transcript.txt";


a.click();



}
