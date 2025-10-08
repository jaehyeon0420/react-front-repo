import { useState } from "react";
import LeftMenu from "../common/LeftMenu";
import { Route, Routes } from "react-router-dom";
import AdminBoard from "./AdminBoard";
import AdminMember from "./AdminMember";

//MemberMain.jsx와 기본적인 구조 동일.
export default function AdminMain(){
    const [menuList, setMenuList] = useState([
        {url : "/admin/member" , text : "회원 관리"},   //회원 등급 변경
        {url : "/admin/board", text : "게시글 관리"}    //게시글 상태(공개, 비공개) 설정
    ]);

    
    return (
        <div className="mypage-wrap">
            <div className="mypage-side">
                <section className="section account-box">
                    <div className="account-info">
                        <span className="material-icons">manage_accounts</span>
                        <span className="member-name">관리자 페이지</span>
                    </div>
                </section>
                <section className="section">
                    <LeftMenu menuList={menuList} />
                </section>
            </div>
            <div className="mypage-content">
                <section className="section">
                    <Routes>
                        {/* ex) '/admin/board' 요청 시, AdminBoard로 전환 */}
                        <Route path="board" element={<AdminBoard />} />
                        <Route path="member" element={<AdminMember />} />
                    </Routes>
                </section>
            </div>
        </div>
    );
}