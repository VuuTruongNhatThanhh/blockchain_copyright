import React, { Component } from 'react';
import MarketplaceContract from '../abis/Marketplace.json'
import Web3 from 'web3';
import { Link } from "react-router-dom"; // Thêm dòng này
class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            idWork: '',
            marketplace: null,
            web3: null,
            works: [], // Lưu trữ thông tin về các work
            name2: '', // Lưu trữ giá trị name2 từ sessionStorage
            currentPage: 1,
            worksPerPage: 5,
            searchKeyword: ''
        };
      }

      async componentDidMount() {
        const { works } = this.props; // Nhận danh sách công việc từ props
        const { marketplace, products } = this.props;
        const path = window.location.pathname;
        const pathParts = path.split('/');
        const idWork = pathParts[pathParts.length - 1];
        this.setState({ idWork });
       // Lấy giá trị từ sessionStorage
    const name2 = sessionStorage.getItem('name');
    this.setState({ name2 });
    }

     // Hàm để chuyển đến trang mới
     paginate = (pageNumber) => this.setState({ currentPage: pageNumber });

     // Hàm xử lý tìm kiếm
     handleSearch = (e) => {
         this.setState({ searchKeyword: e.target.value.toLowerCase(), currentPage: 1 }); // Reset trang khi tìm kiếm
     };
 
     // Hàm để lấy danh sách công việc hiển thị tùy thuộc vào trang và từ khóa tìm kiếm
     getDisplayedWorks = () => {
         const { currentPage, worksPerPage, searchKeyword } = this.state;
         const { products, works } = this.props;
         const indexOfLastWork = currentPage * worksPerPage;
         const indexOfFirstWork = indexOfLastWork - worksPerPage;
 
         // Lọc danh sách sản phẩm dựa trên từ khóa tìm kiếm và trạng thái purchased
         const filteredProducts = products.filter(product =>
             !product.purchased &&
             works.find(work => parseInt(work.id) === parseInt(product.idWork))
         );
 
         // Lọc danh sách sản phẩm dựa trên từ khóa tìm kiếm
         const filteredWorks = filteredProducts.filter(product =>
             works.find(work =>
                 parseInt(work.id) === parseInt(product.idWork) &&
                 (work.title.toLowerCase().includes(searchKeyword) ||
                 work.nameCreator.toLowerCase().includes(searchKeyword))
             )
         );
 
         return filteredWorks.slice(indexOfFirstWork, indexOfLastWork);
     };
    
 // Hàm để chuyển trang sau 8 giây
 redirectToPage = (pageUrl) => {
    setTimeout(() => {
        window.location.href = pageUrl;
    }, 8000);
}
      
    
    
    
     render() {
        const { currentPage, worksPerPage, searchKeyword } = this.state;

    // Tính chỉ số của sản phẩm đầu tiên và cuối cùng trên trang hiện tại
    const indexOfLastProduct = currentPage * worksPerPage;
    const indexOfFirstProduct = indexOfLastProduct - worksPerPage;

    // Lọc danh sách sản phẩm dựa trên từ khóa tìm kiếm và trạng thái purchased
    const filteredProducts = this.props.products.filter(product =>
        !product.purchased &&
        this.props.works.find(work => parseInt(work.id) === parseInt(product.idWork))
    );

    // Lọc danh sách sản phẩm dựa trên từ khóa tìm kiếm
    const filteredWorks = filteredProducts.filter(product =>
        this.props.works.find(work =>
            parseInt(work.id) === parseInt(product.idWork) &&
            (work.title.toLowerCase().includes(searchKeyword) ||
            work.nameCreator.toLowerCase().includes(searchKeyword))
        )
    );

    // Lấy danh sách sản phẩm cho trang hiện tại dựa trên chỉ số tính toán
    const currentProducts = filteredWorks.slice(indexOfFirstProduct, indexOfLastProduct);

        return (
            <div style={{marginTop:'-10px'}} id="content">
                {/* <h4>Rao bán bản quyền</h4>
                
                <form onSubmit={(event) => {
                    event.preventDefault();
                    const name = this.productName.value;
                    const price = window.web3.utils.toWei(this.productPrice.value.toString(), 'Ether');
                    this.props.createProduct(name, price);
                }}>
                    <div style={{ marginTop: '20px' }} className="form-group mr-sm-2">
                        <p>Mã tác phẩm</p>
                        <input
                            id="productName"
                            type="text"
                            ref={(input) => { this.productName = input; }}
                            className="form-control"
                            value={this.state.idWork}
                            required disabled />
                    </div>
                    <div className="form-group mr-sm-2">
                        <input
                            id="productPrice"
                            type="text"
                            ref={(input) => { this.productPrice = input; }}
                            className="form-control"
                            placeholder="Giá chuyển nhượng quyền tác giả (ETH)"
                            required />
                    </div>
                    <button style={{ backgroundColor: '#4caf50', border: 'none' }} type="submit" className="btn btn-primary">Rao bán</button>
                </form>
                <p>&nbsp;</p> */}
                {/* Danh sách các bản quyền đang được rao bán */}
                <h2>Danh sách các bản quyền đang được rao bán</h2>
                <input 
                    style={{width:'50%'}}
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchKeyword}
                    onChange={(e) => this.setState({ searchKeyword: e.target.value.toLowerCase(), currentPage: 1 })}
                />
                <table className="table" style={{width:'150%'}}>
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Tên tác phẩm</th>
                            <th scope="col">Giá chuyển nhượng</th>
                            <th scope="col">Chủ sở hữu</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody id="productList">
                {/* Lặp qua danh sách sản phẩm của trang hiện tại */}
                {currentProducts.map((product, key) => {
                    // Tạo biến tạm để lưu trữ tên tác phẩm và tên tác giả
                    let productName = product.idWork.toString();
                    let nameCreator = '';
                    let userId = '';
                    // Tìm công việc có id trùng với idWork của product
                    const correspondingWork = this.props.works.find(work => parseInt(work.id) === parseInt(product.idWork));
                    // Nếu có công việc tương ứng, gán tên tác phẩm bằng work.title và tên tác giả
                    if (correspondingWork) {
                        userId = correspondingWork.userId;
                        productName = correspondingWork.title;
                        nameCreator = correspondingWork.nameCreator;
                    }
                    // Kiểm tra từ khóa tìm kiếm và trả về hàng nếu tìm thấy
                    if (productName.toLowerCase().includes(searchKeyword) || nameCreator.toLowerCase().includes(searchKeyword)) {
                        return (
                            <tr key={key}>
                                <th scope="row">{product.id.toString()}</th>
                                <td><Link to={`/work/${product.idWork}`}>{productName}</Link></td>
                                <td>{window.web3.utils.fromWei(product.price.toString(), 'Ether')} Eth</td>
                                <td><Link to={`/userdetail/${userId}`}>{nameCreator}</Link></td>
                                {/* Nút Mua */}
                                <td>
                                    {/* Kiểm tra nếu người dùng không phải là chủ sở hữu */}
                                    {this.state.name2 !== nameCreator && (
                                        <button
                                            name={product.id}
                                            value={product.price}
                                            onClick={(event) => {
                                                this.props.purchaseProduct(event.target.name, event.target.value);
                                                // this.redirectToPage('/market/0001');
                                            }}
                                        >
                                            Mua
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    } else {
                        return null; // Trả về null để ẩn hàng nếu không tìm thấy
                    }
                })}
            </tbody>
                </table>
               {/* Phân trang */}
               <ul style={{justifyContent:'normal'}} className="pagination">
                {Array.from({ length: Math.ceil(filteredWorks.length / worksPerPage) }).map((_, index) => (
                    <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                        <button onClick={() => this.setState({ currentPage: index + 1 })} className="page-link">{index + 1}</button>
                    </li>
                ))}
            </ul>
            </div>
        );
    }
    
}

export default Main;