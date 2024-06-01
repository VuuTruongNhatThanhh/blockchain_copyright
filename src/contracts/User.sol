// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;


contract User {
    struct UserData {
        uint userId;
        string username;
        string password;
        string name;
        string citizenID;
        string birthDay;
        string email;
        uint role;
    }

    mapping(uint => UserData) private usersByUserId;
    mapping(string => UserData) private usersByUsername;
    uint private nextUserId = 1;

     function registerUser(string memory _username, string memory _password, string memory _name, string memory _citizenID, string memory _birthDay, string memory _email, uint _role) public {
        require(bytes(usersByUsername[_username].username).length == 0, "Username already exists");

       
        UserData memory newUser = UserData(nextUserId, _username, _password, _name, _citizenID,_birthDay,_email, _role);
        usersByUserId[nextUserId] = newUser;
        usersByUsername[_username] = newUser;
        nextUserId++;
    }

    function login(string memory _username, string memory _password) public view returns (bool) {
        UserData memory user = usersByUsername[_username];
        if (bytes(user.username).length == 0) {
            return false; // User not found
        }
        
        return hashPassword(_password) == hashPassword(user.password);
    }

    function getUserByUsername(string memory _username) public view returns (uint, string memory, string memory, string memory, string memory, uint,string memory,string memory) {
        UserData memory user = usersByUsername[_username];
        return (user.userId, user.username, "********", user.name, user.citizenID, user.role, user.birthDay, user.email); // Trả về mật khẩu dưới dạng dấu sao
    }

  function getUserCount() public view returns (uint) {
    return nextUserId - 1; // Số lượng người dùng là nextUserId trừ đi 1 (do nextUserId bắt đầu từ 1)
}

function getUser(uint _userId) public view returns (uint, string memory, string memory, string memory, string memory, uint,string memory,string memory) {
    UserData memory user = usersByUserId[_userId];
    return (user.userId, user.username, "********", user.name, user.citizenID, user.role, user.birthDay, user.email); // Trả về mật khẩu dưới dạng dấu sao
}


      // Mã hóa mật khẩu
    function hashPassword(string memory _password) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_password));
    }
}
