import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import '../App.css'
import { UploadDropzone } from "@bytescale/upload-widget-react";
import Canvas from './Canvas';
import noImage from "../Assets/noimagefound.png"
import {SERVER_URL} from './Constant'

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
// Function to convert data URL to Blob
const dataURLtoBlob = (dataURL) => {
  const parts = dataURL.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const byteCharacters = atob(parts[1]);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
};

  // const uploadImageToBytescale = async (file) => {
  //   try {
  //     const imageData = dataURLtoBlob(file);
  //     // Create a FormData object
  //     const formData = new FormData();
  //     formData.append('file', imageData);
  
  //     // Make a POST request to Bytescale API
  //     const response = await fetch('https://api.bytescale.com/upload', {
  //       method: 'POST',
  //       body: formData,
  //       headers: {
  //         'X-API-Key': 'public_12a1yeE3cTzeqEyRtMgpbofrWmyG', // Replace 'YOUR_API_KEY' with your actual Bytescale API key
  //       },
  //     });
  
  //     if (!response.ok) {
  //       throw new Error('Failed to upload image to Bytescale');
  //     }
  
  //     // Parse response data
  //     const responseData = await response.json();
  
  //     // Return the URL of the uploaded image
  //     return responseData.url;
  //   } catch (error) {
  //     console.error('Error uploading image:', error);
  //     throw error; // Rethrow the error for error handling
  //   }
  // };
  

