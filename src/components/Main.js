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
            <div id="content" >
                <h4>Rao bán bản quyền</h4>
                {/* Form rao bán bản quyền */}
                <form style={{width:'190%'}} onSubmit={(event) => {
                    event.preventDefault();
                    const name = this.productName.value;
                    const price = window.web3.utils.toWei(this.productPrice.value.toString(), 'Ether');
                    this.props.createProduct(name, price);
                    // this.redirectToPage('/market/0000');
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
                    <p>Giá chuyển nhượng (ETH)</p>
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
                <p>&nbsp;</p>
                {/* Danh sách các bản quyền đang được rao bán */}
             
            </div>
        );
    }
    
}

export default Main;