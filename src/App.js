import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import JSZip from 'jszip';

const aspectRatios = [
  { label: 'Tự do', value: null },
  { label: '1:1', value: 1 / 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
];

function App() {
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const imgs = files.map(f => ({ file: f, url: URL.createObjectURL(f), name: f.name }));
    setImages(imgs);
    setSelected(new Array(imgs.length).fill(false));
    setSelectedIndex(0);
    setPreviewUrl(null);
  };

  const toggleSelect = i => {
    const sel = [...selected];
    sel[i] = !sel[i];
    setSelected(sel);
  };

  const handleClickImage = i => {
    setSelectedIndex(i);
    setPreviewUrl(null);
  };

  const selectAll = (value) => {
    setSelected(new Array(images.length).fill(value));
    setPreviewUrl(null);
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handlePreview = async () => {
    if (!images[selectedIndex]) return;
    const imgObj = images[selectedIndex];
    const img = new Image();
    img.src = imgObj.url;
    await new Promise(res => (img.onload = res));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const { width, height, x, y } = croppedAreaPixels;
    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
    setPreviewUrl(canvas.toDataURL('image/jpeg'));
  };

  const handleCropAll = async () => {
    const zip = new JSZip();
    for (let i = 0; i < images.length; i++) {
      if (!selected[i]) continue;
      const img = new Image();
      img.src = images[i].url;
      await new Promise(res => (img.onload = res));

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const { width, height, x, y } = croppedAreaPixels;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
      const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg'));
      zip.file(images[i].name, blob);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'cropped_images.zip';
    link.click();
  };

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: 'auto' }}>
      <h1>🖼 Crop ảnh với tỉ lệ tùy chọn + preview tức thời</h1>
      <input type="file" multiple accept="image/*" onChange={handleFileChange} />

      {images.length > 0 && (
        <>
          <div style={{ marginTop: 10 }}>
            <button onClick={() => selectAll(true)}>Chọn tất cả</button>
            <button onClick={() => selectAll(false)} style={{ marginLeft: 10 }}>Bỏ chọn tất cả</button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 10 }}>
            {images.map((img, i) => (
              <div
                key={i}
                onClick={() => handleClickImage(i)}
                style={{
                  margin: 5,
                  border: selectedIndex === i ? '2px solid #0070f3' : '1px solid #ccc',
                  padding: 5,
                  cursor: 'pointer'
                }}
              >
                <img src={img.url} alt="" style={{ width: 100, height: 100, objectFit: 'cover' }} />
                <div>
                  <label>
                    <input type="checkbox" checked={selected[i]} onChange={() => toggleSelect(i)} /> Chọn
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20 }}>
            <h3>🖱 Crop ảnh (click vào ảnh bên trên để chọn):</h3>
            <div style={{ marginBottom: 10 }}>
              Tỉ lệ crop:{" "}
              {aspectRatios.map(r => (
                <button
                  key={r.label}
                  onClick={() => setAspect(r.value)}
                  style={{
                    marginRight: 5,
                    background: r.value === aspect ? '#0070f3' : '#eee',
                    color: r.value === aspect ? 'white' : 'black',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: 4
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', width: 500, height: 400, background: '#333' }}>
              <Cropper
                image={images[selectedIndex]?.url}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <p style={{ marginTop: 10 }}>Toạ độ crop: {croppedAreaPixels ? JSON.stringify(croppedAreaPixels) : 'Chưa có'}</p>
            <button onClick={handlePreview} style={{ marginTop: 10 }}>🔍 Xem Preview</button>
            {previewUrl && (
              <div style={{ marginTop: 10 }}>
                <p>Ảnh preview:</p>
                <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', border: '1px solid #ccc' }} />
              </div>
            )}
            <button onClick={handleCropAll} style={{ marginTop: 20, padding: '10px 20px', background: '#0070f3', color: 'white', border: 'none', borderRadius: 4 }}>
              🚀 Crop và tải về ảnh đã chọn
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
