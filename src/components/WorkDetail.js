import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Web3 from 'web3';
import createWorkArtifact from '../abis/Marketplace.json';
import UserContract from '../abis/User.json';
import './style/workdetail_user.css';
import QRCode from "qrcode.react";

const WorkDetail = () => {
    const { id } = useParams();
    const [work, setWork] = useState(null);
    const [username, setUsername] = useState(null); // Thêm state để lưu trữ username
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [logsPerPage, setLogsPerPage] = useState(5);
    useEffect(() => {
      const loadWorkDetail = async () => {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const networkId = await web3.eth.net.getId();
        const networkData = createWorkArtifact.networks[networkId];
        const networkData2 = UserContract.networks[networkId];
        const contract = new web3.eth.Contract(createWorkArtifact.abi, networkData.address);
        const contract2 = new web3.eth.Contract(UserContract.abi, networkData2.address);
        const result = await contract.methods.getWork(id).call();
        const workDetail = {
          id: result[0].toString(), // Chuyển đổi id thành chuỗi
          title: result[1],
          yearCreate: result[2].toString(), // Chuyển đổi yearCreate thành chuỗi
          describe: result[3],
          category: result[4],
          nameCreator: result[5],
          userId: result[7].toString()
        };
  
        setWork(workDetail);
        console.log('work detail:',workDetail);

         // Lấy tên người dùng dựa vào userID
         const userData = await contract2.methods.getUser(result[7]).call();
         setUsername(userData[1]); // Lưu trữ tên người dùng vào state
       
      };
  
      loadWorkDetail();
    }, [id]);

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

            if (processedLog.workId === parseInt(id)) { 
        tempLogs.push(processedLog);
      }
          }
          setLogs(tempLogs.reverse());
          setLoading(false);
        } catch (error) {
          console.error("Error loading logs:", error);
          alert("Failed to load logs. Please check the console for details.");
        }
      };
  
      loadLogs();
    }, []);
  
    if (!work) {
      return <p>Loading...</p>;
    }

   
  
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

    const qrCodeData = logs
    .filter(log => log.content.toLowerCase().includes('thành')  || log.content.toLowerCase().includes('nhượng'))
    
   
    .map((log) => `${log.timestamp}: ${log.content}`)
    .reverse()
    .join('\n');

    const countOccurrences = () => {
      const count = logs.filter(log =>
        log.content.toLowerCase().includes('thành') || log.content.toLowerCase().includes('nhượng')
      ).length;
      return count;
    };
    // console.log('countOccurrences', countOccurrences())
  
  
    return (
      <div>
      <div className="work-detail-container">
        <h2>{work.title}</h2>
        <p><strong>Tác giả:</strong> {work.nameCreator}</p>
        <p><strong>Năm sáng tác:</strong> {work.yearCreate}</p>
        <p><strong>Thể loại:</strong> {work.category}</p>
        <p><strong>Mô tả:</strong> {work.describe}</p>
        <p><strong>Tài khoản đăng ký:</strong>  {username}</p>
      
      
        <div className="qr-code-container">
          {/* <QRCode size={150} value={`Tên tác phẩm: ${work.title}, tác giả: ${work.nameCreator}, thể loại: ${work.category}, năm sáng tác: ${work.yearCreate}`} /> */}
          <QRCode size={200}  value={countOccurrences() === 0 ? `(Tác phẩm là bản gốc) \n ***Thông tin chi tiết: \n Tên tác phẩm: ${work.title}, tác giả: ${work.nameCreator}, năm sáng tác: ${work.yearCreate}, thể loại: ${work.category}` 
          : `(Tác phẩm đã bị thay đổi ${countOccurrences()} lần)\n ***Thông tin chi tiết: \n Tên tác phẩm: ${work.title}, tác giả: ${work.nameCreator}, năm sáng tác: ${work.yearCreate}, thể loại: ${work.category} \n ***Những thay đổi: \n${qrCodeData}`} />
        </div>
      </div>


      <div className="loglist-container">
      <h5 style={{ marginBottom: '23px' }}>Các dấu mốc của tác phẩm</h5>
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
            {/* <th>ID work</th> */}
          </tr>
        </thead>
        <tbody>
        {loading ? (
  <tr>
    <td colSpan="2">Loading...</td>
  </tr>
) : (
  logs
    
    .filter((log) =>
      log.content.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      log.sender.toLowerCase().includes(searchKeyword.toLowerCase())
    )
    .slice(indexOfFirstLog, indexOfLastLog) // Cắt mảng theo phân trang
    .map((log, index) => (
      <tr key={index}>
        <td>{log.timestamp}</td>
        <td>{log.content}</td>
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
      </div>
    );
  };
  
  export default WorkDetail;