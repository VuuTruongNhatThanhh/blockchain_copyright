import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Web3 from 'web3';
import UserContract from '../abis/User.json';
import MarketplaceContract from '../abis/Marketplace.json';
import './style/userprofile.css';

const UserProfile = () => {
    const formatBirthYear = (birthYear) => {
        const [year, month, day] = birthYear.split('-');
        return `${day}-${month}-${year}`;
      };
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [works, setWorks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [worksPerPage] = useState(5);
    const [searchKeyword, setSearchKeyword] = useState('');

  
  const [selectedWork, setSelectedWork] = useState(null);
  const [updatedWork, setUpdatedWork] = useState(null);
  const [hasProductWithIdWorkAndNotPurchased, setHasProductWithIdWorkAndNotPurchased] = useState({});
  const [cancelSellWorkId, setCancelSellWorkId] = useState(null);
  const [marketplaceContract, setMarketplaceContract] = useState(null);

    useEffect(() => {
        const loadUserDetail = async () => {
            if (!window.ethereum) {
                alert("Please install MetaMask to interact with Ethereum");
                return;
            }

            const web3 = new Web3(window.ethereum);
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const networkId = await web3.eth.net.getId();
            const networkData = UserContract.networks[networkId];
            const marketplaceContractData = MarketplaceContract.networks[networkId];
            const contract = new web3.eth.Contract(UserContract.abi, networkData.address);
            const marketplaceContract = new web3.eth.Contract(MarketplaceContract.abi, marketplaceContractData.address);
            setMarketplaceContract(marketplaceContract);
            try {
                const result = await contract.methods.getUser(userId).call();
                const userDetail = {
                    username: result[1],
                    name: result[3],
                    citizenID: result[4],
                    birthDay: result[6],
                    email: result[7],
                    role: result[5]
                };
                setUser(userDetail);
                let tempWorks = [];
                const userWorks = await marketplaceContract.methods.getWorksByUserId(userId).call();
                const processedWorks = userWorks.map(work => ({
                    id: parseInt(work.id),
                    title: work.title,
                    yearCreate: parseInt(work.yearCreate),
                    describe: work.describe,
                    category: work.category,
                    nameCreator: work.nameCreator,
                    status: parseInt(work.status),
                    userId: parseInt(work.userId)
                }));
                
                setWorks(processedWorks);
                const hasProduct = await Promise.all(processedWorks.map(work =>
                  marketplaceContract.methods.hasProductWithIdWorkAndNotPurchased(work.id).call()
              ));
              const hasProductMap = {};
              processedWorks.forEach((work, index) => {
                  hasProductMap[work.id] = hasProduct[index];
              });
              setHasProductWithIdWorkAndNotPurchased(hasProductMap);
                setLoading(false);
            } catch (error) {
                console.error("Error loading user detail:", error);
                alert("Failed to load user detail. Please check the console for details.");
                setLoading(false);
            }
        };

        loadUserDetail();
    }, [userId]);

    const indexOfLastWork = currentPage * worksPerPage;
    const indexOfFirstWork = indexOfLastWork - worksPerPage;
    const currentWorks = works.slice(indexOfFirstWork, indexOfLastWork);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleSearch = (e) => {
        const keyword = e.target.value.toLowerCase();
        setSearchKeyword(keyword);
      };

      const getDisplayedWorks = () => {
        const filteredWorks = works.filter(work =>
            work.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            work.nameCreator.toLowerCase().includes(searchKeyword.toLowerCase())
        );
        return filteredWorks.slice(indexOfFirstWork, indexOfLastWork);
    };

       const filteredWorks = works.filter(work =>
        work.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        work.nameCreator.toLowerCase().includes(searchKeyword.toLowerCase())
    );

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
          const networkData = MarketplaceContract.networks[networkId];
          const MarketplaceContract2 = new web3.eth.Contract(
            MarketplaceContract.abi,
            networkData.address
          );
         
          // await MarketplaceContract2.methods.updateWork(
          //   selectedWork.id,
          //   updatedWork.title,
          //   updatedWork.yearCreate,
          //   updatedWork.describe,
          //   updatedWork.category,
          //   updatedWork.nameCreator,
          //   1,
          //   updatedWork.userId
          // ).send({ from: accounts[0] });



          // MarketplaceContract2.methods.updateWork(
          //   selectedWork.id,
          //   updatedWork.title,
          //   updatedWork.yearCreate,
          //   updatedWork.describe,
          //   updatedWork.category,
          //   updatedWork.nameCreator,
          //   1,
          //   updatedWork.userId
          // ).send({ from: accounts[0] }, function(error, transactionHash) {
          //   if (!error) {
          //     alert('Chỉnh sửa thông tin tác phẩm thành công, vui lòng chờ trong giây lát...')
          //     setTimeout(() => {
          //       window.location.reload();
          //     }, 8000);
          //   } else {
          //     console.log('Giao dịch gặp lỗi:', transactionHash);
          //     // Xử lý khi giao dịch thành công ở đây
          //   }
          // });


          MarketplaceContract2.methods.updateWork(
            selectedWork.id,
            updatedWork.title,
            updatedWork.yearCreate,
            updatedWork.describe,
            updatedWork.category,
            updatedWork.nameCreator,
            1,
            updatedWork.userId
          ).send({ from: accounts[0] })
          .on('transactionHash', function(hash){
            console.log('Transaction hash:', hash);
            alert('Chỉnh sửa thông tin tác phẩm thành công');
          })
          .on('confirmation', function(confirmationNumber, receipt){
            if(confirmationNumber === 1) {
              console.log('Transaction confirmed');
              
                window.location.reload();
           
            }
          })
          .on('error', function(error, receipt){
            console.error('Giao dịch gặp lỗi:', error);
            // Xử lý khi gặp lỗi trong quá trình gửi hoặc xác nhận giao dịch
          });
          
          
    
          // setSelectedWork(null);
          // setUpdatedWork(null);
        } catch (error) {
          console.error("Error updating work:", error);
          alert("Failed to update work. Please check the console for details.");
        }
      };

          // Hàm xử lý sự kiện khi nhấn vào nút "Hủy rao bán"
    const handleCancelSell = async (workId) => {
      try {
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts(); 
          // Gọi hàm markProductsAsPurchased từ smart contract
          
          // await marketplaceContract.methods.markProductsAsPurchased(workId).send({ from: accounts[0] });

          // marketplaceContract.methods.markProductsAsPurchased(workId).send({ from: accounts[0] }, function(error, transactionHash) {
          //   if (!error) {
          //     alert('Hủy rao bán bản quyền thành công, vui lòng chờ trong giây lát...')
          //     setTimeout(() => {
          //       window.location.reload();
          //     }, 8000);
          //   } else {
          //     console.log('Giao dịch gặp lỗi:', transactionHash);
          //     // Xử lý khi giao dịch thành công ở đây
          //   }
          // });


          marketplaceContract.methods.markProductsAsPurchased(workId).send({ from: accounts[0] })
.on('transactionHash', function(hash){
  console.log('Transaction hash:', hash);
  alert('Hủy rao bán bản quyền thành công');
})
.on('confirmation', function(confirmationNumber, receipt){
  if(confirmationNumber === 1) {
    console.log('Transaction confirmed');
   
      window.location.reload();
    
  }
})
.on('error', function(error, receipt){
  console.error('Giao dịch gặp lỗi:', error);
  // Xử lý khi gặp lỗi trong quá trình gửi hoặc xác nhận giao dịch
  // Xử lý lỗi hoặc thực hiện các hành động phù hợp với nghiệp vụ của bạn
});

          

          // Cập nhật state hoặc thực hiện các hành động khác nếu cần
      } catch (error) {
          console.error("Error cancelling sell:", error);
          alert("Failed to cancel sell. Please check the console for details.");
      }
  };

  
    

    return (
        <div className="user-detail-container">
            {loading ? (
                <div className="loading">Loading user detail...</div>
            ) : !user ? (
                <div className="user-not-found">User not found</div>
            ) : (
                <>
                    <h2>{user.name}</h2>
                    <p><strong>Tên tài khoản:</strong> {user.username}</p>
                    <p><strong>Số CCCD:</strong> {user.citizenID}</p>
                    <p><strong>Ngày sinh:</strong> {formatBirthYear(user.birthDay)}</p>
                    <p><strong>Email:</strong> {user.email}</p>

                    <div style={{marginTop:'50px'}}>
                        <h5>Các tác phẩm đã tạo</h5>
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchKeyword}
                            onChange={handleSearch} style={{width:'40%'}}
                        />
                        <table>
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Tên tác phẩm</th>
                                    <th>Năm sáng tác</th>
                                    <th>Thể loại</th>
                                    {/* <th>Tên tác giả</th> */}
                                    <th>Tình trạng</th>
                                    <th>Chức năng</th>
                                </tr>
                            </thead>
                            <tbody>
                            {getDisplayedWorks().map((work, index) => (
  <tr key={index}>
    <td>{work.id+1}</td>
    <td><Link to={`/work/${work.id}`}>{work.title}</Link></td>
    <td>{work.yearCreate}</td>
    <td>{work.category}</td>
    {/* <td>{work.nameCreator}</td> */}
    <td className={work.status === 0 ? "waiting-approval" : work.status === 1 ? "waiting-update" : work.status === 2 ? "hidden" : work.status === 3 ? "approved" : ""}>
  {work.status === 0 && "Chờ duyệt..."}
  {work.status === 1 && "Chờ duyệt cập nhật..."}
  {work.status === 2 && "Bị ẩn"}
  {work.status === 3 && "Đã được duyệt"}
</td>
 
<td>
    {work.status === 3 && (
        <>
            <button onClick={() => handleEdit(work)}>Chỉnh sửa</button>
            {!hasProductWithIdWorkAndNotPurchased[work.id] ? (
                <button style={{ marginLeft: '10px', backgroundColor: '#008CBA' }}>
                    <Link style={{ color: 'white' }} to={`/transaction/${work.id}`}>
                        Rao bán bản quyền
                    </Link>
                </button>
            ) : (
                <button style={{ marginLeft: '10px', backgroundColor: 'red' }}   onClick={() => handleCancelSell(work.id)}>
                    Hủy rao bán
                </button>
            )}
        </>
    )}
</td>
       
  </tr>
))}
                            </tbody>
                        </table>
                        <ul style={{justifyContent:'normal'}} className="pagination">
                            {Array.from({ length: Math.ceil(filteredWorks.length / worksPerPage) }).map((_, index) => (
                                <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                    <button onClick={() => paginate(index + 1)} className="page-link">{index + 1}</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}

               {/* Thêm các điều khiển phân trang */}
      {selectedWork && (
        <div className="worklist-details">
          <h2>Chỉnh sửa tác phẩm</h2>
          <div>
            <label>Tên tác phẩm:</label>
            <input
              type="text"
              value={updatedWork.title}
              onChange={(e) => setUpdatedWork({ ...updatedWork, title: e.target.value })}
            />
          </div>
          <div>
            <label>Năm sáng tác:</label>
            <input
              type="text"
              value={updatedWork.yearCreate}
              onChange={(e) => setUpdatedWork({ ...updatedWork, yearCreate: e.target.value })}
            />
          </div>
          <div>
            <label>Mô tả:</label>
            <input
              type="text"
              value={updatedWork.describe}
              onChange={(e) => setUpdatedWork({ ...updatedWork, describe: e.target.value })}
            />
          </div>
          <div>
  <label>Thể loại:</label>
  <select
    value={updatedWork.category}
    onChange={(e) => setUpdatedWork({ ...updatedWork, category: e.target.value })}
  >
   <option disabled value="">---Chọn thể loại---</option>
      <option value="văn học">Văn học</option>
      <option value="truyện ngắn">Truyện ngắn</option>
      <option value="truyện dài">Truyện dài</option>
      <option value="tiểu thuyết">Tiểu thuyết</option>
      <option value="thơ">Thơ</option>
      <option value="kinh dị">Kinh dị</option>
      <option value="hài hước">Hài hước</option>
      <option value="lịch sử">Lịch sử</option>
    {/* Thêm các tùy chọn khác nếu cần */}
  </select>
</div>
          {/* <div>
            <label>Name Creator:</label>
            <input
              type="text"
              value={updatedWork.nameCreator}
              onChange={(e) => setUpdatedWork({ ...updatedWork, nameCreator: e.target.value })}
            />
          </div> */}
          {/* <div>
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
          </div> */}
          <button onClick={handleUpdate}>Cập nhật</button>
        </div>
      )}
        </div>
    );
};

export default UserProfile;
