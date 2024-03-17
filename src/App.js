import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import { UploadDropzone } from "@bytescale/upload-widget-react";
import Editor from './Components/Editor';
import {SERVER_URL} from './Components/Constant'


const options = {
  apiKey: "public_12a1yeE3cTzeqEyRtMgpbofrWmyG", // Get API key: https://www.bytescale.com/get-started
  maxFileCount: 1,
  showFinishButton: true, // Note: You must use 'onUpdate' if you set 'showFinishButton: false' (default).
  styles: {
    colors: {
      primary: "#377dff"
    }
  }
};

function App() {
  const [editorState,setEditorState]=useState("BASE");
  const [isBaseImg, setBaseImg] = useState(false)
  const [baseImgUrl, setBaseImgUrl] = useState("")

  const uploadImage = async (uploadedFiles) => {
    const fullfileUrl = uploadedFiles
    try{
      const response = await axios.post(`${SERVER_URL}/upload_base_url`, { baseUrl: fullfileUrl });
      setBaseImgUrl(fullfileUrl)
      // console.log('Image uploaded successfully:', response.data);
      if(editorState === "BASE"){
        setBaseImg(true)
        setEditorState("EDITOR")
      }
      
    } catch (error) {
      console.error('Error uploading image:', error);
      // Handle error
    }
  };
  
 
  return (
    <div className="App">
      <nav>
        <h1>Navbar</h1>
      </nav>
      <div className="container">
      {editorState === "BASE"?
          <UploadDropzone options={options}
              onComplete={files => uploadImage(files.map(x => x.fileUrl).join("\n"))}
              // onUpdate={({ uploadedFiles }) => { uploadImage(uploadedFiles.map(x => x.fileUrl).join("\n")) }}
              width="80vw"
              height="80vh" />:""
      }
      {editorState==="EDITOR"?<Editor isBaseImg={isBaseImg} baseImage={baseImgUrl} />:""}
      </div>
    </div>
  );
}

export default App;
