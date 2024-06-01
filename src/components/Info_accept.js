import React, { useState, useEffect } from 'react';
import './style/info_accept.css';
import { useNavigate } from 'react-router-dom';

function Info_accept() {
    const [countdown, setCountdown] = useState(10); // Đếm ngược từ 10 giây
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            // Giảm đếm ngược mỗi giây
            setCountdown(countdown - 1);
        }, 1000);

        // Dừng đếm ngược khi countdown đạt 0
        if (countdown === 0) {
            clearTimeout(timer);
            // Chuyển hướng trang về /work-list
            navigate('/work-list');
        }

        // Cleanup timer
        return () => clearTimeout(timer);
    }, [countdown, navigate]);

    return (
        <div className="notification-container">
            <div className="notification-content">
                <span className="notification-message">Yêu cầu đăng ký bản quyền của bạn đã được gửi thành công và đang chờ duyệt từ phía quản trị viên. Xin vui lòng chờ trong khi chúng tôi xem xét yêu cầu của bạn</span>
            </div>
            <span className="countdown-message">Sẽ tự động chuyển về trang chủ sau {countdown} giây</span>
        </div>
    );
}

export default Info_accept;
