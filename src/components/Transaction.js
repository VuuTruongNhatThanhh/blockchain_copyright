import React, { Component } from 'react';
import Web3 from 'web3'
import logo from '../logo.png';
import './App.css';
import Marketplace from '../abis/Marketplace.json'
import Navbar from './Navbar'
import Main from './Main'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = Marketplace.networks[networkId]
    if(networkData) {
      const marketplace = web3.eth.Contract(Marketplace.abi, networkData.address)
      this.setState({ marketplace })
      const productCount = await marketplace.methods.productCount().call()
      const workCount = await marketplace.methods.getWorkCount().call()
      this.setState({ productCount })
      this.setState({ workCount })
      // Load products
      const products = [];
      const works = [];
      let tempWorks = [];
      for (var i = 1; i <= productCount; i++) {
        const product = await marketplace.methods.products(i).call()
        products.push(product);

       
      }
      for (let i = 0; i < workCount; i++) {
        const work = await marketplace.methods.works(i).call();
        const hash = await marketplace.methods.workHashes(i).call();
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
        
          tempWorks.push(processedWork);
        
      }
    
      this.setState({ products, tempWorks, loading: false})
    } else {
      window.alert('Marketplace contract not deployed to detected network.')
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      productCount: 0,
      workCount: 0,
      products: [],
      tempWorks: [], 
      loading: true
    }

    this.createProduct = this.createProduct.bind(this)
    this.purchaseProduct = this.purchaseProduct.bind(this)
  
  }

  // createProduct(name, price) {
  //   this.setState({ loading: true })
  //   this.state.marketplace.methods.createProduct(name, price).send({ from: this.state.account })
  //   .once('receipt', (receipt) => {
  //     this.setState({ loading: false })
  //   })
  // }

//   createProduct(name, price) {
//     // this.setState({ loading: true });
//     this.state.marketplace.methods.createProduct(name, price).send({ from: this.state.account })
//     .on('transactionHash', (hash) => {
//         // Xử lý sau khi giao dịch được gửi thành công
        
//         setTimeout(() => {
//           // Chuyển hướng sau 8 giây
//           window.location.href='/market/0000';
//       }, 8000);
//     })
//     .on('error', (error, receipt) => {
//         // Xử lý khi gặp lỗi trong quá trình gửi hoặc xác nhận giao dịch
//         console.error('Lỗi khi giao dịch:', error);
//         // Xử lý lỗi hoặc thực hiện các hành động phù hợp với nghiệp vụ của bạn
//         this.setState({ loading: false });
//     });
// }

createProduct(name, price) {
  this.state.marketplace.methods.createProduct(name, price)
    .send({ from: this.state.account })
    .on('transactionHash', (hash) => {
      console.log('Transaction hash:', hash);
      // Xử lý sau khi giao dịch được gửi thành công
     alert('Rao bán bản quyền thành công')
       
     
    })
    .on('confirmation', (confirmationNumber, receipt) => {
      if (confirmationNumber === 1) {
        console.log('Transaction confirmed');
        window.location.href = '/market/0000';
      }
    })
    .on('error', (error, receipt) => {
      console.error('Lỗi khi giao dịch:', error);
      // Xử lý khi gặp lỗi trong quá trình gửi hoặc xác nhận giao dịch
      // Xử lý lỗi hoặc thực hiện các hành động phù hợp với nghiệp vụ của bạn
      // this.setState({ loading: false });
    });
}



  purchaseProduct(id, price) {
    const userId = sessionStorage.getItem('userId');
    const nameCreator = sessionStorage.getItem('name');
    this.setState({ loading: true })
    this.state.marketplace.methods.purchaseProduct(id, userId, nameCreator).send({ from: this.state.account, value: price })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

 

 

  

  render() {
    return (
      <div>
        {/* <Navbar account={this.state.account} /> */}
        <div className="container-fluid mt-5">
          <div className="row">
            <main style={{marginTop:'-22px'}} role="main" className="col-lg-12 d-flex">
              { this.state.loading
                ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                : <Main
               
                  products={this.state.products}
                  createProduct={this.createProduct}
                  purchaseProduct={this.purchaseProduct}
                  works={this.state.tempWorks}
                  marketplace={this.state.marketplace} 
                   />
              }
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;