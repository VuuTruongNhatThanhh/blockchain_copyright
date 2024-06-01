import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import UserContract from '../abis/User.json';
import { useNavigate } from 'react-router-dom';
import './style/signup.css';


const SignUp = () => {
    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [citizenID, setCitizenID] = useState('');
    const [birthDay, setbirthDay] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState(0);
    const navigate = useNavigate();
   

    
   
    useEffect(() => {
        const initWeb3 = async () => {
            if (window.ethereum) {
                try {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const web3Instance = new Web3(window.ethereum);
                    setWeb3(web3Instance);

                    const networkId = await web3Instance.eth.net.getId();
                    const deployedNetwork = UserContract.networks[networkId];
                    const contractInstance = new web3Instance.eth.Contract(
                        UserContract.abi,
                        deployedNetwork && deployedNetwork.address
                    );
                    setContract(contractInstance);

                    const accs = await web3Instance.eth.getAccounts();
                    setAccounts(accs);
                } catch (error) {
                    console.error('Error initializing Web3: ', error);
                }
            }
        };
        initWeb3();
    }, []);

    const registerUser = async () => {
        try {
  
            const passwordHash = await contract.methods.hashPassword(password).call();
            // await contract.methods.registerUser(username, passwordHash, name, citizenID,birthDay,email, role).send({ from: accounts[0] });


    //         contract.methods.registerUser(username, passwordHash, name, citizenID, birthDay, email, role)
    //         .send({ from: accounts[0] }, function(error, transactionHash) {
    //           if (!error) {
    //                 alert('Đăng ký thành công. Vui lòng đợi trong giây lát...')
    //                        // Đặt hẹn giờ để chuyển hướng sau 8 giây
    //    setTimeout(() => {
    //     // Nếu tạo công việc thành công, chuyển hướng đến trang home
    //     navigate('/');
    //   }, 8000);
    //           } else {
    //             console.error('Lỗi khi đăng ký người dùng:', error);
    //             // Xử lý lỗi hoặc thực hiện các hành động phù hợp với nghiệp vụ của bạn
    //           }
    //         });


    contract.methods.registerUser(username, passwordHash, name, citizenID, birthDay, email, role)
  .send({ from: accounts[0] })
  .on('transactionHash', function(hash){
    console.log('Transaction hash:', hash);
    alert('Đăng ký tài khoản thành công');
  })
  .on('confirmation', function(confirmationNumber, receipt){
    if(confirmationNumber === 1) {
      console.log('Transaction confirmed');
    
        navigate('/');
      
    }
  })
  .on('error', function(error, receipt){
    console.error('Lỗi khi đăng ký người dùng:', error);
    // Xử lý khi gặp lỗi trong quá trình gửi hoặc xác nhận giao dịch
    // Xử lý lỗi hoặc thực hiện các hành động phù hợp với nghiệp vụ của bạn
  });

          



            console.log('User registered successfully!');
          
         
        } catch (error) {
            console.error('Error registering user: ', error);
            alert('Tên tài khoản đã tồn tại');
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-form-container">
                <h2 className="signup-heading">Đăng ký</h2>
                <div className="form-group">
                    <label htmlFor="username">Tên tài khoản:</label>
                    <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Mật khẩu:</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="name">Tên:</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="citizenID">Số CCCD:</label>
                    <input type="text" id="citizenID" value={citizenID} onChange={(e) => setCitizenID(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="birthDay">Ngày sinh:</label>
                    <input type="date" id="birthDay" value={birthDay} onChange={(e) => setbirthDay(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="text" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                {/* <div className="form-group">
                    <label htmlFor="role">Role:</label>
                    <input type="number" id="role" value={role} onChange={(e) => setRole(0)} />
                </div> */}
                <button className="signup-button" onClick={registerUser}>Đăng ký</button>
            </div>
        </div>
    );
};

export default SignUp;
