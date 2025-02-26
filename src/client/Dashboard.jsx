import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]); // Lưu file đã chọn vào state
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Vui lòng chọn file trước khi upload!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file); // Gửi file lên server

    try {
      const response = await fetch("http://localhost:5004/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`✅ Upload thành công: ${data.fileUrl}`);
      } else {
        setMessage(`❌ Upload thất bại: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Lỗi hệ thống: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Welcome to Dashboard</h2>
      <button onClick={handleLogout}>Logout</button>

      <h2>Upload file</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  );
}

export default Dashboard;
