import React, { useState, useEffect } from "react";
import Web3 from "web3";
import createWorkArtifact from "../../abis/Marketplace.json";
import '../style/loglist.css'
import { useNavigate, Link } from 'react-router-dom';
const LogList = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(5);

  useEffect(() => {
    const loadLogs = async () => {
      if (!window.ethereum) {
        alert("Please install MetaMask to interact with Ethereum");
        return;
      }

      const web3 = new Web3(window.ethereum);

      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const networkId = await web3.eth.net.getId();
        const networkData = createWorkArtifact.networks[networkId];
        const createWorkContract = new web3.eth.Contract(
          createWorkArtifact.abi,
          networkData.address
        );

        const logCount = await createWorkContract.methods.getLogsCount().call();
        let tempLogs = [];
        for (let i = 0; i < logCount; i++) {
          const log = await createWorkContract.methods.getLog(i).call();
          const date = new Date(log.timestamp * 1000);
          const formattedDate = `${("0" + date.getDate()).slice(-2)}/${("0" + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()} ${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}:${("0" + date.getSeconds()).slice(-2)} `;
          const processedLog = {
            id: parseInt(log.id),
            timestamp: formattedDate,
            content: log.content,
            sender: log.sender,
            workId: parseInt(log.workId) 
          };
          tempLogs.push(processedLog);
        }
        setLogs(tempLogs);
        setLoading(false);
      } catch (error) {
        console.error("Error loading logs:", error);
        alert("Failed to load logs. Please check the console for details.");
      }
    };

    loadLogs();
  }, []);

  const handleSearch = (e) => {
    setSearchKeyword(e.target.value);
    setCurrentPage(1); // Reset trang khi tìm kiếm
  };

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.filter(log =>
    log.content.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    log.sender.toLowerCase().includes(searchKeyword.toLowerCase())
  ).slice(indexOfFirstLog, indexOfLastLog);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="loglist-container">
      <h4 style={{ marginBottom: '23px' }}>Lịch sử người dùng</h4>
      <input
        type="text"
        placeholder="Tìm kiếm..."
        value={searchKeyword}
        onChange={handleSearch}
        style={{ width: '300px', height: '40px', marginBottom: '10px' }}
      />
      <table className="loglist-table">
        <thead>
          <tr>
            {/* <th>STT</th> */}
            <th>Thời gian</th>
            <th>Nội dung</th>
            {/* <th>Người thực hiện</th> */}
            <th>ID Tác phẩm</th>
          </tr>
        </thead>
        <tbody>
        {loading ? (
  <tr>
    <td colSpan="5">Loading...</td>
  </tr>
) : (
  logs
    .sort((a, b) => {
      // Sắp xếp ngược lại theo timestamp
      return new Date(b.timestamp) - new Date(a.timestamp);
    })
    .filter((log) =>
      log.content.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      log.sender.toLowerCase().includes(searchKeyword.toLowerCase())
    )
    .slice(indexOfFirstLog, indexOfLastLog) // Cắt mảng theo phân trang
    .map((log, index) => (
      <tr key={index}>
        {/* <td>{log.id}</td> */}
        <td>{log.timestamp}</td>
        <td>{log.content}</td>
        {/* <td>{log.sender}</td> */}
        <td><Link to={`/work-detail-admin/${log.workId}`}>{log.workId+1}</Link></td>
      </tr>
    ))
)}
        </tbody>
      </table>
      <ul  className="pagination" style={{ marginTop: '10px', justifyContent:'normal' }}>
        {Array.from({ length: Math.ceil(logs.filter(log =>
          log.content.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          log.sender.toLowerCase().includes(searchKeyword.toLowerCase())
        ).length / logsPerPage) }).map((_, index) => (
          <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
            <button onClick={() => paginate(index + 1)} className="page-link">{index + 1}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LogList;
