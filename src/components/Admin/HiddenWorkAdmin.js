import React, { useState, useEffect } from "react";
import Web3 from "web3";
import createWorkArtifact from "../../abis/Marketplace.json";
import QRCode from "qrcode.react";
import '../style/worklist.css'
import Header from '../Admin/Header2'; 
import { useNavigate, Link } from 'react-router-dom';
const CreateListAdmin = () => {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState(null);
  const [updatedWork, setUpdatedWork] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [worksPerPage, setWorksPerPage] = useState(5);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [totalCreateWorks, setTotalCreateWorks] = useState(0);
  const navigate = useNavigate()

  useEffect(() => {
    const role = sessionStorage.getItem('role');
    if (role === '0' || role === null) {
      alert("Bạn không có quyền truy cập trang này");
      navigate('/'); // Chuyển hướng về trang chủ hoặc trang đăng nhập
      return;
    }
    const loadWorks = async () => {
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

        const workCount = await createWorkContract.methods.getWorkCount().call();
        
        let tempWorks = [];
        let countStatus2 = 0; 
        for (let i = 0; i < workCount; i++) {
          const work = await createWorkContract.methods.works(i).call();
          const hash = await createWorkContract.methods.workHashes(i).call();
          const processedWork = {
            id: parseInt(work.id),
            title: work.title,
            yearCreate: parseInt(work.yearCreate),
            describe: work.describe,
            category: work.category,
            nameCreator: work.nameCreator,
            phone: parseInt(work.phone),
            price: parseInt(work.price),
            hash: hash,
            status: parseInt(work.status),
            userId: parseInt(work.userId)
          };

          if (processedWork.status === 2) { // Chỉ thêm vào danh sách nếu status là 0
            tempWorks.push(processedWork);
            countStatus2++;
            
            
          }
        
            sessionStorage.setItem('totalHiddenWorks', parseInt(countStatus2));
            

        }
        setWorks(tempWorks);
        
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading works:", error);
        alert("Failed to load works. Please check the console for details.");
      }
    };

    loadWorks();
  }, []);

 

const handleHiddenWork = async (work) => {
  if (!window.ethereum) {
    alert("Please install MetaMask to interact with Ethereum");
    return;
  }

  const web3 = new Web3(window.ethereum);

  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });

    const accounts = await web3.eth.getAccounts(); 
    
    const networkId = await web3.eth.net.getId();
    const networkData = createWorkArtifact.networks[networkId];
    const createWorkContract = new web3.eth.Contract(
      createWorkArtifact.abi,
      networkData.address
    );

    await createWorkContract.methods.updateWork(
      work.id,
      work.title,
      work.yearCreate,
      work.describe,
      work.category,
      work.nameCreator,
      work.phone,
      work.price,
      2, // Cập nhật status thành 3
      work.userId
    ).send({ from: accounts[0] });

    // Cập nhật lại danh sách tác phẩm sau khi cập nhật thành công
    const updatedWorks = works.map(item => {
      if (item.id === work.id) {
        return { ...item, status: 3 };
      }
      return item;
    });
    setWorks(updatedWorks);

    // Cập nhật selectedWork và updatedWork về null để đóng form chỉnh sửa
    setSelectedWork(null);
    setUpdatedWork(null);
  } catch (error) {
    console.error("Error updating work:", error);
    alert("Failed to update work. Please check the console for details.");
  }
};

  // Hàm xử lý phân trang
  const indexOfLastWork = currentPage * worksPerPage;
  const indexOfFirstWork = indexOfLastWork - worksPerPage;
  const currentWorks = works.slice(indexOfFirstWork, indexOfLastWork);

  // Hàm để chuyển đến trang mới
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Hàm xử lý tìm kiếm
  const filteredWorks = works.filter(work =>
    work.title.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  // Hàm xử lý tìm kiếm
const handleSearch = (e) => {
  const keyword = e.target.value.toLowerCase();
  setSearchKeyword(keyword);
  setCurrentPage(1); // Reset trang khi tìm kiếm
};

// Hàm để lấy danh sách công việc hiển thị tùy thuộc vào trang và từ khóa tìm kiếm
const getDisplayedWorks = () => {
  // Lọc danh sách công việc dựa trên từ khóa tìm kiếm
  const filteredWorks = works.filter(work =>
    work.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    work.nameCreator.toLowerCase().includes(searchKeyword.toLowerCase())
  );
  const indexOfLastWork = currentPage * worksPerPage;
  const indexOfFirstWork = indexOfLastWork - worksPerPage;
  return filteredWorks.slice(indexOfFirstWork, indexOfLastWork);
};
  

  const handleEdit = (work) => {
    setSelectedWork(work);
    setUpdatedWork({ ...work });
  };

  const handleUpdate = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to interact with Ethereum");
      return;
    }

    const web3 = new Web3(window.ethereum);

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const accounts = await web3.eth.getAccounts(); 
      
      const networkId = await web3.eth.net.getId();
      const networkData = createWorkArtifact.networks[networkId];
      const createWorkContract = new web3.eth.Contract(
        createWorkArtifact.abi,
        networkData.address
      );

      await createWorkContract.methods.updateWork(
        selectedWork.id,
        updatedWork.title,
        updatedWork.yearCreate,
        updatedWork.describe,
        updatedWork.category,
        updatedWork.nameCreator,
        updatedWork.phone,
        updatedWork.price,
        updatedWork.status,
        updatedWork.userId
      ).send({ from: accounts[0] });

      setSelectedWork(null);
      setUpdatedWork(null);
    } catch (error) {
      console.error("Error updating work:", error);
      alert("Failed to update work. Please check the console for details.");
    }
  };

   // Hàm để cập nhật status của tác phẩm khi được duyệt
