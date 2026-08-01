import streamlit as st
import assemblyai as aai
import requests

st.set_page_config(
    page_title="TranscriptTools",
    page_icon="🎬"
)

st.title("🎬 TranscriptTools")

st.markdown("""
🔑 Get AssemblyAI API Key:

https://www.assemblyai.com/app/account
""")


api_key = st.text_input(
    "AssemblyAI API Key",
    type="password"
)


uploaded_file = st.file_uploader(
    "Upload Video / Audio",
    type=[
        "mp4",
        "mp3",
        "wav",
        "m4a"
    ]
)


if st.button("✨ Generate Transcript"):

    if not api_key:
        st.error("Enter API Key")

    elif not uploaded_file:
        st.error("Upload File")

    else:

        try:

            headers = {
                "authorization": api_key
            }


            with st.spinner(
                "Uploading to AssemblyAI..."
            ):

                upload_response = requests.post(
                    "https://api.assemblyai.com/v2/upload",
                    headers=headers,
                    data=uploaded_file.getvalue()
                )


            audio_url = upload_response.json()["upload_url"]


            transcript_request = {
                "audio_url": audio_url
            }


            transcript_response = requests.post(
                "https://api.assemblyai.com/v2/transcript",
                json=transcript_request,
                headers=headers
            )


            transcript_id = transcript_response.json()["id"]


            status = "processing"


            while status != "completed":

                result = requests.get(
                    f"https://api.assemblyai.com/v2/transcript/{transcript_id}",
                    headers=headers
                ).json()


                status = result["status"]


                if status == "error":
                    st.error(result["error"])
                    break


            if status == "completed":

                text = result["text"]


                st.success(
                    "Completed ✅"
                )


                st.text_area(
                    "Transcript Result",
                    text,
                    height=400
                )


                st.download_button(
                    "Download TXT",
                    text,
                    "transcript.txt"
                )


        except Exception as e:

            st.error(str(e))