const Editor = (props) => {
    const [brushSize, setBrushSize]=useState(15)
    const [imgdimensions, setImgDimensions] = useState({ width: 0, height: 0 });
    const imageRef = useRef(null);
    const [isfurnitureImage,setisfurnitureImage]=useState(false)
    const [ismaskImage,setismaskImage]=useState(false)
    const [generatedImageUrl, setGeneratedImageUrl] = useState("");
    const [isGenerateEnabled, setIsGenerateEnabled] = useState(false);
    const [furnitureImgUrl, setFurnitureImgUrl] = useState("");
    const [forceRender, setForceRender] = useState(false);
    const [drawingPaths, setDrawingPaths] = useState([]);


    // useEffect(() => {
    //     if (imageRef.current) {
    //       const { clientWidth, clientHeight } = imageRef.current;
    //       setImgDimensions({ width: clientWidth, height: clientHeight });
    //     }
    // }, [props.baseImage]);
    const setCanvas=() => {
        if (imageRef.current) {
          const { clientWidth, clientHeight } = imageRef.current;
          setImgDimensions({ width: clientWidth, height: clientHeight });
        }
    };

    const dcrBrush = ()=>{
        if(brushSize>15){
            setBrushSize(brushSize-3)
        }
    }
    const incBrush = ()=>{
        if(brushSize<50){
            setBrushSize(brushSize+3)
        }
    }

    
    

    const handleGetMask = async () => {
      // Get the base image
      const baseImage = document.getElementById("baseImage");
      const canvas = document.getElementById("editorCanvas");
      const context = canvas.getContext("2d");
      const tempCanvas = document.createElement("canvas");
      const tempContext = tempCanvas.getContext("2d");
      tempCanvas.width = baseImage.naturalWidth;
      tempCanvas.height = baseImage.naturalHeight;
      const positionX= (tempCanvas.width - canvas.width)/2;
      const positionY= (tempCanvas.height - canvas.height)/2;
    
      // Copy the image data to the temporary canvas
      tempContext.drawImage(canvas, positionX, positionY);
    
      // Get the image data from the temporary canvas
      const imageData = tempContext.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    
      // Iterate through each pixel of the image data
      for (let i = 0; i < imageData.data.length; i += 4) {
        const alpha = imageData.data[i + 3];
        // Check if the pixel is transparent
        if (alpha === 0) {
          // Change the color of the pixel to black
          imageData.data[i] = 0; // Red channel
          imageData.data[i + 1] = 0; // Green channel
          imageData.data[i + 2] = 0; // Blue channel
          // Set alpha to 255 (opaque)
          imageData.data[i + 3] = 255;
        }
      }
    
      // Put the modified image data back onto the temporary canvas
      tempContext.putImageData(imageData, 0, 0);
    
      // Log the modified image data as a data URL
      const modifiedDataURL = tempCanvas.toDataURL();
    
      // Update the state to indicate that the mask image is ready
      setismaskImage(true);
    
      // Convert data URL to Blob
      const finalData = dataURLtoBlob(modifiedDataURL);
    
      // Create a FormData object
      const formData = new FormData();
      formData.append("mask", finalData); // Use 'mask' as the key
    
      try {
        // Upload the mask to the server
        const response = await fetch(`${SERVER_URL}/upload_mask`, {
          method: "POST",
          body: formData, // Pass formData directly as the body
        });
        // console.log("Mask Uploaded");
        // Check if the upload was successful
        if (!response.ok) {
          throw new Error("Failed to upload mask to server");
        }
    
        // Parse response data
        const responseData = await response.json();
    
        // Return the URL of the uploaded image
        return responseData.url;
      } catch (error) {
        console.error("Error uploading mask:", error);
        throw error; // Rethrow the error for error handling
      }
    };
    
    
    
    
    
    useEffect(() => {
        // Check if all conditions are true to enable Generate button
        if (props.isBaseImg && isfurnitureImage && ismaskImage) {
          setIsGenerateEnabled(true);
        }
      }, [props.isBaseImg, isfurnitureImage, ismaskImage]);

    const uploadFurnitureImage= async (uploadedFiles) => {
      const fullfileUrl = uploadedFiles
      try{
        const response = await axios.post(`${SERVER_URL}/upload_furniture_url`, { furnitureUrl: fullfileUrl });
        setFurnitureImgUrl(fullfileUrl)
        // console.log('Image uploaded successfully:', response.data);
        setisfurnitureImage(true)
        
      } catch (error) {
        console.error('Error uploading image:', error);
        // Handle error
      }
    }

    const generateFinalImg = async () => {
      try {
        // Add a cache buster parameter to the GET request URL
        const timestamp = new Date().getTime();
        const response = await axios.get(`${SERVER_URL}/process_images?_=${timestamp}`);
        setGeneratedImageUrl(response.data);
        setForceRender(prevState => !prevState)
        // console.log(response.data);
      } catch (error) {
        console.error('Error generating final image:', error);
      }
    };
    

  const handleGenerateClick = () => {
      if (props.isBaseImg && isfurnitureImage && ismaskImage) {
          generateFinalImg();
      }
  };
  const clearCanvas = () => {
    // Get the canvas element
    const canvas = document.getElementById("editorCanvas");
    const context = canvas.getContext("2d");
  
    // Set canvas dimensions
    canvas.width = canvas.width;
  
    // Set all pixels' alpha values to 0 to make the canvas transparent
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i + 3] = 0; // Set alpha value to 0
    }
    context.putImageData(imageData, 0, 0);
    setDrawingPaths([])
  };
    

  return (
    <>
      {/* First Section: Upload Reference Image */}
      <div className='left-editor'>
        <h4>Upload Reference Image</h4>
        <UploadDropzone options={options}
              onComplete={files => uploadFurnitureImage(files.map(x => x.fileUrl).join("\n"))}
              width="90%"
              height="15rem" />
      </div>
      
      {/* Second Section: Display Uploaded Image */}
      <div className='center-editor'>
        <div className="operatorSection">
            <span style={{fontSize:"1.2rem"}}>Brush</span>
            <button className='brushBtn' onClick={dcrBrush}>-</button>
            <span className='show-brush-size'>{brushSize}</span>
            <button className='brushBtn' onClick={incBrush}>+</button>
            <button className='brushBtn' style={{width:"unset",padding:"0 1rem"}} onClick={clearCanvas}>Clear</button>
        </div>
        <div className="baseImageContainer">
            <img 
            src={props.baseImage} 
            ref={imageRef}
            style={{pointerEvents:"none",zIndex:"-1"}} 
            alt="Uploaded" 
            onLoad={setCanvas}
            id="baseImage" />
            <Canvas 
              imageUrl={props.baseImage}
              brushSize={brushSize} 
              drawingPaths={drawingPaths}
              setDrawingPaths={setDrawingPaths}
              width={imgdimensions.width} 
              height={imgdimensions.height}/>
        </div>
        <div className="center-bottom-btn">
        <button className='open-editor'id='getMaskBtn' onClick={handleGetMask}>Upload Mask</button>
        <button className='open-editor' id='GenerateImg' onClick={handleGenerateClick} disabled={!isGenerateEnabled} >Generate</button>
        </div>
      </div>

      {/* Third Section: Placeholder for Right Side */}
      <div className='right-editor'>
        <h2>Generated Image</h2>
        {/* You can place any content or image here */}
        {generatedImageUrl!=""?
        <img key={forceRender} src={generatedImageUrl} className='final-image' alt="Right side" />:
        <>
        <img src={noImage} alt="Right side" />
        <p>No Image Found</p>
        </>
        }
      </div>
    </>
  );
};

export default Editor;