const handleApproveWork = async (work) => {
  if (!window.ethereum) {
    alert("Please install MetaMask to interact with Ethereum");
    return;
  }

  const web3 = new Web3(window.ethereum);
 
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });

    const accounts = await web3.eth.getAccounts(); 
    
    const networkId = await web3.eth.net.getId();
    const networkData = createWorkArtifact.networks[networkId];
    const createWorkContract = new web3.eth.Contract(
      createWorkArtifact.abi,
      networkData.address
    );
    
    // await createWorkContract.methods.updateWork(
    //   work.id,
    //   work.title,
    //   work.yearCreate,
    //   work.describe,
    //   work.category,
    //   work.nameCreator,
    //   3, // Cập nhật status thành 3
    //   work.userId
    // ).send({ from: accounts[0] });


    createWorkContract.methods.updateWork(
      work.id,
      work.title,
      work.yearCreate,
      work.describe,
      work.category,
      work.nameCreator,
      3, // Cập nhật status thành 3
      work.userId
    ).send({ from: accounts[0] })
    .on('transactionHash', function(hash){
      console.log('Transaction hash:', hash);
      alert('Duyệt tác phẩm thành công');
    })
    .on('confirmation', function(confirmationNumber, receipt){
      if(confirmationNumber === 1) {
        console.log('Transaction confirmed');
        window.location.reload();
      }
    })
    .on('error', function(error){
      console.error('Error:', error);
      // Xử lý khi gặp lỗi
    });
    

    

    // Cập nhật lại danh sách tác phẩm sau khi cập nhật thành công
    // const updatedWorks = works.map(item => {
    //   if (item.id === work.id) {
    //     return { ...item, status: 3 };
    //   }
    //   return item;
    // });
    // setWorks(updatedWorks);

    // Cập nhật selectedWork và updatedWork về null để đóng form chỉnh sửa
    // setSelectedWork(null);
    // setUpdatedWork(null);
  } catch (error) {
    console.error("Error updating work:", error);
    alert("Failed to update work. Please check the console for details.");
  }
};

 // Render danh sách công việc
