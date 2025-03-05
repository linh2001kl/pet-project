import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileUrls, setFileUrls] = useState({});

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Vui lòng chọn file trước khi upload!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5004/api/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setMessage(`✅ Upload thành công: ${response.data.fileUrl}`);
        showListFiles();
      } else {
        setMessage(`❌ Upload thất bại: ${response.data.message}`);
      }
    } catch (error) {
      setMessage(`❌ Lỗi hệ thống: ${error.message}`);
    }
  };

  const handleGetFileUrl = async (fileUrl) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5004/api/getFileUrl`, {
        params: { fileUrl },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.fileUrl;
    } catch (error) {
      console.error("Error fetching file URL", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = async (fileUrl) => {
    setLoading(true);
    const preFileUrl = await handleGetFileUrl(fileUrl);
    if (preFileUrl) {
      setFileUrls(preFileUrl);
      window.open(preFileUrl, "_blank"); // Mở file trong tab mới
    }
  };

  const handleDownloadFile = async (fileUrl) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5004/api/download", {
        params: { fileUrl },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // Important for downloading files
      });

      // Create a URL for the file and trigger a download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileUrl.split("/").pop());
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const showListFiles = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5004/api/listByUserEmail",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  useEffect(() => {
    showListFiles();
  }, []);

  useEffect(() => {
    const fetchFileUrls = async () => {
      const urls = {};
      for (const file of files) {
        const preFileUrl = await handleGetFileUrl(file.fileUrl);
        urls[file.postId] = preFileUrl;
      }
      setFileUrls(urls);
    };

    fetchFileUrls();
  }, [files]);
  return (
    <div>
      <h2>Welcome to Dashboard</h2>
      <button onClick={handleLogout}>Logout</button>

      <h2>Upload file</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {message && <p className="mt-3 text-sm">{message}</p>}

      <h2>List file uploaded</h2>
      <ul>
        {files.map((file) => (
          <li key={file.postId}>
            <button onClick={() => handleFileClick(file.fileUrl)}>
              {loading ? "Đang tải..." : file.fileName}
            </button>
          </li>
        ))}
      </ul>

      <h2>Show All Files</h2>
      {files.map((file) => {
        const fileType = file.fileName.split(".").pop().toLowerCase();
        const isImage = [
          "jpg",
          "jpeg",
          "png",
          "gif",
          "bmp",
          "webp",
          "tiff",
          "tif",
          "svg",
        ].includes(fileType);

        return (
          <div key={file.fileName} style={{ marginBottom: "10px" }}>
            <p>{file.fileName}</p>
            {isImage ? (
              <img
                src={fileUrls[file.postId]}
                alt="img"
                style={{ maxWidth: "200px", maxHeight: "200px" }}
              />
            ) : (
              <button onClick={() => handleDownloadFile(file.fileUrl)}>
                Tải xuống
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Dashboard;
