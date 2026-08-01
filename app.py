import streamlit as st
import requests
import html


st.set_page_config(
    page_title="TranscriptTools",
    page_icon="🎬"
)


st.title("🎬 TranscriptTools")

st.markdown("""
Convert Video / Audio into Text using AssemblyAI.

Supported:
- MP4
- MP3
- WAV
- M4A
""")


st.markdown("""
🔑 **Need AssemblyAI API Key?**

Get your API Key here:

👉 https://www.assemblyai.com/app/account

Create account → Copy API Key → Paste below.
""")


api_key = st.text_input(
    "🔐 AssemblyAI API Key",
    type="password",
    placeholder="Paste your API Key here"
)


uploaded_file = st.file_uploader(
    "📁 Upload Video / Audio",
    type=[
        "mp4",
        "mp3",
        "wav",
        "m4a"
    ]
)


if "transcript" not in st.session_state:
    st.session_state.transcript = ""


if st.button("✨ Generate Transcript"):

    if not api_key:
        st.error("Please enter AssemblyAI API Key")

    elif uploaded_file is None:
        st.error("Please upload a file")

    else:

        try:

            headers = {
                "authorization": api_key
            }


            with st.spinner("Uploading to AssemblyAI..."):

                upload = requests.post(
                    "https://api.assemblyai.com/v2/upload",
                    headers=headers,
                    data=uploaded_file.getvalue()
                )


            if upload.status_code != 200:
                st.error(
                    "Upload failed"
                )

            else:

                audio_url = upload.json()["upload_url"]


                with st.spinner("Transcribing..."):

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

                        st.session_state.transcript = result["text"]
                        break


                    elif result["status"] == "error":

                        st.error(
                            result["error"]
                        )
                        break


                st.success(
                    "Transcript Completed ✅"
                )


        except Exception as e:

            st.error(
                str(e)
            )



if st.session_state.transcript:


    st.subheader(
        "📝 Transcript Result"
    )


    st.text_area(
        "Original Transcript",
        st.session_state.transcript,
        height=400
    )


    copy_text = html.escape(
        st.session_state.transcript
    )


    st.components.v1.html(
        f"""
        <button onclick="
        navigator.clipboard.writeText(`{copy_text}`);
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
        st.session_state.transcript,
        file_name="transcript.txt"
                        )