const renderWorks = () => {
  const workList = getDisplayedWorks();
  return workList.map((work, index) => (
    <tr key={index}>
      <td>{work.id + 1}</td>
      <td><Link to={`/work-detail-admin/${work.id}`}>{work.title}</Link></td>
      <td>{work.yearCreate}</td>
      <td>{work.category}</td>
      <td><Link to={`/user-detail-admin/${work.userId}`}>{work.nameCreator}</Link></td>
      {/* <td><QRCode style={{ fontSize: '10' }} size={60} value={`Tên tác phẩm: ${work.title}, tác giả: ${work.nameCreator}, thể loại: ${work.category}, năm sáng tác: ${work.yearCreate}`} /></td> */}
      {/* <td>
       
       <div style={{display:'flex', gap:'10px'}}> 
<button style={{height:'42px'}}  onClick={() => handleApproveWork(work)}>Duyệt</button>
<button style={{backgroundColor:'#d72727',height:'42px'}} onClick={() => handleHiddenWork(work)}>Ẩn</button>
</div>
      </td> */}
       <td>
        {/* <button onClick={() => handleEdit(work)}>Edit</button> */}
       <div style={{display:'flex', gap:'10px'}}> {/* // Khi người dùng ấn vào button "Duyệt", gọi hàm handleApproveWork và truyền thông tin của tác phẩm vào */}
<button style={{height:'42px'}}  onClick={() => handleApproveWork(work)}>Duyệt</button>
{/* <button style={{backgroundColor:'#d72727',height:'42px'}} onClick={() => handleHiddenWork(work)}>Ẩn</button> */}
</div>
      </td>
    </tr>
  ));
};

  return (
    <div className="worklist-container">
      <h4 style={{ marginBottom: '23px' }}>Các bản quyền bị ẩn</h4>
      <input
        type="text"
        placeholder="Tìm kiếm..."
        value={searchKeyword}
        onChange={handleSearch}
        style={{ width: '300px',height:'40px', marginBottom: '10px' }}
      />
      <table className="worklist-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên tác phẩm</th>
            <th>Năm sáng tác</th>
            <th>Thể loại</th>
            <th>Tên tác giả</th>
            <th>Chức năng</th>
            {/* <th>Chức năng</th> */}
          </tr>
        </thead>
        <tbody>
          {loading ? <tr><td colSpan="7">Loading...</td></tr> : renderWorks(currentWorks)}
        </tbody>
      </table>
      {/* Thêm phân trang */}
      <ul  className="pagination" style={{marginTop:'10px', justifyContent:'normal'}}>
        {Array.from({ length: Math.ceil(filteredWorks.length / worksPerPage) }).map((_, index) => (
          <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
            <button onClick={() => paginate(index + 1)} className="page-link">{index + 1}</button>
          </li>
        ))}
      </ul>
      {/* Truyền số lượng qua header */}
     
     
      {/* Thêm các điều khiển phân trang */}
      {selectedWork && (
        <div className="worklist-details">
          <h2>Edit Work</h2>
          <div>
            <label>Title:</label>
            <input
              type="text"
              value={updatedWork.title}
              onChange={(e) => setUpdatedWork({ ...updatedWork, title: e.target.value })}
            />
          </div>
          <div>
            <label>Year Created:</label>
            <input
              type="text"
              value={updatedWork.yearCreate}
              onChange={(e) => setUpdatedWork({ ...updatedWork, yearCreate: e.target.value })}
            />
          </div>
          <div>
            <label>Describe:</label>
            <input
              type="text"
              value={updatedWork.describe}
              onChange={(e) => setUpdatedWork({ ...updatedWork, describe: e.target.value })}
            />
          </div>
          <div>
            <label>Category:</label>
            <input
              type="text"
              value={updatedWork.category}
              onChange={(e) => setUpdatedWork({ ...updatedWork, category: e.target.value })}
            />
          </div>
          <div>
            <label>Name Creator:</label>
            <input
              type="text"
              value={updatedWork.nameCreator}
              onChange={(e) => setUpdatedWork({ ...updatedWork, nameCreator: e.target.value })}
            />
          </div>
          <div>
            <label>Phone:</label>
            <input
              type="text"
              value={updatedWork.phone}
              onChange={(e) => setUpdatedWork({ ...updatedWork, phone: e.target.value })}
            />
          </div>
          <div>
            <label>Price:</label>
            <input
              type="text"
              value={updatedWork.price}
              onChange={(e) => setUpdatedWork({ ...updatedWork, price: e.target.value })}
            />
          </div>
          <div>
            <label>Status:</label>
            <input
              type="text"
              value={updatedWork.status}
              onChange={(e) => setUpdatedWork({ ...updatedWork, status: 3 })}
            />
          </div>
          <button onClick={handleUpdate}>Update</button>
        </div>
      )}
    </div>
  );
};

export default CreateListAdmin;
