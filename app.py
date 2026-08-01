import streamlit as st
import requests
import base64
import json


st.set_page_config(
    page_title="TranscriptTools",
    page_icon="🎬"
)

st.title("🎬 TranscriptTools")

st.markdown("""
Convert Video / Audio into Original Transcript using AssemblyAI.
""")


api_key = st.text_input(
    "🔑 AssemblyAI API Key",
    type="password",
    placeholder="Paste your API Key"
)


st.markdown("""
Need AssemblyAI API Key?

👉 https://www.assemblyai.com/app/account
""")


uploaded_file = st.file_uploader(
    "📁 Upload Video / Audio",
    type=["mp4","mp3","wav","m4a"],
    label_visibility="visible"
)


if st.button("✨ Generate Transcript"):

    if not api_key:
        st.error("Please enter AssemblyAI API Key")

    elif not uploaded_file:
        st.error("Please upload a file")

    else:

        headers = {
            "authorization": api_key
        }

        with st.spinner("Uploading to AssemblyAI..."):

            upload = requests.post(
                "https://api.assemblyai.com/v2/upload",
                headers=headers,
                data=uploaded_file.getvalue()
            )


        if upload.status_code == 200:

            audio_url = upload.json()["upload_url"]

            with st.spinner("Transcribing..."):

                result = requests.post(
                    "https://api.assemblyai.com/v2/transcript",
                    headers=headers,
                    json={
                        "audio_url": audio_url
                    }
                )


            transcript_id = result.json()["id"]


            while True:

                check = requests.get(
                    f"https://api.assemblyai.com/v2/transcript/{transcript_id}",
                    headers=headers
                ).json()


                if check["status"] == "completed":

                    text = check["text"]

                    st.subheader("📝 Transcript Result")

                    st.text_area(
                        "Original Transcript",
                        text,
                        height=400
                    )


                    st.download_button(
                        "⬇️ Download TXT",
                        text,
                        "transcript.txt"
                    )

                    break


                elif check["status"] == "error":

                    st.error(check["error"])
                    break

        else:

            st.error(
                "AssemblyAI Upload Failed"
)
