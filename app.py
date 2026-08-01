import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(
    page_title="TranscriptTools",
    page_icon="🎬"
)

st.title("🎬 TranscriptTools")

st.markdown("""
Video / Audio → AssemblyAI → Original Transcript

No Streamlit upload limit.
Direct browser upload.
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


if api_key:

    html_code = open(
        "upload.html",
        "r",
        encoding="utf-8"
    ).read()


    html_code = html_code.replace(
        "{{API_KEY}}",
        api_key
    )


    components.html(
        html_code,
        height=700,
        scrolling=True
    )

else:

    st.info(
        "Please enter AssemblyAI API Key first."
    )
