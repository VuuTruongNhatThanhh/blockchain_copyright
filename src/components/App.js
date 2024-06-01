// App.js
import React from "react";
import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./Header";
import WorkInterface from "./WorkInterface";
import WorkList from "./Worklist";  
import LogList from "./Admin/LogList";
import Login from "./Login";
import UserList from "./UserList";
import SignUp from "./SignUp";
import Worklist from "./Admin/WorklistAdmin";
import Header2 from "./Admin/Header2";
import CreateListAdmin from "./Admin/CreateListAdmin";
import HiddenWorkAdmin from "./Admin/HiddenWorkAdmin"
import WorkDetail from './WorkDetail'; 
import UserDetail from "./UserDetail";
import InfoAccept from "./Info_accept"
import UserProfile from "./UserProfile";
import WorkDetailAdmin from "./Admin/WorkDetailAdmin";
import UserDetailAdmin from "./Admin/UserDetailAdmin";
import UpdatelistAdmin from "./Admin/UpdateListAdmin";
import Transaction from './Transaction'
import Market from './Market'
import InfoAcceptBuy from './Info_accept_buy'


function App() {
  const location = useLocation();

  // Kiểm tra nếu đường dẫn là '/login' thì không hiển thị header
  const hideHeader = location.pathname === "/" || location.pathname === "/signup";
  const showHeader2 = location.pathname === "/work-list-admin" || location.pathname === "/create-list-admin"
  || location.pathname === "/hidden-work-admin" || location.pathname.includes("work-detail-admin")
  || location.pathname.includes("user-detail-admin") || location.pathname.includes("update-list-admin")
  || location.pathname.includes("log-list");
  return (
    <div className="App">
      {!hideHeader && !showHeader2 && <Header  />}
      {showHeader2 && <Header2 />} 
      <main>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/work-interface" element={<WorkInterface />} />
          <Route path="/work-list" element={<WorkList />} />
          <Route path="/log-list" element={<LogList />} />
          <Route path="/user-list" element={<UserList />} />
          <Route path="/user-profile/:userId" element={<UserProfile />} />

          {/* admin */}
          <Route path="/work-list-admin" element={<Worklist/>} />
          <Route path="/create-list-admin" element={<CreateListAdmin/>} />
          <Route path="/hidden-work-admin" element={<HiddenWorkAdmin/>} />
          <Route path="/work-detail-admin/:id" element={<WorkDetailAdmin/>} />
          <Route path="/user-detail-admin/:userId" element={<UserDetailAdmin/>} />
          <Route path="/update-list-admin" element={<UpdatelistAdmin/>} />

           {/* Thêm định tuyến cho trang chi tiết tác phẩm */}
           <Route path="/work/:id" element={<WorkDetail />} />
           <Route path="/userdetail/:userId" element={<UserDetail />} />

            {/* Thông báo  */}
            <Route path="/info-accept" element={<InfoAccept/>} />
            <Route path="/info-accept-buy" element={<InfoAcceptBuy/>} />

{/* mua bán */}
<Route path="/transaction/:idWork" element={<Transaction/>} />
<Route path="/market/:idWork" element={<Market/>} />


        </Routes>
      </main>
      
    </div>
  );
}

export default App;
