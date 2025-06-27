import React, { useState } from 'react';
import JSZip from 'jszip';

function App() {
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState([]);
  const [cropData, setCropData] = useState({ top: 0, bottom: 0, left: 0, right: 0 });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files.map(f => ({ file: f, url: URL.createObjectURL(f), name: f.name })));
    setSelected(new Array(files.length).fill(false));
  };

  const toggleSelect = i => {
    const sel = [...selected];
    sel[i] = !sel[i];
    setSelected(sel);
  };

  const handleCrop = async () => {
    const zip = new JSZip();
    for (let i = 0; i < images.length; i++) {
      if (!selected[i]) continue;
      const img = new Image();
      img.src = images[i].url;
      await new Promise(r => img.onload = r);

      const c = document.createElement('canvas');
      const ctx = c.getContext('2d');
      const { top, bottom, left, right } = cropData;
      const w = img.width - left - right;
      const h = img.height - top - bottom;
      c.width = w; c.height = h;
      ctx.drawImage(img, left, top, w, h, 0, 0, w, h);

      const blob = await new Promise(r => c.toBlob(r, 'image/jpeg'));
      zip.file(images[i].name, blob);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'cropped_images.zip';
    link.click();
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: 'auto' }}>
      <h1>Ứng dụng Crop Ảnh Hàng Loạt</h1>
      <input type="file" multiple accept="image/*" onChange={handleFileChange} />

      <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 10 }}>
        {images.map((img, i) => (
          <div key={i} style={{ margin: 5, border: '1px solid #ccc', padding: 5 }}>
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
        <div>Crop top: <input type="number" value={cropData.top} onChange={e => setCropData({ ...cropData, top: +e.target.value })} /></div>
        <div>Crop bottom: <input type="number" value={cropData.bottom} onChange={e => setCropData({ ...cropData, bottom: +e.target.value })} /></div>
        <div>Crop left: <input type="number" value={cropData.left} onChange={e => setCropData({ ...cropData, left: +e.target.value })} /></div>
        <div>Crop right: <input type="number" value={cropData.right} onChange={e => setCropData({ ...cropData, right: +e.target.value })} /></div>
      </div>

      <button onClick={handleCrop} style={{ marginTop: 20, padding: '10px 20px', background: '#0070f3', color: 'white', border: 'none', borderRadius: 4 }}>
        Crop và Tải về ảnh đã chọn
      </button>
    </div>
  );
}

export default App;
