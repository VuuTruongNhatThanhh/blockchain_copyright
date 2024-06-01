import React, { useState, useEffect } from "react";
import Web3 from "web3";
import createWorkArtifact from "../abis/Marketplace.json";
import './style/workinterface.css'
import { useNavigate } from 'react-router-dom'; // Import hook useNavigate

const WorkInterface = () => {
  const [title, setTitle] = useState("");
  const [yearCreate, setYearCreate] = useState(0);
  const [describe, setDescribe] = useState("");
  const [type, setType] = useState("");
  const [nameCreator, setNameCreator] = useState("");
  const [status, setStatus] = useState(0);
  const [userId, setUserId] = useState(0);
  const [name, setName] = useState('');
  const [username, setUserName] = useState('');

  useEffect(() => {
    // Lấy giá trị name từ sessionStorage khi component được tạo ra
    const storedName = sessionStorage.getItem('name');
    const storedUserName = sessionStorage.getItem('username');
    const storedIdUser = sessionStorage.getItem('userId');
    console.log('username', username);
    if (storedName) {
        setNameCreator(storedName);
    }
    if (storedUserName) {
      setUserName(storedUserName);
  }
  if (storedIdUser) {
    setUserId(storedIdUser);
}
console.log('userID',storedIdUser);
}, []);

  const navigate = useNavigate(); 


 


  

  const handleCreateWork = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to interact with Ethereum");
      return;
    }

    const web3 = new Web3(window.ethereum);

    try {
      // Request account access if needed
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();

      // Load the contract
      const networkId = await web3.eth.net.getId();
      const networkData = createWorkArtifact.networks[networkId];
      const createWorkContract = new web3.eth.Contract(
        createWorkArtifact.abi,
        networkData.address
      );

       // Calculate hash for the new work
      //  const newWorkHash = _calculateHash(title, yearCreate, describe, type);
      const newWorkHash = await createWorkContract.methods._calculateHash(title,describe, type,yearCreate  ).call();
      
        // Lấy danh sách các mã hash của các tác phẩm đã được tạo
      const existingHashes = await getExistingHashes(createWorkContract);
      
      // Kiểm tra xem newWorkHash có trong danh sách mã hash đã tồn tại không
      if (existingHashes.includes(newWorkHash)) {
        alert("Tác phẩm đã tồn tại");
        return;
      }else{


     
      
         
      
  
      
      
     
      // Call the createWork function of the smart contract
      // await createWorkContract.methods
      //   .createWork(title, yearCreate, describe, type, nameCreator,status, userId)
      //   .send({ from: accounts[0] });
       

  //     createWorkContract.methods
  // .createWork(title, yearCreate, describe, type, nameCreator, status, userId)
  // .send({ from: accounts[0] }, function(error, transactionHash) {
  //   if (!error) {
      
  //       navigate('/info-accept');
     
  //   } else {
  //     console.error('Lỗi khi tạo công việc:', error);
  //     // Xử lý lỗi hoặc thực hiện các hành động phù hợp với nghiệp vụ của bạn
  //   }
  // });

  createWorkContract.methods.createWork(
    title,
    yearCreate,
    describe,
    type,
    nameCreator,
    status,
    userId
  ).send({ from: accounts[0] })
  .on('transactionHash', function(hash){
    console.log('Transaction hash:', hash);
    alert('Tạo bản quyền tác phẩm thành công')
  })
  .on('confirmation', function(confirmationNumber, receipt){
    if(confirmationNumber === 1) {
      console.log('Transaction confirmed');
      navigate(`/user-profile/${userId}`);
    }
  })
  .on('error', function(error){
    console.error('Lỗi khi tạo công việc:', error);
    // Xử lý lỗi hoặc thực hiện các hành động phù hợp với nghiệp vụ của bạn
  });
  


  
  




      }

      
       

      
       
    } catch (error) {
      console.error("Error creating work:", error);
      alert("Failed to create work. Please check the console for details.");
    }
    
  };

  // Hàm để lấy danh sách các mã hash của các tác phẩm đã được tạo
const getExistingHashes = async (createWorkContract) => {
  const workCount = await createWorkContract.methods.getWorkCount().call();
  let hashes = [];
  for (let i = 0; i < workCount; i++) {
    const hash = await createWorkContract.methods.workHashes(i).call();
    hashes.push(hash);
  }
  return hashes;
};

return (
  <div style={{marginTop:'20px', marginBottom:'20px'}} className="container"> {/* Thêm class container */}
    <h2>Đăng ký bản quyền tác phẩm</h2>
    <label>Tên tác phẩm:</label>
    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
    <label>Mô tả:</label>
    <input type="text" value={describe} onChange={(e) => setDescribe(e.target.value)} />
    <label>Thể loại:</label>
    <select value={type} onChange={(e) => setType(e.target.value)}>
      <option disabled value="">---Chọn thể loại---</option>
      <option value="văn học">Văn học</option>
      <option value="truyện ngắn">Truyện ngắn</option>
      <option value="truyện dài">Truyện dài</option>
      <option value="tiểu thuyết">Tiểu thuyết</option>
      <option value="thơ">Thơ</option>
      <option value="kinh dị">Kinh dị</option>
      <option value="hài hước">Hài hước</option>
      <option value="lịch sử">Lịch sử</option>
    </select>
    <label>Năm sáng tác:</label>
    <input type="number" value={yearCreate} onChange={(e) => setYearCreate(e.target.value)} />
    <label>Tên tác giả:</label>
    <input disabled type="text" value={nameCreator} onChange={(e) => setNameCreator(e.target.value)} />
    {/* <label>Tài khoản đăng ký:</label>
    <input disabled type="text" value={username} onChange={(e) => setUserId(e.target.value)} /> */}
    <button onClick={handleCreateWork}>Đăng ký</button>
  </div>
);
};

export default WorkInterface;
