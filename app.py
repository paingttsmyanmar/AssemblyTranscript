import streamlit as st
import requests
import streamlit.components.v1 as components
import json
import html


st.set_page_config(
    page_title="TranscriptTools",
    page_icon="🎬"
)


st.title("🎬 TranscriptTools")

st.markdown("""
Convert Video / Audio into Original Transcript using AssemblyAI.

Supported:
- MP4
- MP3
- WAV
- M4A
""")


# Browser Storage Component
components.html(
"""
<script>
const key = localStorage.getItem("assembly_key");

if(key){
    window.parent.postMessage(
        {
            type:"streamlit:setComponentValue",
            value:key
        },
        "*"
    );
}
</script>
""",
height=0
)


api_key = st.text_input(
    "🔑 AssemblyAI API Key",
    type="password",
    placeholder="Paste your API Key"
)


remember = st.checkbox(
    "Remember API Key in this browser"
)


if remember and api_key:

    components.html(
f"""
<script>
localStorage.setItem(
"assembly_key",
"{api_key}"
);
</script>
""",
height=0
)


st.markdown("""
Need AssemblyAI API Key?

👉 https://www.assemblyai.com/app/account
""")


uploaded_file = st.file_uploader(
    "📁 Upload Video / Audio",
    type=[
        "mp4",
        "mp3",
        "wav",
        "m4a"
    ]
)


if "result" not in st.session_state:
    st.session_state.result = ""


if st.button("✨ Generate Transcript"):


    if not api_key:
        st.error(
            "Please enter AssemblyAI API Key"
        )


    elif uploaded_file is None:
        st.error(
            "Please upload file"
        )


    else:

        try:

            headers = {
                "authorization": api_key
            }


            with st.spinner(
                "Uploading to AssemblyAI..."
            ):

                upload = requests.post(
                    "https://api.assemblyai.com/v2/upload",
                    headers=headers,
                    data=uploaded_file.getvalue()
                )


            audio_url = upload.json()["upload_url"]


            with st.spinner(
                "Transcribing..."
            ):

                response = requests.post(
                    "https://api.assemblyai.com/v2/transcript",
                    headers=headers,
                    json={
                        "audio_url": audio_url
                    }
                )


            transcript_id = response.json()["id"]


            while True:

                result = requests.get(
                    f"https://api.assemblyai.com/v2/transcript/{transcript_id}",
                    headers=headers
                ).json()


                if result["status"] == "completed":

                    st.session_state.result = result["text"]
                    break


                if result["status"] == "error":

                    st.error(
                        result["error"]
                    )
                    break



        except Exception as e:

            st.error(
                str(e)
            )



if st.session_state.result:


    st.success(
        "Transcript Completed ✅"
    )


    st.subheader(
        "📝 Original Transcript"
    )


    st.text_area(
        "Result",
        st.session_state.result,
        height=400
    )


    safe_text = html.escape(
        st.session_state.result
    )


    components.html(
f"""
<button onclick="
navigator.clipboard.writeText(
`{safe_text}`
);
alert('Copied!');
"
style="
padding:10px 20px;
border-radius:8px;
cursor:pointer;
">
📋 Copy Transcript
</button>
""",
height=60
)


    st.download_button(
        "⬇️ Download TXT",
        st.session_state.result,
        file_name="transcript.txt"
    )
