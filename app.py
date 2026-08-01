import streamlit as st
import assemblyai as aai
import tempfile
import os

st.set_page_config(
    page_title="TranscriptTools",
    page_icon="🎬"
)

st.title("🎬 TranscriptTools")

st.write(
    "Convert Video / Audio into Text using AssemblyAI"
)

st.markdown("""
Supported:
- MP4
- MP3
- WAV
- M4A

Languages:
- English
- Chinese
- Burmese
- 99+ Languages
""")

api_key = st.text_input(
    "🔑 AssemblyAI API Key",
    type="password",
    placeholder="Paste your API Key"
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


if st.button("✨ Generate Transcript"):

    if not api_key:
        st.error(
            "Please enter AssemblyAI API Key"
        )

    elif uploaded_file is None:
        st.error(
            "Please upload a file"
        )

    else:
        try:

            aai.settings.api_key = api_key

            with tempfile.NamedTemporaryFile(
                delete=False,
                suffix=os.path.splitext(
                    uploaded_file.name
                )[1]
            ) as f:

                f.write(
                    uploaded_file.read()
                )

                file_path = f.name


            config = aai.TranscriptionConfig(
                language_detection=True
            )


            transcriber = aai.Transcriber(
                config=config
            )


            with st.spinner(
                "Transcribing..."
            ):

                transcript = transcriber.transcribe(
                    file_path
                )


            if transcript.status == aai.TranscriptStatus.error:

                st.error(
                    transcript.error
                )

            else:

                st.success(
                    "Completed!"
                )

                result = transcript.text

                st.text_area(
                    "Transcript Result",
                    result,
                    height=400
                )


                st.download_button(
                    "⬇️ Download TXT",
                    result,
                    file_name="transcript.txt"
                )


            os.remove(file_path)


        except Exception as e:

            st.error(
                f"Error: {str(e)}"
)
