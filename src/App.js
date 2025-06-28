import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

function TestCrop() {
  const [imageUrl, setImageUrl] = useState('');
  const [crop, setCrop] = useState({x:0,y:0});
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
    console.log('Cropped area:', croppedPixels);
  }, []);

  return (
    <>
      <input type="file" accept="image/*" onChange={e=>{
        const file = e.target.files[0];
        setImageUrl(URL.createObjectURL(file));
      }} />
      {imageUrl && (
        <div style={{width:400,height:300,position:'relative'}}>
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={4/3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
      )}
    </>
  );
}

export default TestCrop;
