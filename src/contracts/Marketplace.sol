pragma solidity ^0.5.0;

pragma experimental ABIEncoderV2;




contract Marketplace {
    struct Work {
        uint id;
        string title;
        uint yearCreate;
        string describe;
        string category;
        string nameCreator;
        uint status;
        uint userId;
    }

     struct Log {
        uint id;
        uint timestamp;
        string content;
        string sender;
        uint workId;
    }

    mapping(uint => bytes32) public workHashes;
    Work[] public works;
    uint public workCount;

     Log[] public logs;
    uint public logCount;

    event WorkCreated(uint indexed id, string title, uint yearCreate, string describe, string category, string nameCreator, uint status, uint userId);
    event WorkUpdated(uint indexed id, string title, uint yearCreate, string describe, string category, string nameCreator, uint status, uint userId);
    event LogAdded(uint indexed id, uint indexed timestamp, string content, string sender, uint workId);

    function createWork(string memory _title, uint _yearCreate, string memory _describe, string memory _category, string memory _nameCreator, uint _status, uint _userId) public {
        works.push(Work(workCount, _title, _yearCreate, _describe, _category, _nameCreator, _status, _userId));
       
         bytes32 hash = _calculateHash(_title, _describe, _category, _yearCreate);
        workHashes[workCount] = hash;

        emit WorkCreated(workCount, _title, _yearCreate, _describe, _category, _nameCreator, _status, _userId);
        

         // Add log for work creation
        string memory logContent = string(abi.encodePacked(
        "Tác phẩm được tạo với tựa đề: ", _title,
        ", năm sáng tác: ", uint2str(_yearCreate), // Chuyển đổi uint sang string
        ", mô tả: ", _describe,
        ", thể loại: ", _category,
        ", tên tác giả: ", _nameCreator
));
        _addLog(logContent, _nameCreator,  workCount);
         workCount++;
        
    }

      function updateWork(uint _id, string memory _title, uint _yearCreate, string memory _describe, string memory _category, string memory _nameCreator, uint _status, uint _userId) public {
        require(_id < works.length, "Invalid work ID");
        Work storage work = works[_id];

                    // Tạo log chỉ chứa những thông tin đã thay đổi, dùng keccak tại vì trong solidity không hỗ trợ so sánh chuỗi
                string memory logContent = "Tác phẩm có những thay đổi: ";
                if (keccak256(abi.encodePacked(work.title)) != keccak256(abi.encodePacked(_title))) {
                    logContent = string(abi.encodePacked(logContent, "tên tác phẩm đổi từ '", work.title, "' thành '", _title, "', "));
                }
                if (work.yearCreate != _yearCreate) {
                    logContent = string(abi.encodePacked(logContent, "năm sáng tác đổi từ '", uint2str(work.yearCreate), "' thành '", uint2str(_yearCreate), "', "));
                }
                if (keccak256(abi.encodePacked(work.describe)) != keccak256(abi.encodePacked(_describe))) {
                    logContent = string(abi.encodePacked(logContent, "mô tả đổi từ '", work.describe, "' thành '", _describe, "', "));
                }
                if (keccak256(abi.encodePacked(work.category)) != keccak256(abi.encodePacked(_category))) {
                    logContent = string(abi.encodePacked(logContent, "thể loại đổi từ '", work.category, "' thành '", _category, "', "));
                }
                if (keccak256(abi.encodePacked(work.nameCreator)) != keccak256(abi.encodePacked(_nameCreator))) {
                    logContent = string(abi.encodePacked(logContent, "tác giả đổi từ '", work.nameCreator, "' thành '", _nameCreator, "', "));
                }
                 if (work.status != _status && _status == 3) {
                    logContent = string(abi.encodePacked(logContent, "admin đã duyệt tác phẩm"));
                }
                 if (work.status != _status && _status == 2) {
                    logContent = string(abi.encodePacked(logContent, "admin đã ẩn tác phẩm"));
                }

                // Loại bỏ dấu ',' cuối cùng nếu có
                if (bytes(logContent).length > 0 && bytes(logContent)[bytes(logContent).length - 1] == ',') {
                bytes memory trimmedBytes = new bytes(bytes(logContent).length - 2);
            for (uint i = 0; i < bytes(logContent).length - 2; i++) {
                trimmedBytes[i] = bytes(logContent)[i];
            }
            logContent = string(trimmedBytes);

                }

                // Nếu có thông tin thay đổi, thêm log và cập nhật tác phẩm
                if (bytes(logContent).length > 0) {
                    emit WorkUpdated(_id, _title, _yearCreate, _describe, _category, _nameCreator, _status, _userId);
                    _addLog(logContent, _nameCreator, _id);

                    // Cập nhật thông tin tác phẩm
                    work.title = _title;
                    work.yearCreate = _yearCreate;
                    work.describe = _describe;
                    work.category = _category;
                    work.nameCreator = _nameCreator;
                    work.status = _status;
                    work.userId = _userId;
                     // Cập nhật hash của tác phẩm
                    bytes32 hash = _calculateHash(_title, _describe, _category, _yearCreate);
                    workHashes[_id] = hash;
                }
        
    }

     function _addLog(string memory _content, string memory _sender, uint _workId) public {
        uint timestamp = block.timestamp;
        Log memory newLog = Log(logCount + 1, timestamp, _content, _sender, _workId);
        logs.push(newLog);
        emit LogAdded(logCount + 1, timestamp, _content, _sender, _workId);
        logCount++;
    }

    function getLogsCount() public view returns (uint) {
        return logCount;
    }

    function getLog(uint _index) public view returns (uint id, uint timestamp, string memory content, string memory sender, uint workId) {
        require(_index < logs.length, "Invalid log index");
        Log memory log = logs[_index];
        return (log.id, log.timestamp, log.content, log.sender, log.workId);
    }


    function getWorkCount() public view returns (uint) {
        return workCount;
    }

    function getWork(uint _id) public view returns (uint, string memory, uint, string memory, string memory, string memory, bytes32, uint) {
        //require(_id < works.length, "Invalid work ID");
        Work memory work = works[_id];
         bytes32 hash = workHashes[_id];
          return (work.id, work.title, work.yearCreate, work.describe, work.category, work.nameCreator, hash, work.userId);
    }

    function _calculateHash(string memory _title, string memory _describe, string memory _category, uint _yearCreate) public pure returns (bytes32) {
    return keccak256(abi.encodePacked(_title, _describe, _category, _yearCreate));
}

function getWorkHash(uint _id) public view returns (bytes32) {
    require(_id < works.length, "Invalid work ID");
    return workHashes[_id];
}


//Chuyển đổi từ số nguyên sang chuỗi
function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
    if (_i == 0) {
        return "0";
    }
    uint j = _i;
    uint len;
    while (j != 0) {
        len++;
        j /= 10;
    }
    bytes memory bstr = new bytes(len);
    uint k = len - 1;
    while (_i != 0) {
        bstr[k--] = byte(uint8(48 + _i % 10));
        _i /= 10;
    }
    return string(bstr);
}


 // Define a function to concatenate two strings
    function concatenateStrings(string memory _a, string memory _b) internal pure returns (string memory) {
        bytes memory _ba = bytes(_a);
        bytes memory _bb = bytes(_b);
        string memory ab = new string(_ba.length + _bb.length);
        bytes memory bab = bytes(ab);
        uint k = 0;
        for (uint i = 0; i < _ba.length; i++) bab[k++] = _ba[i];
        for (uint i = 0; i < _bb.length; i++) bab[k++] = _bb[i];
        return string(bab);
    }

    function getWorksByUserId(uint _userId) public view returns (Work[] memory) {
    uint counter = 0;
    for (uint i = 0; i < workCount; i++) {
        if (works[i].userId == _userId) {
            counter++;
        }
    }
    Work[] memory worksByUserId = new Work[](counter);
    uint index = 0;
    for (uint j = 0; j < workCount; j++) {
        if (works[j].userId == _userId) {
            worksByUserId[index] = works[j];
            index++;
        }
    }
    return worksByUserId;
}


 
    uint public productCount = 0;
    mapping(uint => Product) public products;

    struct Product {
        uint id;
        uint idWork;
        uint price;
        address payable owner;
        bool purchased;
    }

    event ProductCreated(
        uint id,
        uint idWork,
        uint price,
        address payable owner,
        bool purchased
    );

    event ProductPurchased(
        uint id,
        uint idWork,
        uint price,
        address payable owner,
        bool purchased
    );

   

    function createProduct(uint _idWork, uint _price) public {
      
        // Require a valid price
        require(_price > 0);
        // Increment product count
        productCount ++;
        // Create the product
        products[productCount] = Product(productCount, _idWork, _price, msg.sender, false);
        // Trigger an event
        emit ProductCreated(productCount, _idWork, _price, msg.sender, false);
    }

    function purchaseProduct(uint _id, uint _userId, string memory _nameCreator) public payable {
        // Fetch the product
        Product memory _product = products[_id];
        // Fetch the owner
        address payable _seller = _product.owner;
        // Make sure the product has a valid id
        require(_product.id > 0 && _product.id <= productCount);
        // Require that there is enough Ether in the transaction
        require(msg.value >= _product.price);
        // Require that the product has not been purchased already
        //require(!_product.purchased);
        // Require that the buyer is not the seller
        require(_seller != msg.sender);


 // Fetch the corresponding work
    uint workId = _product.idWork;
    Work storage _work = works[workId];
      
 // Add log for product purchase
    string memory logContent = string(abi.encodePacked(
        "Bản quyền tác phẩm đã chuyển nhượng từ ", _work.nameCreator, " sang ", _nameCreator
    ));
    _addLog(logContent, _nameCreator, workId);

    // Update userID and nameCreator in the work
    _work.userId = _userId;
    _work.nameCreator = _nameCreator;




        // Transfer ownership to the buyer
        _product.owner = msg.sender;
        // Mark as purchased
        _product.purchased = true;
        // Update the product
        products[_id] = _product;
        // Pay the seller by sending them Ether
        address(_seller).transfer(msg.value);
        // Trigger an event
        emit ProductPurchased(productCount, _product.idWork, _product.price, msg.sender, true);
    }

    function hasProductWithIdWorkAndNotPurchased(uint _idWork) public view returns (bool) {
    for (uint i = 1; i <= productCount; i++) {
        if (products[i].idWork == _idWork && !products[i].purchased) {
            return true;
        }
    }
    return false;
}

function markProductsAsPurchased(uint _idWork) public {
    //require(_idWork > 0, "Invalid ID Work");

    for (uint i = 1; i <= productCount; i++) {
        if (products[i].idWork == _idWork) {
            products[i].purchased = true;
            emit ProductPurchased(products[i].id, products[i].idWork, products[i].price, products[i].owner, true);
        }
    }
}







   
}
