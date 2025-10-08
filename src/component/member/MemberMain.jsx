
import { useEffect, useState } from "react";
import useUserStore from "../../store/useUserStore"; //Store import
import LeftMenu from "../common/LeftMenu";
import MemberInfo from "./MemberInfo";
import MemberPwChg from "./MemberPwChg";
import {Route, Routes, useNavigate } from "react-router-dom";
import "./member.css";

/* 기존 마이페이지와 다르게, 화면 좌측에 사이드 박스에 내 정보, 비밀번호 변경, 관리자 페이지 메뉴 리스트를 보여주고,
   클릭 시, MemberMain 컴포넌트 내부 중앙 영역만 전환되도록 처리할 것임.
   지금까지는 /main, /login, /join 처럼 URI가 1단계만 존재했음. 
   이제는 /member/info, /member/pwChg와 같이, 2단계로 작성하 것임.

   브라우저 주소창이 => /member로 시작되는 주소로 변경되면, MemberMain 랜더링.
   이후, Link를 사용하여 내 정보 또는 비밀번호 변경 클릭 시, /member/info 또는 /member/pwChg로 변경됨.
   주소창이 /member로 시작되었으므로 MemberMain이 먼저 랜더링되고, 내부에 /member/info 또는 /member/pwChg로
   등록된 컴포넌트가 라우트 등록한 위치에 랜더링 됨.
*/
export default function MemberMain() {
    const {loginMember} = useUserStore();
    
    //화면 좌측에 보여질 메뉴 리스트
    const [menuList, setMenuList] = useState([
        {url : "/member/info" , text : "내 정보"},
        {url : "/member/pwChg", text : "비밀번호 변경"}
    ]);


    //컴포넌트 전환을 위함.
    const navigate = useNavigate();

    useEffect(function(){
        //관리자인 경우, 메뉴 정보 추가
        if(loginMember.memberLevel == 1){
            setMenuList([...menuList, {url : "/admin/board", text : "관리자 페이지"}]);
        }


        //헤더에서 마이페이지 클릭하면 MemberMain만 랜더링 되어지므로, 중앙 영역이 비워져있음.
        //MemberMain 랜더링 후, 좌측 메뉴 중 첫번 째 메뉴(내 정보[MemberInfo])가 랜더링되도록 처리.
        navigate('/member/info');
    },[]);



    return(
        <div className="mypage-wrap">
            <div className="mypage-side">
                <section className="section account-box">
                    <div className="account-info">
                        {loginMember.memberLevel == 1 ? 
                        <span className="material-icons">account_circle</span> : 
                        <span className="material-icons">settings</span>}
                        <span>MYPAGE</span>
                    </div>
                </section>
                <section className="section">
                    {/* 관리자 or 일반 모두 동일하여 별도 컴포넌트로 처리 및 재사용 */}
                    <LeftMenu menuList={menuList} />
                </section>
            </div>
            <div className="mypage-content">
                {/* 서브 라우팅한 컴포넌트를 표출할 영역 
                    요청 path = '/member/info' => MemberInfo 전환
                    요청 path = '/member/pwChg' => MemberPwChg 전환
                */}
                <Routes>
                    <Route path='info' element={<MemberInfo />} />
                    <Route path='pwChg' element={<MemberPwChg />} />
                </Routes>
            </div>
        </div>
    );
}