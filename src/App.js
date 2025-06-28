import React, { useState } from 'react';
import JSZip from 'jszip';

function App() {
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState([]);
  const [cropData, setCropData] = useState({ top: 0, bottom: 0, left: 0, right: 0 });
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const imgs = files.map(f => ({ file: f, url: URL.createObjectURL(f), name: f.name }));
    setImages(imgs);
    setSelected(new Array(imgs.length).fill(false));
    setPreviewUrl(null);
  };

  const toggleSelect = (i) => {
    const sel = [...selected];
    sel[i] = !sel[i];
    setSelected(sel);
    setPreviewUrl(null);
  };

  const selectAll = (value) => {
    setSelected(new Array(images.length).fill(value));
    setPreviewUrl(null);
  };

  const handlePreview = async () => {
    const firstSelectedIndex = selected.findIndex(x => x);
    if (firstSelectedIndex === -1) {
      alert("Bạn cần chọn ít nhất một ảnh để xem preview.");
      return;
    }

    const imgObj = images[firstSelectedIndex];
    const img = new Image();
    img.src = imgObj.url;
    await new Promise(res => (img.onload = res));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const { top, bottom, left, right } = cropData;
    const w = img.width - left - right;
    const h = img.height - top - bottom;
    canvas.width = w;
    canvas.height = h;

    ctx.drawImage(img, left, top, w, h, 0, 0, w, h);
    setPreviewUrl(canvas.toDataURL('image/jpeg'));
  };

  const handleCrop = async () => {
    const zip = new JSZip();
    for (let i = 0; i < images.length; i++) {
      if (!selected[i]) continue;

      const img = new Image();
      img.src = images[i].url;
      await new Promise(res => (img.onload = res));

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const { top, bottom, left, right } = cropData;
      const w = img.width - left - right;
      const h = img.height - top - bottom;
      canvas.width = w;
      canvas.height = h;

      ctx.drawImage(img, left, top, w, h, 0, 0, w, h);

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
      <h1>🖼 Ứng dụng Crop Ảnh Hàng Loạt</h1>
      <input type="file" multiple accept="image/*" onChange={handleFileChange} />

      {images.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <button onClick={() => selectAll(true)}>Chọn tất cả</button>
          <button onClick={() => selectAll(false)} style={{ marginLeft: 10 }}>Bỏ chọn tất cả</button>
        </div>
      )}

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

      {images.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>🔧 Nhập thông số crop (px):</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {["top", "bottom", "left", "right"].map(side => (
              <label key={side}>
                {side}: <input type="number" value={cropData[side]} onChange={e => setCropData({ ...cropData, [side]: +e.target.value || 0 })} />
              </label>
            ))}
          </div>

          <button onClick={handlePreview} style={{ marginTop: 10 }}>🔍 Xem preview crop</button>
          {previewUrl && (
            <div style={{ marginTop: 10 }}>
              <p>Ảnh preview sau khi crop:</p>
              <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', border: '1px solid #ccc' }} />
            </div>
          )}

          <button onClick={handleCrop} style={{ marginTop: 20, padding: '10px 20px', background: '#0070f3', color: 'white', border: 'none', borderRadius: 4 }}>
            🚀 Crop và Tải về ảnh đã chọn
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
